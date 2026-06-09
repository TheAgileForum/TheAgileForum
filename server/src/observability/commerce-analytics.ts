import type { CommerceJourneyOrigin } from "../commerce/journey-origin.js";
import { captureProductEvent } from "./posthog.js";
import type { ProductEventName } from "./product-events.js";

function lineCountFromCart(cart: { items: Array<{ quantity: number }>; lineCount?: number }) {
  return cart.lineCount ?? cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function trackCartUpdated(input: {
  distinctId: string;
  cartId: string;
  cart: { items: Array<{ quantity: number }>; lineCount?: number };
  guest: boolean;
  commerceJourneyOrigin?: CommerceJourneyOrigin | null;
}) {
  return captureProductEvent({
    distinctId: input.distinctId,
    event: "cart_updated",
    properties: {
      cart_id: input.cartId,
      line_count: lineCountFromCart(input.cart),
      guest: input.guest,
      commerce_journey_origin: input.commerceJourneyOrigin ?? null,
    },
  });
}

export async function trackCheckoutStarted(input: {
  distinctId: string;
  orderId: string;
  orderNumber: string;
  variant: "standard" | "org_reimbursement";
  currency: string;
  totalAmount: string;
  commerceJourneyOrigin?: CommerceJourneyOrigin | null;
}) {
  return captureProductEvent({
    distinctId: input.distinctId,
    event: "checkout_started",
    properties: {
      order_id: input.orderId,
      order_number: input.orderNumber,
      variant: input.variant,
      currency: input.currency,
      total_amount: input.totalAmount,
      commerce_journey_origin: input.commerceJourneyOrigin ?? null,
    },
  });
}

export async function trackCheckoutConfirmed(input: {
  distinctId: string;
  orderId: string;
  orderNumber: string;
  currency: string;
  commerceJourneyOrigin?: CommerceJourneyOrigin | null;
  paymentMode?: "full_pay" | "installment";
}) {
  return captureProductEvent({
    distinctId: input.distinctId,
    event: "checkout_confirmed",
    properties: {
      order_id: input.orderId,
      order_number: input.orderNumber,
      currency: input.currency,
      commerce_journey_origin: input.commerceJourneyOrigin ?? null,
      payment_mode: input.paymentMode ?? "full_pay",
    },
  });
}

export async function trackGlobalCartViewed(input: {
  distinctId: string;
  lineCount: number;
  guest: boolean;
  surface?: string;
}) {
  return captureProductEvent({
    distinctId: input.distinctId,
    event: "global_cart_viewed",
    properties: {
      line_count: input.lineCount,
      guest: input.guest,
      surface: input.surface ?? "api_cart_get",
    },
  });
}

export async function trackNamedProductEvent(
  event: ProductEventName,
  distinctId: string,
  properties: Record<string, unknown>,
) {
  return captureProductEvent({ distinctId, event, properties });
}
