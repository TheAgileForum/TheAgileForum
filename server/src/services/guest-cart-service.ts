import { randomUUID } from "node:crypto";
import type { Response } from "express";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/client.js";
import { getOfferingFromCatalog } from "../catalog/catalog-repository.js";
import { validateAddToCartLine } from "../commerce/checkout-policy.js";
import {
  GUEST_CART_COOKIE_MAX_AGE_MS,
  GUEST_CART_COOKIE_NAME,
} from "../constants/platform.js";
import { getEnv } from "../config/env.js";
import type { SessionClaims } from "./auth-service.js";
import {
  getOrCreateActiveCart,
  serializeCart,
} from "./cart-service.js";
import {
  parsePricingInputFromRequest,
  quoteOfferingPrice,
  resolveCartLineTotals,
  resolveCurrencyContext,
  type PricingHttpInput,
} from "../pricing/pricing-service.js";
import type { Request } from "express";

type GuestCartWithItems = Awaited<ReturnType<typeof getActiveGuestCartByToken>>;

function scheduleKey(scheduleRef: string | null | undefined): string {
  return scheduleRef?.trim() || "";
}

export function pricingInputFromRequest(req: Request): PricingHttpInput {
  return parsePricingInputFromRequest(req);
}

export function getGuestCartCookieOptions() {
  const env = getEnv();
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: GUEST_CART_COOKIE_MAX_AGE_MS,
  };
}

export function clearGuestCartCookie(res: Response): void {
  const env = getEnv();
  res.clearCookie(GUEST_CART_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function readGuestSessionToken(
  cookieValue: unknown,
): string | undefined {
  return typeof cookieValue === "string" && cookieValue.trim().length > 0
    ? cookieValue.trim()
    : undefined;
}

export function ensureGuestSessionToken(
  res: Response,
  existingToken: string | undefined,
): string {
  const token = existingToken ?? randomUUID();
  if (!existingToken) {
    res.cookie(GUEST_CART_COOKIE_NAME, token, getGuestCartCookieOptions());
  }
  return token;
}

async function getActiveGuestCartByToken(sessionToken: string) {
  return prisma.guestCart.findFirst({
    where: { sessionToken, status: "active" },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getOrCreateGuestCart(sessionToken: string) {
  const existing = await getActiveGuestCartByToken(sessionToken);
  if (existing) return existing;

  return prisma.guestCart.create({
    data: {
      sessionToken,
      status: "active",
      currency: "USD",
    },
    include: { items: true },
  });
}

export async function serializeGuestCart(
  cart: NonNullable<GuestCartWithItems>,
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
    sessionToken: cart.sessionToken,
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

export async function addGuestCartItem(
  sessionToken: string,
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
  const cart = await getOrCreateGuestCart(sessionToken);
  const scheduleRef = input.scheduleRef?.trim() || null;
  const quantity = input.quantity ?? 1;

  if (cart.currency !== context.currency) {
    await prisma.guestCart.update({
      where: { id: cart.id },
      data: { currency: context.currency },
    });
    cart.currency = context.currency;
  }

  const existingLine = cart.items.find(
    (item) =>
      item.offeringCode === input.offeringCode &&
      scheduleKey(item.scheduleRef) === scheduleKey(scheduleRef),
  );

  let item;
  if (existingLine) {
    item = await prisma.guestCartItem.update({
      where: { id: existingLine.id },
      data: {
        quantity: existingLine.quantity + quantity,
        unitPrice: new Decimal(quoted.amount),
        currency: context.currency,
      },
    });
  } else {
    item = await prisma.guestCartItem.create({
      data: {
        guestCartId: cart.id,
        offeringCode: input.offeringCode,
        scheduleRef,
        quantity,
        unitPrice: new Decimal(quoted.amount),
        currency: context.currency,
      },
    });
  }

  return { ok: true as const, cartId: cart.id, item };
}

export async function removeGuestCartItem(sessionToken: string, itemId: string) {
  const cart = await getOrCreateGuestCart(sessionToken);
  const line = cart.items.find((i) => i.id === itemId);
  if (!line) {
    return {
      ok: false as const,
      error: { code: "CART_ITEM_NOT_FOUND", message: "Cart line not found" },
    };
  }
  await prisma.guestCartItem.delete({ where: { id: itemId } });
  return { ok: true as const };
}

export async function updateGuestCartItemQuantity(
  sessionToken: string,
  itemId: string,
  quantity: number,
) {
  const cart = await getOrCreateGuestCart(sessionToken);
  const line = cart.items.find((i) => i.id === itemId);
  if (!line) {
    return {
      ok: false as const,
      error: { code: "CART_ITEM_NOT_FOUND", message: "Cart line not found" },
    };
  }
  if (quantity < 1) {
    await prisma.guestCartItem.delete({ where: { id: itemId } });
    return { ok: true as const, removed: true as const };
  }
  await prisma.guestCartItem.update({ where: { id: itemId }, data: { quantity } });
  return { ok: true as const, removed: false as const };
}

export async function mergeGuestCartIntoUserCart(
  sessionToken: string,
  auth: SessionClaims,
  pricingInput?: PricingHttpInput,
) {
  const guestCart = await getActiveGuestCartByToken(sessionToken);
  if (!guestCart || guestCart.items.length === 0) {
    const userCart = await getOrCreateActiveCart(auth);
    return {
      merged: false as const,
      guestCartId: guestCart?.id ?? null,
      cart: await serializeCart(userCart, pricingInput),
    };
  }

  const mergedCart = await prisma.$transaction(async (tx) => {
    let userCart = await tx.cart.findFirst({
      where: { userId: auth.userId, status: "active" },
      include: { items: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!userCart) {
      userCart = await tx.cart.create({
        data: {
          userId: auth.userId,
          tenantId: auth.tenantId,
          status: "active",
          currency: guestCart.currency,
        },
        include: { items: true },
      });
    }

    for (const guestItem of guestCart.items) {
      const existingLine = userCart.items.find(
        (item) =>
          item.offeringCode === guestItem.offeringCode &&
          scheduleKey(item.scheduleRef) === scheduleKey(guestItem.scheduleRef),
      );

      if (existingLine) {
        await tx.cartItem.update({
          where: { id: existingLine.id },
          data: { quantity: existingLine.quantity + guestItem.quantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: userCart.id,
            offeringCode: guestItem.offeringCode,
            scheduleRef: guestItem.scheduleRef,
            quantity: guestItem.quantity,
            unitPrice: guestItem.unitPrice,
            currency: guestItem.currency,
          },
        });
      }
    }

    await tx.guestCart.update({
      where: { id: guestCart.id },
      data: { status: "merged" },
    });

    await tx.guestCartItem.deleteMany({ where: { guestCartId: guestCart.id } });

    return tx.cart.findUniqueOrThrow({
      where: { id: userCart.id },
      include: { items: true },
    });
  });

  return {
    merged: true as const,
    guestCartId: guestCart.id,
    cart: await serializeCart(mergedCart, pricingInput),
  };
}

export async function mergeGuestCartAfterAuth(
  req: { cookies?: Record<string, unknown> },
  res: Response,
  auth: SessionClaims,
): Promise<void> {
  const sessionToken = readGuestSessionToken(req.cookies?.guest_cart_session);
  if (!sessionToken) return;
  await mergeGuestCartIntoUserCart(
    sessionToken,
    auth,
    parsePricingInputFromRequest(req as Request),
  );
  clearGuestCartCookie(res);
}
