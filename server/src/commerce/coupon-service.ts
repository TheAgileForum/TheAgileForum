import { prisma } from "../db/client.js";
import type { SessionClaims } from "../services/auth-service.js";
import { serializeCart } from "../services/cart-service.js";
import type { PricingHttpInput } from "../pricing/pricing-service.js";

/** Sprint 1 stub coupons — replace with admin-configured campaigns later. */
const STUB_COUPONS: Record<string, { percentOff: number }> = {
  WELCOME10: { percentOff: 10 },
};

const appliedByCartId = new Map<string, string>();

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function validateStubCouponCode(code: string): { ok: true; percentOff: number } | { ok: false } {
  const normalized = normalizeCouponCode(code);
  const stub = STUB_COUPONS[normalized];
  if (!stub) return { ok: false };
  return { ok: true, percentOff: stub.percentOff };
}

export function computeDiscountAmount(subtotal: string, percentOff: number): string {
  const base = Number(subtotal);
  if (!Number.isFinite(base) || base <= 0) return "0.00";
  const discount = (base * percentOff) / 100;
  return discount.toFixed(2);
}

export function computeAdjustedTotal(subtotal: string, discountApplied: string): string {
  const total = Math.max(0, Number(subtotal) - Number(discountApplied));
  return total.toFixed(2);
}

export function getAppliedCouponCode(cartId: string): string | null {
  return appliedByCartId.get(cartId) ?? null;
}

export function clearAppliedCoupon(cartId: string): void {
  appliedByCartId.delete(cartId);
}

export function resolveCartCouponTotals(
  cartId: string,
  subtotal: string,
  currency: string,
): {
  couponCode: string;
  discountApplied: string;
  adjustedTotal: string;
  currency: string;
} | null {
  const code = getAppliedCouponCode(cartId);
  if (!code) return null;
  const validated = validateStubCouponCode(code);
  if (!validated.ok) return null;
  const discountApplied = computeDiscountAmount(subtotal, validated.percentOff);
  return {
    couponCode: code,
    discountApplied,
    adjustedTotal: computeAdjustedTotal(subtotal, discountApplied),
    currency,
  };
}

export async function applyCouponToCheckoutSession(
  auth: SessionClaims,
  sessionId: string,
  couponCode: string,
  pricingInput?: PricingHttpInput,
) {
  const cart = await prisma.cart.findFirst({
    where: { id: sessionId, userId: auth.userId },
    include: { items: true },
  });
  if (!cart) {
    return {
      ok: false as const,
      error: {
        code: "CHECKOUT_SESSION_NOT_FOUND",
        message: "Checkout session not found",
      },
    };
  }
  if (cart.items.length === 0) {
    return {
      ok: false as const,
      error: {
        code: "EMPTY_CART",
        message: "Cart has no items",
      },
    };
  }

  const validated = validateStubCouponCode(couponCode);
  if (!validated.ok) {
    return {
      ok: false as const,
      error: {
        code: "INVALID_COUPON",
        message: "Coupon code is not valid",
      },
    };
  }

  const normalized = normalizeCouponCode(couponCode);
  appliedByCartId.set(cart.id, normalized);

  const serialized = await serializeCart(cart, pricingInput);
  const totals = resolveCartCouponTotals(cart.id, serialized.subtotal, serialized.currency);
  if (!totals) {
    return {
      ok: false as const,
      error: {
        code: "INVALID_COUPON",
        message: "Coupon code is not valid",
      },
    };
  }

  return {
    ok: true as const,
    coupon: {
      couponCode: totals.couponCode,
      discountApplied: totals.discountApplied,
      adjustedTotal: totals.adjustedTotal,
      currency: totals.currency,
      cart: serialized,
    },
  };
}

export async function removeCouponFromCheckoutSession(
  auth: SessionClaims,
  sessionId: string,
  pricingInput?: PricingHttpInput,
) {
  const cart = await prisma.cart.findFirst({
    where: { id: sessionId, userId: auth.userId },
    include: { items: true },
  });
  if (!cart) {
    return {
      ok: false as const,
      error: {
        code: "CHECKOUT_SESSION_NOT_FOUND",
        message: "Checkout session not found",
      },
    };
  }

  clearAppliedCoupon(cart.id);
  const serialized = await serializeCart(cart, pricingInput);

  return {
    ok: true as const,
    coupon: {
      couponCode: null,
      discountApplied: "0.00",
      adjustedTotal: serialized.subtotal,
      currency: serialized.currency,
      cart: serialized,
    },
  };
}
