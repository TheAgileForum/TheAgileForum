import { createHmac, timingSafeEqual } from "node:crypto";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

export function toMinorUnits(amount: string, currency: string): number {
  const value = Number.parseFloat(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid payment amount");
  }
  const code = currency.trim().toUpperCase();
  const multiplier = code === "INR" ? 100 : 100;
  return Math.round(value * multiplier);
}

export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): boolean {
  const payload = `${input.orderId}|${input.paymentId}`;
  const expected = createHmac("sha256", input.secret).update(payload).digest("hex");
  return safeEqualHex(expected, input.signature);
}

export function verifyWebhookSignature(input: {
  body: string;
  signature: string;
  secret: string;
}): boolean {
  const expected = createHmac("sha256", input.secret).update(input.body).digest("hex");
  return safeEqualHex(expected, input.signature);
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function createRazorpayOrder(input: {
  keyId: string;
  keySecret: string;
  amountMinor: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResponse> {
  const auth = Buffer.from(`${input.keyId}:${input.keySecret}`).toString("base64");
  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Razorpay order create failed (${response.status}): ${detail}`);
  }

  return (await response.json()) as RazorpayOrderResponse;
}

export type RazorpayWebhookPayload = {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

export function parseRazorpayWebhook(body: string): RazorpayWebhookPayload {
  return JSON.parse(body) as RazorpayWebhookPayload;
}

export function extractRazorpayPaymentCaptured(
  payload: RazorpayWebhookPayload,
): { paymentId: string; razorpayOrderId: string; internalOrderId?: string } | null {
  if (payload.event !== "payment.captured") return null;
  const payment = payload.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id) return null;
  const orderNotes = payload.payload?.order?.entity?.notes;
  return {
    paymentId: payment.id,
    razorpayOrderId: payment.order_id,
    internalOrderId: orderNotes?.internal_order_id,
  };
}
