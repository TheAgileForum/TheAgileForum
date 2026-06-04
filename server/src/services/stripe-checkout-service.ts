/**
 * Optional Stripe Checkout Session creation when STRIPE_SECRET_KEY is configured.
 * Falls back to stub payment in checkout-service when not configured.
 */

export type StripeCheckoutSession = {
  checkoutUrl: string;
  sessionId: string;
};

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export async function createCheckoutSession(input: {
  orderId: string;
  orderNumber: string;
  amount: string;
  currency: string;
  customerEmail?: string;
}): Promise<StripeCheckoutSession | null> {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return null;

  const appUrl = process.env.APP_PUBLIC_URL?.trim() || "http://localhost:5173";
  const amountCents = Math.round(Number(input.amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 1) {
    throw new Error("STRIPE_INVALID_AMOUNT");
  }

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${appUrl}/checkout/success?order=${encodeURIComponent(input.orderNumber)}`);
  params.set("cancel_url", `${appUrl}/checkout`);
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

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`STRIPE_SESSION_FAILED:${res.status}:${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as { id?: string; url?: string };
  if (!json.id || !json.url) {
    throw new Error("STRIPE_SESSION_INVALID_RESPONSE");
  }

  return { sessionId: json.id, checkoutUrl: json.url };
}
