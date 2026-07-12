import { randomUUID } from "node:crypto";
import type { Response } from "express";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/client.js";
import { getOfferingFromCatalog } from "../catalog/catalog-repository.js";
import { getOffering } from "../catalog/offerings.js";
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
  memoryAddGuestCartItem,
  memoryGetActiveGuestCart,
  memoryGetOrCreateGuestCart,
  memoryMarkGuestCartMerged,
  memoryRemoveGuestCartItem,
  memoryUpdateGuestCartItemQuantity,
  type GuestCartRecord,
} from "./guest-cart-memory-store.js";
import {
  parsePricingInputFromRequest,
  quoteOfferingPrice,
  resolveCartLineTotals,
  resolveCurrencyContext,
  type PricingHttpInput,
} from "../pricing/pricing-service.js";
import type { Request } from "express";

type GuestCartWithItems = GuestCartRecord | NonNullable<Awaited<ReturnType<typeof getActiveGuestCartByTokenFromDb>>>;

function usesGuestCartDatabase(): boolean {
  if (process.env.GUEST_CART_USE_DB === "false") return false;
  if (process.env.GUEST_CART_USE_DB === "true") return true;
  // Dev/test use in-memory guest carts by default (remote DB round-trips are slow locally).
  return process.env.NODE_ENV === "production";
}

let guestCartDbAvailable: boolean | null = null;

async function shouldUseGuestCartDb(): Promise<boolean> {
  if (!usesGuestCartDatabase()) return false;
  if (guestCartDbAvailable !== null) return guestCartDbAvailable;
  try {
    await prisma.$queryRaw`SELECT 1`;
    guestCartDbAvailable = true;
  } catch {
    guestCartDbAvailable = false;
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[guest-cart] Database unavailable; using in-memory guest cart store",
      );
    }
  }
  return guestCartDbAvailable;
}

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

async function getActiveGuestCartByTokenFromDb(sessionToken: string) {
  return prisma.guestCart.findFirst({
    where: { sessionToken, status: "active" },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });
}

async function getActiveGuestCartByToken(sessionToken: string) {
  if (await shouldUseGuestCartDb()) {
    return getActiveGuestCartByTokenFromDb(sessionToken);
  }
  return memoryGetActiveGuestCart(sessionToken);
}

export async function getOrCreateGuestCart(sessionToken: string) {
  if (await shouldUseGuestCartDb()) {
    const existing = await getActiveGuestCartByTokenFromDb(sessionToken);
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

  return memoryGetOrCreateGuestCart(sessionToken);
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
    async (code) => getOffering(code) ?? (await getOfferingFromCatalog(code)) ?? null,
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

async function resolveOfferingForCommerce(code: string) {
  return getOffering(code) ?? (await getOfferingFromCatalog(code));
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
  const offering = await resolveOfferingForCommerce(input.offeringCode);
  if (!offering) {
    return {
      ok: false as const,
      error: {
        code: "UNKNOWN_OFFERING",
        message: `Offering ${input.offeringCode} is not in catalog`,
      },
    };
  }

  const context = resolveCurrencyContext(pricingInput ?? { geo: "US" });
  const quoted = quoteOfferingPrice(offering, context);
  const scheduleRef =
    input.scheduleRef?.trim() || offering.upcomingBatchId?.trim() || null;
  const policyError = validateAddToCartLine(
    { ...input, scheduleRef: scheduleRef ?? undefined },
    offering,
  );
  if (policyError) {
    return { ok: false as const, error: policyError };
  }
  const quantity = input.quantity ?? 1;
  const unitPrice = new Decimal(quoted.amount);

  if (await shouldUseGuestCartDb()) {
    const cart = await getOrCreateGuestCart(sessionToken);

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
          unitPrice,
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
          unitPrice,
          currency: context.currency,
        },
      });
    }

    const refreshedCart = {
      ...cart,
      items: existingLine
        ? cart.items.map((line) => (line.id === existingLine.id ? item : line))
        : [...cart.items, item],
    } as Awaited<ReturnType<typeof getOrCreateGuestCart>>;
    return {
      ok: true as const,
      cartId: cart.id,
      item,
      cart: refreshedCart,
    };
  }

  const { cart, item } = memoryAddGuestCartItem(sessionToken, {
    offeringCode: input.offeringCode,
    scheduleRef,
    quantity,
    unitPrice,
    currency: context.currency,
  });

  const refreshedCart = (memoryGetActiveGuestCart(sessionToken) ??
    cart) as Awaited<ReturnType<typeof getOrCreateGuestCart>>;
  return {
    ok: true as const,
    cartId: cart.id,
    item,
    cart: refreshedCart,
  };
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

  if (await shouldUseGuestCartDb()) {
    await prisma.guestCartItem.delete({ where: { id: itemId } });
  } else {
    memoryRemoveGuestCartItem(sessionToken, itemId);
  }

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
  if (await shouldUseGuestCartDb()) {
    if (quantity < 1) {
      await prisma.guestCartItem.delete({ where: { id: itemId } });
      return { ok: true as const, removed: true as const };
    }
    await prisma.guestCartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return { ok: true as const, removed: false as const };
  }

  const result = memoryUpdateGuestCartItemQuantity(sessionToken, itemId, quantity);
  if (!result.ok) {
    return {
      ok: false as const,
      error: { code: "CART_ITEM_NOT_FOUND", message: "Cart line not found" },
    };
  }
  return { ok: true as const, removed: result.removed };
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

  if (!(await shouldUseGuestCartDb())) {
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

      return tx.cart.findUniqueOrThrow({
        where: { id: userCart.id },
        include: { items: true },
      });
    });

    memoryMarkGuestCartMerged(sessionToken);

    return {
      merged: true as const,
      guestCartId: guestCart.id,
      cart: await serializeCart(mergedCart, pricingInput),
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
