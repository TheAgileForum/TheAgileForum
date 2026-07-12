import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/client.js";
import { getOfferingFromCatalog } from "../catalog/catalog-repository.js";
import {
  cartHasSafeOrgEligibleItem,
  validateOrgReimbursement,
  type OrgReimbursementInput,
} from "../commerce/checkout-policy.js";
import { publishEnrollmentNotifications } from "./order-notification-service.js";
import type { CommerceJourneyOrigin } from "../commerce/journey-origin.js";
import type { SessionClaims } from "./auth-service.js";
import { getOrCreateActiveCart, serializeCart } from "./cart-service.js";
import type { PricingHttpInput } from "../pricing/pricing-service.js";
import {
  buildInstallmentPlans,
  quoteOfferingPrice,
  resolveCartLineTotals,
  resolveCurrencyContext,
} from "../pricing/pricing-service.js";
import {
  resolvePaymentModes,
  type InstallmentProvider,
  type PaymentMode,
} from "../commerce/payment-mode.js";
import {
  createCheckoutSession,
  fetchStripeCheckoutSession,
  type StripeCheckoutMode,
} from "./stripe-checkout-service.js";
import {
  createRazorpayCheckoutSession,
  getRazorpayKeySecret,
  type RazorpayCheckoutSession,
} from "./razorpay-checkout-service.js";
import { verifyPaymentSignature } from "../integrations/razorpay-api.js";
import {
  trackCheckoutConfirmed,
  trackCheckoutStarted,
  trackNamedProductEvent,
} from "../observability/commerce-analytics.js";
import {
  clearAppliedCoupon,
  computeAdjustedTotal,
  computeDiscountAmount,
  getAppliedCouponCode,
  validateStubCouponCode,
} from "../commerce/coupon-service.js";

export type CheckoutVariant = "standard" | "org_reimbursement";

function resolveCheckoutPaymentSelection(input: {
  variant: CheckoutVariant;
  paymentMode?: PaymentMode;
  installmentProvider?: InstallmentProvider;
  geo: string;
}): { paymentMode: PaymentMode; installmentProvider: InstallmentProvider | null } {
  if (input.variant !== "standard") {
    return { paymentMode: "full_pay", installmentProvider: null };
  }

  const modes = resolvePaymentModes(input.geo);
  const requestedMode = input.paymentMode ?? "full_pay";

  if (requestedMode === "installment" && modes.availableModes.includes("installment")) {
    const provider =
      input.installmentProvider &&
      modes.installmentProviders.includes(input.installmentProvider)
        ? input.installmentProvider
        : (modes.installmentProviders[0] ?? null);
    if (provider) {
      return { paymentMode: "installment", installmentProvider: provider };
    }
  }

  return { paymentMode: "full_pay", installmentProvider: null };
}

function nextOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  return `ORD-${stamp}`;
}

