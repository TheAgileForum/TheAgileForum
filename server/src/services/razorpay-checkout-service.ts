/**
 * Razorpay Checkout stub for India geo (full_pay via Razorpay).
 * Delegates to StubRazorpayCheckoutAdapter when live keys are absent.
 */

import { StubRazorpayCheckoutAdapter } from "../integrations/adapters.stub.js";

export type RazorpayCheckoutSession = {
  checkoutUrl: string;
  paymentRef: string;
  providerOrderId: string;
};

const stubAdapter = new StubRazorpayCheckoutAdapter();

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim(),
  );
}

export async function createRazorpayCheckoutSession(input: {
  orderId: string;
  orderNumber: string;
  amount: string;
  currency: string;
}): Promise<RazorpayCheckoutSession> {
  if (isRazorpayConfigured()) {
    // Live integration deferred; stub path is the default for Sprint 1.
  }

  return stubAdapter.createCheckoutSession(input);
}
