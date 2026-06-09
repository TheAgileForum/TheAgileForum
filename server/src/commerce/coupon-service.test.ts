import { describe, expect, it } from "vitest";
import {
  computeAdjustedTotal,
  computeDiscountAmount,
  normalizeCouponCode,
  validateStubCouponCode,
} from "./coupon-service.js";

describe("coupon service (FR-179 stub)", () => {
  it("normalizes coupon codes", () => {
    expect(normalizeCouponCode(" welcome10 ")).toBe("WELCOME10");
  });

  it("accepts WELCOME10 stub coupon", () => {
    const result = validateStubCouponCode("welcome10");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.percentOff).toBe(10);
  });

  it("rejects unknown coupon codes", () => {
    expect(validateStubCouponCode("NOTREAL").ok).toBe(false);
  });

  it("computes percent discount and adjusted total", () => {
    expect(computeDiscountAmount("100.00", 10)).toBe("10.00");
    expect(computeAdjustedTotal("100.00", "10.00")).toBe("90.00");
  });
});
