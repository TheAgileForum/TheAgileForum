import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/client.js";
import { getOffering } from "../catalog/offerings.js";
import { validateAddToCartLine } from "../commerce/checkout-policy.js";
import type { SessionClaims } from "./auth-service.js";

export async function getOrCreateActiveCart(auth: SessionClaims) {
  const existing = await prisma.cart.findFirst({
    where: { userId: auth.userId, status: "active" },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: {
      userId: auth.userId,
      tenantId: auth.tenantId,
      status: "active",
      currency: "USD",
    },
    include: { items: true },
  });
}

export async function addCartItem(
  auth: SessionClaims,
  input: {
    offeringCode: string;
    scheduleRef?: string;
    quantity?: number;
  },
) {
  const policyError = validateAddToCartLine(input);
  if (policyError) {
    return { ok: false as const, error: policyError };
  }

  const offering = getOffering(input.offeringCode)!;
  const cart = await getOrCreateActiveCart(auth);
  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      offeringCode: input.offeringCode,
      scheduleRef: input.scheduleRef?.trim() || null,
      quantity: input.quantity ?? 1,
      unitPrice: new Decimal(offering.defaultUnitPrice),
      currency: offering.currency,
    },
  });

  return { ok: true as const, cartId: cart.id, item };
}

export function serializeCart(
  cart: Awaited<ReturnType<typeof getOrCreateActiveCart>>,
) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );
  return {
    id: cart.id,
    status: cart.status,
    currency: cart.currency,
    subtotal: subtotal.toFixed(2),
    items: cart.items.map((item) => ({
      id: item.id,
      offeringCode: item.offeringCode,
      scheduleRef: item.scheduleRef,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      currency: item.currency,
    })),
  };
}
