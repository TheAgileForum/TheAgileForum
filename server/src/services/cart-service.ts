import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/client.js";
import { getOfferingFromCatalog } from "../catalog/catalog-repository.js";
import { validateAddToCartLine } from "../commerce/checkout-policy.js";
import type { SessionClaims } from "./auth-service.js";
import {
  parsePricingInputFromRequest,
  quoteOfferingPrice,
  resolveCartLineTotals,
  resolveCurrencyContext,
  type PricingHttpInput,
} from "../pricing/pricing-service.js";
import type { Request } from "express";

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

export function pricingInputFromRequest(req: Request): PricingHttpInput {
  return parsePricingInputFromRequest(req);
}

export async function addCartItem(
  auth: SessionClaims,
  input: {
    offeringCode: string;
    scheduleRef?: string;
    quantity?: number;
  },
  pricingInput?: PricingHttpInput,
) {
  const offering = await getOfferingFromCatalog(input.offeringCode);
  if (!offering) {
    return {
      ok: false as const,
      error: {
        code: "UNKNOWN_OFFERING",
        message: `Offering ${input.offeringCode} is not in catalog`,
      },
    };
  }

  const policyError = validateAddToCartLine(input, offering);
  if (policyError) {
    return { ok: false as const, error: policyError };
  }

  const context = resolveCurrencyContext(pricingInput ?? { geo: "US" });
  const quoted = quoteOfferingPrice(offering, context);
  const cart = await getOrCreateActiveCart(auth);
  const scheduleRef = input.scheduleRef?.trim() || null;
  const quantity = input.quantity ?? 1;

  if (cart.currency !== context.currency) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { currency: context.currency },
    });
    cart.currency = context.currency;
  }

  const existingLine = cart.items.find(
    (item) =>
      item.offeringCode === input.offeringCode &&
      (item.scheduleRef ?? null) === scheduleRef,
  );

  const item = existingLine
    ? await prisma.cartItem.update({
        where: { id: existingLine.id },
        data: {
          quantity: existingLine.quantity + quantity,
          unitPrice: new Decimal(quoted.amount),
          currency: context.currency,
        },
      })
    : await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          offeringCode: input.offeringCode,
          scheduleRef,
          quantity,
          unitPrice: new Decimal(quoted.amount),
          currency: context.currency,
        },
      });

  return { ok: true as const, cartId: cart.id, item };
}

export async function removeCartItem(auth: SessionClaims, itemId: string) {
  const cart = await getOrCreateActiveCart(auth);
  const line = cart.items.find((i) => i.id === itemId);
  if (!line) {
    return {
      ok: false as const,
      error: { code: "CART_ITEM_NOT_FOUND", message: "Cart line not found" },
    };
  }
  await prisma.cartItem.delete({ where: { id: itemId } });
  return { ok: true as const };
}

export async function updateCartItemQuantity(
  auth: SessionClaims,
  itemId: string,
  quantity: number,
) {
  const cart = await getOrCreateActiveCart(auth);
  const line = cart.items.find((i) => i.id === itemId);
  if (!line) {
    return {
      ok: false as const,
      error: { code: "CART_ITEM_NOT_FOUND", message: "Cart line not found" },
    };
  }
  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return { ok: true as const, removed: true as const };
  }
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return { ok: true as const, removed: false as const };
}

export async function serializeCart(
  cart: Awaited<ReturnType<typeof getOrCreateActiveCart>>,
  pricingInput?: PricingHttpInput,
) {
  const context = resolveCurrencyContext(pricingInput ?? { geo: "US" });
  const totals = await resolveCartLineTotals(
    cart.items.map((item) => ({
      offeringCode: item.offeringCode,
      quantity: item.quantity,
    })),
    context,
    async (code) => (await getOfferingFromCatalog(code)) ?? null,
  );

  const pricedByCode = new Map(
    totals.lines.map((line) => [line.offeringCode, line]),
  );
  const lineCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    status: cart.status,
    currency: totals.currency,
    lineCount,
    subtotal: totals.subtotal,
    currencyContext: {
      currency: context.currency,
      geoDetected: context.geoDetected,
      source: context.source,
    },
    items: cart.items.map((item) => {
      const priced = pricedByCode.get(item.offeringCode);
      return {
        id: item.id,
        offeringCode: item.offeringCode,
        scheduleRef: item.scheduleRef,
        quantity: item.quantity,
        unitPrice: priced?.unitPrice ?? item.unitPrice.toString(),
        currency: priced?.currency ?? totals.currency,
        lineTotal: priced?.lineTotal,
      };
    }),
  };
}
