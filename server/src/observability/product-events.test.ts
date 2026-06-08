import { describe, expect, it } from "vitest";
import {
  productEventSchemas,
  validateProductEventProperties,
} from "./product-events.js";

describe("PostHog product event contracts (FR-175, FR-176)", () => {
  it("accepts cart_updated with commerce_journey_origin", () => {
    const result = validateProductEventProperties("cart_updated", {
      cart_id: "00000000-0000-4000-8000-000000000001",
      line_count: 2,
      guest: true,
      commerce_journey_origin: "catalog_certifications",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects checkout_started without order_id", () => {
    const result = validateProductEventProperties("checkout_started", {
      order_number: "ORD-1",
      variant: "standard",
      currency: "USD",
      total_amount: "49.00",
    });
    expect(result.ok).toBe(false);
  });

  it("accepts checkout_confirmed with payment_mode", () => {
    const result = validateProductEventProperties("checkout_confirmed", {
      order_id: "00000000-0000-4000-8000-000000000002",
      order_number: "ORD-ABC",
      currency: "INR",
      commerce_journey_origin: "guided",
      payment_mode: "installment",
    });
    expect(result.ok).toBe(true);
  });

  it("accepts global_cart_viewed for FR-177 shell", () => {
    const result = validateProductEventProperties("global_cart_viewed", {
      line_count: 0,
      guest: true,
      surface: "forum_header",
    });
    expect(result.ok).toBe(true);
  });

  it("accepts installment funnel events (FR-175)", () => {
    expect(
      validateProductEventProperties("installment_option_impression", {
        offer_id: "safe-leading-safe",
        currency: "INR",
        provider: "razorpay_emi",
        geo: "IN",
      }).ok,
    ).toBe(true);

    expect(
      validateProductEventProperties("installment_checkout_started", {
        order_id: "00000000-0000-4000-8000-000000000003",
        provider: "razorpay_emi",
        currency: "INR",
        commerce_journey_origin: "catalog_trainings",
      }).ok,
    ).toBe(true);

    expect(
      validateProductEventProperties("installment_checkout_completed", {
        order_id: "00000000-0000-4000-8000-000000000003",
        provider: "razorpay_emi",
        currency: "INR",
      }).ok,
    ).toBe(true);
  });

  it("covers every registered product event schema", () => {
    expect(Object.keys(productEventSchemas).sort()).toEqual(
      [
        "cart_updated",
        "checkout_confirmed",
        "checkout_started",
        "global_cart_clicked",
        "global_cart_viewed",
        "installment_checkout_completed",
        "installment_checkout_started",
        "installment_option_impression",
      ].sort(),
    );
  });
});