export async function startCheckout(
  auth: SessionClaims,
  input: {
    variant?: CheckoutVariant;
    orgReimbursement?: OrgReimbursementInput;
    commerceJourneyOrigin?: CommerceJourneyOrigin;
    pricingInput?: PricingHttpInput;
    paymentMode?: PaymentMode;
    installmentProvider?: InstallmentProvider;
  },
) {
  const cart = await getOrCreateActiveCart(auth);
  if (cart.items.length === 0) {
    return {
      ok: false as const,
      error: {
        code: "EMPTY_CART",
        message: "Cart has no items",
      },
    };
  }

  const variant = input.variant ?? "standard";
  const offeringCodes = cart.items.map((i) => i.offeringCode);

  if (variant === "org_reimbursement") {
    if (!cartHasSafeOrgEligibleItem(offeringCodes)) {
      return {
        ok: false as const,
        error: {
          code: "ORG_CHECKOUT_NOT_ELIGIBLE",
          message: "Organization reimbursement is only available for eligible SAFe offerings",
        },
      };
    }
    if (!input.orgReimbursement) {
      return {
        ok: false as const,
        error: {
          code: "ORG_DETAILS_REQUIRED",
          message: "Organization reimbursement details are required",
        },
      };
    }
    const orgError = validateOrgReimbursement(input.orgReimbursement);
    if (orgError) {
      return { ok: false as const, error: orgError };
    }
  }

  const pricingInput = input.pricingInput ?? { geo: "US" };
  const context = resolveCurrencyContext(pricingInput);
  const paymentSelection = resolveCheckoutPaymentSelection({
    variant,
    paymentMode: input.paymentMode,
    installmentProvider: input.installmentProvider,
    geo: context.geoDetected,
  });
  const priced = await resolveCartLineTotals(
    cart.items.map((item) => ({
      offeringCode: item.offeringCode,
      quantity: item.quantity,
    })),
    context,
    async (code) => (await getOfferingFromCatalog(code)) ?? null,
  );
  const pricedByCode = new Map(
    priced.lines.map((line) => [line.offeringCode, line]),
  );

  let orderTotal = priced.subtotal;
  const appliedCouponCode = getAppliedCouponCode(cart.id);
  if (appliedCouponCode) {
    const coupon = validateStubCouponCode(appliedCouponCode);
    if (coupon.ok) {
      const discountApplied = computeDiscountAmount(priced.subtotal, coupon.percentOff);
      orderTotal = computeAdjustedTotal(priced.subtotal, discountApplied);
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: nextOrderNumber(),
        userId: auth.userId,
        tenantId: auth.tenantId,
        cartId: cart.id,
        status: "checkout_started",
        currency: priced.currency,
        totalAmount: new Decimal(orderTotal),
        items: {
          create: cart.items.map((item) => {
            const line = pricedByCode.get(item.offeringCode);
            return {
              offeringCode: item.offeringCode,
              quantity: item.quantity,
              unitPrice: new Decimal(line?.unitPrice ?? item.unitPrice.toString()),
              currency: line?.currency ?? priced.currency,
            };
          }),
        },
      },
      include: { items: true },
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: { status: "checkout_in_progress" },
    });

    return created;
  });

  let stripeCheckoutUrl: string | null = null;
  let stripePaymentRef: string | null = null;
  let stripeCheckout:
    | { mode: StripeCheckoutMode; sessionId: string; checkoutUrl: string }
    | undefined;
  let razorpayCheckoutUrl: string | null = null;
  let razorpayPaymentRef: string | null = null;
  let razorpayEmiPlans:
    | Array<{ provider: string; monthlyAmount: string; currency: string }>
    | undefined;
  let razorpaySession: RazorpayCheckoutSession | null = null;
  let paymentProvider: "stripe" | "razorpay" | null = null;

  async function bindStripeSession(
    session: NonNullable<Awaited<ReturnType<typeof createCheckoutSession>>>,
  ) {
    stripeCheckoutUrl = session.checkoutUrl;
    stripePaymentRef = session.paymentRef;
    stripeCheckout = {
      mode: session.mode,
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
    };
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: session.paymentRef },
    });
    return session;
  }

  async function bindRazorpaySession(
    session: RazorpayCheckoutSession,
  ): Promise<RazorpayCheckoutSession> {
    razorpayCheckoutUrl = session.checkoutUrl;
    razorpayPaymentRef = session.paymentRef;
    if (session.paymentRef) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentRef: session.paymentRef },
      });
    }
    return session;
  }

  if (
    variant === "standard" &&
    paymentSelection.paymentMode === "installment" &&
    paymentSelection.installmentProvider === "razorpay_emi" &&
    resolvePaymentModes(context.geoDetected).installmentProviders.includes("razorpay_emi")
  ) {
    paymentProvider = "razorpay";
    razorpayEmiPlans = buildInstallmentPlans(
      priced.subtotal,
      priced.currency,
      context.geoDetected,
    );
    razorpaySession = await bindRazorpaySession(
      await createRazorpayCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount.toString(),
        currency: order.currency,
        paymentMode: "installment",
      }),
    );
  } else if (variant === "standard" && paymentSelection.paymentMode === "full_pay") {
    const paymentModes = resolvePaymentModes(context.geoDetected);
    paymentProvider = paymentModes.fullPayProvider;

    if (paymentModes.fullPayProvider === "razorpay") {
      razorpaySession = await bindRazorpaySession(
        await createRazorpayCheckoutSession({
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount.toString(),
          currency: order.currency,
          paymentMode: "full_pay",
        }),
      );
    } else {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { email: true },
      });
      try {
        const stripeSession = await createCheckoutSession({
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount.toString(),
          currency: order.currency,
          customerEmail: user?.email,
        });
        if (stripeSession) {
          await bindStripeSession(stripeSession);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Stripe checkout is temporarily unavailable";
        return {
          ok: false as const,
          error: {
            code: "STRIPE_CHECKOUT_FAILED",
            message,
            retryable: true,
          },
        };
      }
    }
  }

  void trackCheckoutStarted({
    distinctId: auth.userId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    variant,
    currency: order.currency,
    totalAmount: order.totalAmount.toString(),
    commerceJourneyOrigin: input.commerceJourneyOrigin ?? null,
  });

  if (
    paymentSelection.paymentMode === "installment" &&
    paymentSelection.installmentProvider
  ) {
    void trackNamedProductEvent("installment_checkout_started", auth.userId, {
      order_id: order.id,
      provider: paymentSelection.installmentProvider,
      currency: order.currency,
      commerce_journey_origin: input.commerceJourneyOrigin ?? null,
    });
  }

  const razorpayCheckoutPayload = razorpaySession
    ? {
        mode: razorpaySession.mode,
        keyId: razorpaySession.keyId,
        amountMinor: razorpaySession.amountMinor,
        currency: razorpaySession.currency,
        providerOrderId: razorpaySession.providerOrderId,
      }
    : undefined;

  return {
    ok: true as const,
    checkout: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      variant,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      currency: order.currency,
      cart: await serializeCart(cart, pricingInput),
      orgReimbursement:
        variant === "org_reimbursement" ? input.orgReimbursement : undefined,
      paymentProvider,
      stripeCheckoutUrl,
      stripePaymentRef,
      stripeCheckout,
      razorpayCheckoutUrl,
      razorpayPaymentRef,
      razorpayCheckout: razorpayCheckoutPayload,
      razorpayEmiPlans,
      commerceJourneyOrigin: input.commerceJourneyOrigin ?? null,
      paymentMode: paymentSelection.paymentMode,
      installmentProvider: paymentSelection.installmentProvider,
    },
  };
}

