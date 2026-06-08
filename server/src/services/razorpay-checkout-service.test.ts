import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRazorpayCheckoutSession,
  isRazorpayConfigured,
} from "./razorpay-checkout-service.js";

describe("razorpay checkout service (FR-170)", () => {
  const originalKeyId = process.env.RAZORPAY_KEY_ID;
  const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

  afterEach(() => {
    process.env.RAZORPAY_KEY_ID = originalKeyId;
    process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    vi.unstubAllGlobals();
  });

  it("returns stub session when keys are absent", async () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    expect(isRazorpayConfigured()).toBe(false);

    const session = await createRazorpayCheckoutSession({
      orderId: "ord-1",
      orderNumber: "ORD-TEST",
      amount: "499.00",
      currency: "INR",
    });

    expect(session.mode).toBe("stub");
    expect(session.checkoutUrl).toContain("/checkout/razorpay/stub");
    expect(session.paymentRef).toMatch(/^razorpay:order_stub_ord-test:stub_/);
  });

  it("creates live sandbox order when keys are configured", async () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = "rzp_test_secret";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "order_live_abc",
          amount: 49900,
          currency: "INR",
          status: "created",
        }),
      }),
    );

    const session = await createRazorpayCheckoutSession({
      orderId: "ord-2",
      orderNumber: "ORD-LIVE",
      amount: "499.00",
      currency: "INR",
      paymentMode: "installment",
    });

    expect(session.mode).toBe("live");
    expect(session.providerOrderId).toBe("order_live_abc");
    expect(session.keyId).toBe("rzp_test_key");
    expect(session.amountMinor).toBe(49900);
    expect(session.checkoutUrl).toContain("/checkout/razorpay?");
    expect(session.paymentRef).toBe("razorpay:pending:order_live_abc");
  });
});
