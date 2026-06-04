import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/client.js";
import { getOffering } from "../catalog/offerings.js";
import {
  cartHasSafeOrgEligibleItem,
  validateOrgReimbursement,
  type OrgReimbursementInput,
} from "../commerce/checkout-policy.js";
import { publishEnrollmentNotifications } from "./order-notification-service.js";
import type { SessionClaims } from "./auth-service.js";
import { getOrCreateActiveCart, serializeCart } from "./cart-service.js";
import { createCheckoutSession } from "./stripe-checkout-service.js";

export type CheckoutVariant = "standard" | "org_reimbursement";

function nextOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  return `ORD-${stamp}`;
}

export async function startCheckout(
  auth: SessionClaims,
  input: {
    variant?: CheckoutVariant;
    orgReimbursement?: OrgReimbursementInput;
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

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: nextOrderNumber(),
        userId: auth.userId,
        tenantId: auth.tenantId,
        cartId: cart.id,
        status: "checkout_started",
        currency: cart.currency,
        totalAmount: new Decimal(totalAmount.toFixed(2)),
        items: {
          create: cart.items.map((item) => ({
            offeringCode: item.offeringCode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            currency: item.currency,
          })),
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
  if (variant === "standard") {
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

  return {
    ok: true as const,
    checkout: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      variant,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      currency: order.currency,
      cart: serializeCart(cart),
      orgReimbursement:
        variant === "org_reimbursement" ? input.orgReimbursement : undefined,
      stripeCheckoutUrl,
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
    items: order.items.map((item) => ({
      offeringCode: item.offeringCode,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      currency: item.currency,
      title: getOffering(item.offeringCode)?.title ?? item.offeringCode,
    })),
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