async function markOrderPaid(
  order: { id: string; orderNumber: string; cartId: string | null; status: string },
  paymentRef: string,
) {
  if (order.cartId) {
    clearAppliedCoupon(order.cartId);
  }
  return prisma.$transaction(async (tx) => {
    const row = await tx.order.update({
      where: { id: order.id },
      data: { status: "paid", paymentRef },
      include: { items: true },
    });

    if (order.cartId) {
      await tx.cart.update({
        where: { id: order.cartId },
        data: { status: "completed" },
      });
    }

    return row;
  });
}

async function deliverPaidOrderNotifications(
  order: Awaited<ReturnType<typeof markOrderPaid>>,
) {
  await publishEnrollmentNotifications({
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    tenantId: order.tenantId,
    items: await Promise.all(
      order.items.map(async (item) => {
        const offering = await getOfferingFromCatalog(item.offeringCode);
        return {
          offeringCode: item.offeringCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          currency: item.currency,
          title: offering?.title ?? item.offeringCode,
        };
      }),
    ),
  });
}

export async function getRazorpayCheckoutConfig(auth: SessionClaims, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: auth.userId },
  });
  if (!order) {
    return {
      ok: false as const,
      error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
    };
  }
  const pendingRef = order.paymentRef ?? "";
  const match = pendingRef.match(/^razorpay:pending:(.+)$/);
  if (!match) {
    return {
      ok: false as const,
      error: {
        code: "RAZORPAY_SESSION_NOT_FOUND",
        message: "No active Razorpay checkout session for this order",
      },
    };
  }

  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  if (!keyId) {
    return {
      ok: false as const,
      error: {
        code: "RAZORPAY_NOT_CONFIGURED",
        message: "Razorpay sandbox keys are not configured",
      },
    };
  }

  const amountMinor = Math.round(Number(order.totalAmount) * 100);

  return {
    ok: true as const,
    config: {
      mode: "live" as const,
      keyId,
      amountMinor,
      currency: order.currency,
      providerOrderId: match[1],
      orderNumber: order.orderNumber,
    },
  };
}

