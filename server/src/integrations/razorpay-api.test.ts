import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRazorpayOrder,
  toMinorUnits,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "./razorpay-api.js";

describe("razorpay api (FR-170 sandbox)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("converts INR amount to paise", () => {
    expect(toMinorUnits("499.00", "INR")).toBe(49900);
  });

  it("verifies payment signature", () => {
    const secret = "test_secret";
    const orderId = "order_abc";
    const paymentId = "pay_xyz";
    const signature = createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    expect(
      verifyPaymentSignature({ orderId, paymentId, signature, secret }),
    ).toBe(true);
  });

  it("verifies webhook signature", () => {
    const secret = "whsec_test";
    const body = '{"event":"payment.captured"}';
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature({ body, signature, secret })).toBe(true);
  });

  it("creates Razorpay order via API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "order_live_1",
        amount: 830000,
        currency: "INR",
        status: "created",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const order = await createRazorpayOrder({
      keyId: "rzp_test_key",
      keySecret: "rzp_test_secret",
      amountMinor: 830000,
      currency: "INR",
      receipt: "ORD-TEST",
      notes: { internal_order_id: "uuid-1" },
    });

    expect(order.id).toBe("order_live_1");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.razorpay.com/v1/orders",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
