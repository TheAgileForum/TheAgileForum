/**
 * Razorpay Checkout for India geo (full_pay + EMI via Razorpay modal).
 * Uses live Orders API when sandbox keys are set; otherwise stub redirect.
 */

import { createRazorpayOrder, toMinorUnits } from "../integrations/razorpay-api.js";
import { StubRazorpayCheckoutAdapter } from "../integrations/adapters.stub.js";

export type RazorpayCheckoutMode = "stub" | "live";

export type RazorpayCheckoutSession = {
  mode: RazorpayCheckoutMode;
  checkoutUrl: string;
  paymentRef: string | null;
  providerOrderId: string;
  keyId?: string;
  amountMinor?: number;
  currency: string;
};

const stubAdapter = new StubRazorpayCheckoutAdapter();

export function getRazorpayKeyId(): string | undefined {
  return process.env.RAZORPAY_KEY_ID?.trim() || undefined;
}

export function getRazorpayKeySecret(): string | undefined {
  return process.env.RAZORPAY_KEY_SECRET?.trim() || undefined;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}

export async function createRazorpayCheckoutSession(input: {
  orderId: string;
  orderNumber: string;
  amount: string;
  currency: string;
  paymentMode?: "full_pay" | "installment";
}): Promise<RazorpayCheckoutSession> {
  const appUrl = process.env.APP_PUBLIC_URL?.trim() || "http://localhost:5173";
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();

  if (keyId && keySecret) {
    const amountMinor = toMinorUnits(input.amount, input.currency);
    const rzOrder = await createRazorpayOrder({
      keyId,
      keySecret,
      amountMinor,
      currency: input.currency.toUpperCase(),
      receipt: input.orderNumber,
      notes: {
        internal_order_id: input.orderId,
        payment_mode: input.paymentMode ?? "full_pay",
      },
    });

    const query = new URLSearchParams({
      orderId: input.orderId,
      mode: input.paymentMode ?? "full_pay",
    });

    return {
      mode: "live",
      providerOrderId: rzOrder.id,
      paymentRef: `razorpay:pending:${rzOrder.id}`,
      checkoutUrl: `${appUrl}/checkout/razorpay?${query.toString()}`,
      keyId,
      amountMinor: rzOrder.amount,
      currency: rzOrder.currency,
    };
  }

  const stub = await stubAdapter.createCheckoutSession(input);
  return {
    mode: "stub",
    providerOrderId: stub.providerOrderId,
    paymentRef: stub.paymentRef,
    checkoutUrl: stub.checkoutUrl,
    currency: input.currency,
  };
}
