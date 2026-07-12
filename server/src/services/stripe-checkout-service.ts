/**
 * Stripe Checkout Session for non-IN geo (full_pay).
 * Uses live Sessions API when STRIPE_SECRET_KEY is configured.
 */

import {
  createStripeCheckoutSession,
  retrieveStripeCheckoutSession,
} from "../integrations/stripe-api.js";
import { executeWithRetry } from "../integrations/external-call.js";
import { mapProviderFailure } from "../integrations/errors.js";

export type StripeCheckoutMode = "stub" | "live";

export type StripeCheckoutSessionResult = {
  mode: StripeCheckoutMode;
  checkoutUrl: string;
  sessionId: string;
  paymentRef: string;
};

export function getStripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || undefined;
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey());
}

export async function createCheckoutSession(input: {
  orderId: string;
  orderNumber: string;
  amount: string;
  currency: string;
  customerEmail?: string;
}): Promise<StripeCheckoutSessionResult | null> {
  const secret = getStripeSecretKey();
  if (!secret) return null;

  const appUrl = process.env.APP_PUBLIC_URL?.trim() || "http://localhost:5173";
  const successUrl = `${appUrl}/checkout/success?order=${encodeURIComponent(input.orderNumber)}&orderId=${encodeURIComponent(input.orderId)}&session_id={CHECKOUT_SESSION_ID}&provider=stripe`;
  const cancelUrl = `${appUrl}/checkout`;

  const result = await executeWithRetry(async () =>
    createStripeCheckoutSession({
      secretKey: secret,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      amount: input.amount,
      currency: input.currency,
      customerEmail: input.customerEmail,
      successUrl,
      cancelUrl,
    }),
  );
  if (!result.ok || !result.data) {
    throw mapProviderFailure("stripe", result.error ?? "Stripe checkout session failed");
  }
  const session = result.data;

  return {
    mode: "live",
    checkoutUrl: session.url,
    sessionId: session.id,
    paymentRef: `stripe:pending:${session.id}`,
  };
}

export async function fetchStripeCheckoutSession(sessionId: string) {
  const secret = getStripeSecretKey();
  if (!secret) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  const result = await executeWithRetry(async () =>
    retrieveStripeCheckoutSession({ secretKey: secret, sessionId }),
  );
  if (!result.ok || !result.data) {
    throw mapProviderFailure("stripe", result.error ?? "Stripe session lookup failed");
  }
  return result.data;
}
