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
  quoteOfferingPrice,
  resolveCartLineTotals,
  resolveCurrencyContext,
} from "../pricing/pricing-service.js";
import {
  resolvePaymentModes,
  type InstallmentProvider,
  type PaymentMode,
} from "../commerce/payment-mode.js";
import { createCheckoutSession } from "./stripe-checkout-service.js";
import { createRazorpayCheckoutSession } from "./razorpay-checkout-service.js";
import {
  trackCheckoutConfirmed,
  trackCheckoutStarted,
  trackNamedProductEvent,
} from "../observability/commerce-analytics.js";

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

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: nextOrderNumber(),
        userId: auth.userId,
        tenantId: auth.tenantId,
        cartId: cart.id,
        status: "checkout_started",
        currency: priced.currency,
        totalAmount: new Decimal(priced.subtotal),
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
  let razorpayCheckoutUrl: string | null = null;
  let razorpayPaymentRef: string | null = null;
  let razorpayEmiPlans:
    | Array<{ provider: string; monthlyAmount: string; currency: string }>
    | undefined;
  let paymentProvider: "stripe" | "razorpay" | null = null;

  if (
    variant === "standard" &&
    paymentSelection.paymentMode === "installment" &&
    paymentSelection.installmentProvider === "razorpay_emi" &&
    resolvePaymentModes(context.geoDetected).installmentProviders.includes("razorpay_emi")
  ) {
    paymentProvider = "razorpay";
    const subtotalAmount = Number.parseFloat(priced.subtotal);
    if (subtotalAmount > 0) {
      razorpayEmiPlans = [
        {
          provider: "razorpay_emi",
          monthlyAmount: (subtotalAmount / 6).toFixed(2),
          currency: priced.currency,
        },
      ];
    }
    const stubSession = await createRazorpayCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount.toString(),
      currency: order.currency,
    });
    razorpayCheckoutUrl = stubSession.checkoutUrl;
    razorpayPaymentRef = stubSession.paymentRef;
  } else if (variant === "standard" && paymentSelection.paymentMode === "full_pay") {
    const paymentModes = resolvePaymentModes(context.geoDetected);
    paymentProvider = paymentModes.fullPayProvider;

    if (paymentModes.fullPayProvider === "razorpay") {
      const razorpaySession = await createRazorpayCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount.toString(),
        currency: order.currency,
      });
      razorpayCheckoutUrl = razorpaySession.checkoutUrl;
      razorpayPaymentRef = razorpaySession.paymentRef;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { email: true },
      });
      const stripeSession = await createCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount.toString(),
        currency: order.currency,
        customerEmail: user?.email,
      });
      stripeCheckoutUrl = stripeSession?.checkoutUrl ?? null;
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
      razorpayCheckoutUrl,
      razorpayPaymentRef,
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
