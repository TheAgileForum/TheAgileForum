/**
 * Stripe Checkout Session for non-IN geo (full_pay).
 * Uses live Sessions API when STRIPE_SECRET_KEY is configured.
 */

import {
  createStripeCheckoutSession,
  retrieveStripeCheckoutSession,
} from "../integrations/stripe-api.js";

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

  const session = await createStripeCheckoutSession({
    secretKey: secret,
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    amount: input.amount,
    currency: input.currency,
    customerEmail: input.customerEmail,
    successUrl,
    cancelUrl,
  });

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
  return retrieveStripeCheckoutSession({ secretKey: secret, sessionId });
}
