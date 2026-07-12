import { afterEach, describe, expect, it, vi } from "vitest";
import { resetEnvCache } from "../config/env.js";
import {
  createCheckoutSession,
  isStripeConfigured,
} from "./stripe-checkout-service.js";

describe("stripe checkout service", () => {
  const originalSecret = process.env.STRIPE_SECRET_KEY;
  const originalTimeout = process.env.INTEGRATION_TIMEOUT_MS;
  const originalMaxRetries = process.env.INTEGRATION_MAX_RETRIES;

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalSecret;
    if (originalTimeout === undefined) {
      delete process.env.INTEGRATION_TIMEOUT_MS;
    } else {
      process.env.INTEGRATION_TIMEOUT_MS = originalTimeout;
    }
    if (originalMaxRetries === undefined) {
      delete process.env.INTEGRATION_MAX_RETRIES;
    } else {
      process.env.INTEGRATION_MAX_RETRIES = originalMaxRetries;
    }
    resetEnvCache();
    vi.unstubAllGlobals();
  });

  it("returns null when secret is absent", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeConfigured()).toBe(false);
  });

  it("creates live session when secret is configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_key";
    process.env.APP_PUBLIC_URL = "http://localhost:5173";
    resetEnvCache();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "cs_test_live",
          url: "https://checkout.stripe.com/c/pay/cs_test_live",
        }),
      }),
    );

    const session = await createCheckoutSession({
      orderId: "ord-1",
      orderNumber: "ORD-STRIPE",
      amount: "49.00",
      currency: "USD",
      customerEmail: "buyer@demo.local",
    });

    expect(session?.mode).toBe("live");
    expect(session?.sessionId).toBe("cs_test_live");
    expect(session?.paymentRef).toBe("stripe:pending:cs_test_live");
    expect(session?.checkoutUrl).toContain("checkout.stripe.com");
  });

  it("throws when Stripe session creation times out", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_key";
    process.env.INTEGRATION_TIMEOUT_MS = "50";
    process.env.INTEGRATION_MAX_RETRIES = "0";
    resetEnvCache();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    id: "cs_test_slow",
                    url: "https://checkout.stripe.com/c/pay/cs_test_slow",
                  }),
                }),
              200,
            );
          }),
      ),
    );

    await expect(
      createCheckoutSession({
        orderId: "ord-1",
        orderNumber: "ORD-STRIPE",
        amount: "49.00",
        currency: "USD",
      }),
    ).rejects.toThrow(/timeout/i);
  });
});
