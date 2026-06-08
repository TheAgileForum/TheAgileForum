import { describe, expect, it } from "vitest";
import { createRazorpayCheckoutSession } from "./razorpay-checkout-service.js";

describe("razorpay checkout stub (IN geo)", () => {
  it("returns stub paymentRef and checkout URL", async () => {
    const session = await createRazorpayCheckoutSession({
      orderId: "ord-1",
      orderNumber: "ORD-TEST",
      amount: "499.00",
      currency: "INR",
    });

    expect(session.paymentRef).toMatch(/^razorpay:order_stub_ord-test:stub_/);
    expect(session.checkoutUrl).toContain("/checkout/razorpay/stub");
    expect(session.providerOrderId).toBe("order_stub_ord-test");
  });
});