export async function completeOrderFromRazorpayPayment(input: {
  auth: SessionClaims;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMode?: PaymentMode;
}) {
  const secret = getRazorpayKeySecret();
  if (!secret) {
    return {
      ok: false as const,
      error: {
        code: "RAZORPAY_NOT_CONFIGURED",
        message: "Razorpay is not configured",
      },
    };
  }

  const valid = verifyPaymentSignature({
    orderId: input.razorpayOrderId,
    paymentId: input.razorpayPaymentId,
    signature: input.razorpaySignature,
    secret,
  });
  if (!valid) {
    return {
      ok: false as const,
      error: {
        code: "RAZORPAY_SIGNATURE_INVALID",
        message: "Payment signature verification failed",
      },
    };
  }

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId: input.auth.userId },
    include: { items: true },
  });
  if (!order) {
    return {
      ok: false as const,
      error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
    };
  }

  if (order.status === "paid") {
    return {
      ok: true as const,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentRef: order.paymentRef,
        alreadyCompleted: true,
      },
    };
  }

  const paymentRef = `razorpay:${input.razorpayOrderId}:${input.razorpayPaymentId}`;
  const updated = await markOrderPaid(order, paymentRef);
  await deliverPaidOrderNotifications(updated);

  const mode = input.paymentMode ?? "full_pay";
  void trackCheckoutConfirmed({
    distinctId: input.auth.userId,
    orderId: updated.id,
    orderNumber: updated.orderNumber,
    currency: updated.currency,
    paymentMode: mode,
  });
  if (mode === "installment") {
    void trackNamedProductEvent("installment_checkout_completed", input.auth.userId, {
      order_id: updated.id,
      provider: "razorpay_emi",
      currency: updated.currency,
    });
  }

  return {
    ok: true as const,
    order: {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      paymentRef: updated.paymentRef,
      alreadyCompleted: false,
    },
  };
}

export async function completeOrderFromRazorpayWebhook(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  internalOrderId?: string;
}) {
  const order = input.internalOrderId
    ? await prisma.order.findUnique({
        where: { id: input.internalOrderId },
        include: { items: true },
      })
    : await prisma.order.findFirst({
        where: { paymentRef: `razorpay:pending:${input.razorpayOrderId}` },
        include: { items: true },
      });

  if (!order) {
    return {
      ok: false as const,
      error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
    };
  }

  if (order.status === "paid") {
    return {
      ok: true as const,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentRef: order.paymentRef,
        alreadyCompleted: true,
      },
    };
  }

  const paymentRef = `razorpay:${input.razorpayOrderId}:${input.razorpayPaymentId}`;
  const updated = await markOrderPaid(order, paymentRef);
  await deliverPaidOrderNotifications(updated);

  return {
    ok: true as const,
    order: {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      paymentRef: updated.paymentRef,
      alreadyCompleted: false,
    },
  };
}

