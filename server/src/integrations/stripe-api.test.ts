import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createStripeCheckoutSession,
  parseStripeWebhookEvent,
  retrieveStripeCheckoutSession,
  toStripeAmountCents,
  verifyStripeWebhookSignature,
} from "./stripe-api.js";

describe("stripe api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("converts amount to cents", () => {
    expect(toStripeAmountCents("49.00")).toBe(4900);
  });

  it("rejects invalid amounts", () => {
    expect(() => toStripeAmountCents("0")).toThrow("STRIPE_INVALID_AMOUNT");
  });

  it("creates checkout session via API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "cs_test_1",
        url: "https://checkout.stripe.com/c/pay/cs_test_1",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const session = await createStripeCheckoutSession({
      secretKey: "sk_test_key",
      orderId: "order-uuid",
      orderNumber: "ORD-1",
      amount: "49.00",
      currency: "USD",
      successUrl: "http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "http://localhost:5173/checkout",
    });

    expect(session.id).toBe("cs_test_1");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.stripe.com/v1/checkout/sessions",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("retrieves checkout session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "cs_test_1",
          url: "https://checkout.stripe.com/c/pay/cs_test_1",
          payment_status: "paid",
          status: "complete",
          client_reference_id: "order-uuid",
        }),
      }),
    );

    const session = await retrieveStripeCheckoutSession({
      secretKey: "sk_test_key",
      sessionId: "cs_test_1",
    });
    expect(session.payment_status).toBe("paid");
  });

  it("verifies webhook signature", () => {
    const secret = "whsec_test_secret";
    const payload = '{"id":"evt_1","type":"checkout.session.completed"}';
    const timestamp = Math.floor(Date.now() / 1000);
    const signed = `${timestamp}.${payload}`;
    const v1 = createHmac("sha256", secret).update(signed, "utf8").digest("hex");
    const header = `t=${timestamp},v1=${v1}`;

    expect(
      verifyStripeWebhookSignature({ payload, signatureHeader: header, secret }),
    ).toBe(true);
  });

  it("parses checkout.session.completed webhook", () => {
    const body = JSON.stringify({
      id: "evt_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_1",
          client_reference_id: "order-uuid",
          metadata: { order_id: "order-uuid" },
        },
      },
    });
    const parsed = parseStripeWebhookEvent(body);
    expect(parsed.type).toBe("checkout.session.completed");
    expect(parsed.orderId).toBe("order-uuid");
    expect(parsed.sessionId).toBe("cs_test_1");
  });
});
