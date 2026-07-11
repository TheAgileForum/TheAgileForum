import { createHmac, timingSafeEqual } from "node:crypto";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export type StripeCheckoutSessionResponse = {
  id: string;
  url: string;
  payment_status?: string;
  status?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
};

export function toStripeAmountCents(amount: string): number {
  const cents = Math.round(Number.parseFloat(amount) * 100);
  if (!Number.isFinite(cents) || cents < 1) {
    throw new Error("STRIPE_INVALID_AMOUNT");
  }
  return cents;
}

export async function createStripeCheckoutSession(input: {
  secretKey: string;
  orderId: string;
  orderNumber: string;
  amount: string;
  currency: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<StripeCheckoutSessionResponse> {
  const amountCents = toStripeAmountCents(input.amount);

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", input.successUrl);
  params.set("cancel_url", input.cancelUrl);
  params.set("client_reference_id", input.orderId);
  params.set("metadata[order_id]", input.orderId);
  params.set("metadata[order_number]", input.orderNumber);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", input.currency.toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(amountCents));
  params.set(
    "line_items[0][price_data][product_data][name]",
    `The Agile Forum — ${input.orderNumber}`,
  );
  if (input.customerEmail) {
    params.set("customer_email", input.customerEmail);
  }

  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`STRIPE_SESSION_FAILED:${res.status}:${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as StripeCheckoutSessionResponse;
  if (!json.id || !json.url) {
    throw new Error("STRIPE_SESSION_INVALID_RESPONSE");
  }
  return json;
}

export async function retrieveStripeCheckoutSession(input: {
  secretKey: string;
  sessionId: string;
}): Promise<StripeCheckoutSessionResponse> {
  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions/${input.sessionId}`, {
    headers: { Authorization: `Bearer ${input.secretKey}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`STRIPE_SESSION_RETRIEVE_FAILED:${res.status}:${body.slice(0, 200)}`);
  }

  return (await res.json()) as StripeCheckoutSessionResponse;
}

/** Stripe webhook signature verification (no SDK). */
export function verifyStripeWebhookSignature(input: {
  payload: string;
  signatureHeader: string | undefined;
  secret: string;
  toleranceSeconds?: number;
}): boolean {
  const secret = input.secret.trim();
  if (!secret || !input.signatureHeader) return false;

  const parts = input.signatureHeader.split(",").map((p) => p.trim());
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const v1Parts = parts.filter((p) => p.startsWith("v1="));
  if (!timestampPart || v1Parts.length === 0) return false;

  const timestamp = Number.parseInt(timestampPart.slice(2), 10);
  if (!Number.isFinite(timestamp)) return false;

  const tolerance = input.toleranceSeconds ?? 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) return false;

  const signedPayload = `${timestamp}.${input.payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  return v1Parts.some((part) => {
    const sig = part.slice(3);
    try {
      const a = Buffer.from(expected, "hex");
      const b = Buffer.from(sig, "hex");
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

export function parseStripeWebhookEvent(body: string): {
  id: string;
  type: string;
  orderId?: string;
  sessionId?: string;
} {
  const json = JSON.parse(body) as {
    id?: string;
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  const obj = (json.data?.object ?? {}) as {
    id?: string;
    client_reference_id?: string;
    metadata?: { order_id?: string };
  };
  return {
    id: json.id ?? `evt_${Date.now()}`,
    type: json.type ?? "unknown",
    orderId: obj.metadata?.order_id ?? obj.client_reference_id,
    sessionId: obj.id,
  };
}