export async function completeOrderFromStripeWebhook(input: {
  orderId: string;
  stripeSessionId: string;
  stripeEventId: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });

  if (!order) {
    return {
      ok: false as const,
      error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
    };
  }

  if (order.status === "paid") {
    return {
      ok: true as const,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentRef: order.paymentRef,
        alreadyCompleted: true,
      },
    };
  }

  const paymentRef = `stripe:${input.stripeSessionId}:${input.stripeEventId}`;
  const updated = await markOrderPaid(order, paymentRef);
  await deliverPaidOrderNotifications(updated);

  return {
    ok: true as const,
    order: {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      paymentRef: updated.paymentRef,
      alreadyCompleted: false,
    },
  };
}

export async function completeOrderFromStripePayment(input: {
  auth: SessionClaims;
  orderId: string;
  stripeSessionId: string;
}) {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return {
      ok: false as const,
      error: {
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is not configured",
      },
    };
  }

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId: input.auth.userId },
    include: { items: true },
  });
  if (!order) {
    return {
      ok: false as const,
      error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
    };
  }

  if (order.status === "paid") {
    return {
      ok: true as const,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentRef: order.paymentRef,
        alreadyCompleted: true,
      },
    };
  }

  const pendingRef = order.paymentRef ?? "";
  const pendingMatch = pendingRef.match(/^stripe:pending:(.+)$/);
  if (pendingMatch && pendingMatch[1] !== input.stripeSessionId) {
    return {
      ok: false as const,
      error: {
        code: "STRIPE_SESSION_MISMATCH",
        message: "Stripe session does not match this order",
      },
    };
  }

  let session;
  try {
    session = await fetchStripeCheckoutSession(input.stripeSessionId);
  } catch {
    return {
      ok: false as const,
      error: {
        code: "STRIPE_SESSION_LOOKUP_FAILED",
        message: "Could not verify Stripe checkout session",
      },
    };
  }

  const sessionOrderId =
    session.metadata?.order_id ?? session.client_reference_id ?? undefined;
  if (sessionOrderId && sessionOrderId !== order.id) {
    return {
      ok: false as const,
      error: {
        code: "STRIPE_SESSION_MISMATCH",
        message: "Stripe session belongs to a different order",
      },
    };
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return {
      ok: false as const,
      error: {
        code: "STRIPE_PAYMENT_INCOMPLETE",
        message: "Stripe payment is not complete yet",
      },
    };
  }

  const paymentRef = `stripe:${input.stripeSessionId}:confirm`;
  const updated = await markOrderPaid(order, paymentRef);
  await deliverPaidOrderNotifications(updated);

  void trackCheckoutConfirmed({
    distinctId: input.auth.userId,
    orderId: updated.id,
    orderNumber: updated.orderNumber,
    currency: updated.currency,
    paymentMode: "full_pay",
  });

  return {
    ok: true as const,
    order: {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      paymentRef: updated.paymentRef,
      alreadyCompleted: false,
    },
  };
}

export async function completeCheckout(
  auth: SessionClaims,
  orderId: string,
  paymentRef?: string,
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: auth.userId },
    include: { items: true },
  });

  if (!order) {
    return {
      ok: false as const,
      error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
    };
  }

  if (order.status === "paid") {
    return {
      ok: true as const,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        alreadyCompleted: true,
      },
    };
  }

  const updated = await markOrderPaid(
    order,
    paymentRef ?? `stub-${order.orderNumber}`,
  );
  await deliverPaidOrderNotifications(updated);

  void trackCheckoutConfirmed({
    distinctId: auth.userId,
    orderId: updated.id,
    orderNumber: updated.orderNumber,
    currency: updated.currency,
    paymentMode: "full_pay",
  });

  return {
    ok: true as const,
    order: {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      paymentRef: updated.paymentRef,
      alreadyCompleted: false,
    },
  };
}
