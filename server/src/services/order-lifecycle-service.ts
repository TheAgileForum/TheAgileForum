import { prisma } from "../db/client.js";
import type { SessionClaims } from "./auth-service.js";
import { addCartItem, getOrCreateActiveCart } from "./cart-service.js";
import type { PricingHttpInput } from "../pricing/pricing-service.js";

/** Unpaid / abandoned statuses a learner may cancel or resume. */
const ABANDONED_ORDER_STATUSES = new Set(["checkout_started", "created"]);

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

export function isAbandonedOrderStatus(status: string): boolean {
  return ABANDONED_ORDER_STATUSES.has(normalizeStatus(status));
}

/**
 * Soft-cancel an abandoned order owned by the user.
 * Never cancels paid (or other terminal) orders.
 */
export async function cancelAbandonedOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) {
    return {
      ok: false as const,
      error: { code: "ORDER_NOT_FOUND" as const, message: "Order not found" },
    };
  }

  if (!isAbandonedOrderStatus(order.status)) {
    return {
      ok: false as const,
      error: {
        code: "ORDER_NOT_CANCELLABLE" as const,
        message: "Only unpaid checkout orders can be deleted",
      },
    };
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "cancelled" },
  });

  // Release linked cart stuck in checkout so the learner can start fresh.
  if (order.cartId) {
    await prisma.cart.updateMany({
      where: {
        id: order.cartId,
        userId,
        status: "checkout_in_progress",
      },
      data: { status: "active" },
    });
  }

  return {
    ok: true as const,
    order: { id: updated.id, status: updated.status },
  };
}

/**
 * Prepare the learner's cart so they can continue checkout for an abandoned order.
 * Prefer reactivating the order's linked cart; otherwise rebuild lines from the order.
 */
export async function resumeAbandonedOrderCheckout(
  auth: SessionClaims,
  orderId: string,
  pricingInput?: PricingHttpInput,
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: auth.userId },
    include: { items: true },
  });

  if (!order) {
    return {
      ok: false as const,
      error: { code: "ORDER_NOT_FOUND" as const, message: "Order not found" },
    };
  }

  if (!isAbandonedOrderStatus(order.status)) {
    return {
      ok: false as const,
      error: {
        code: "ORDER_NOT_RESUMABLE" as const,
        message: "Only unpaid checkout orders can be resumed",
      },
    };
  }

  if (order.cartId) {
    const linked = await prisma.cart.findFirst({
      where: { id: order.cartId, userId: auth.userId },
      include: { items: true },
    });

    if (linked && linked.status !== "completed" && linked.items.length > 0) {
      // Reactivate; updatedAt bump makes getOrCreateActiveCart prefer this cart.
      await prisma.cart.update({
        where: { id: linked.id },
        data: { status: "active" },
      });
      return { ok: true as const, cartId: linked.id };
    }
  }

  const cart = await getOrCreateActiveCart(auth);
  if (cart.items.length === 0) {
    for (const item of order.items) {
      const added = await addCartItem(
        auth,
        {
          offeringCode: item.offeringCode,
          quantity: item.quantity,
        },
        pricingInput,
      );
      if (!added.ok) {
        return {
          ok: false as const,
          error: added.error,
        };
      }
    }
  }

  return { ok: true as const, cartId: cart.id };
}
