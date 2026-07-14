import { describe, expect, it } from "vitest";
import { catalogDisplayPrice } from "./catalog-display-price";

describe("catalogDisplayPrice", () => {
  it("uses ~30% default derivation for generic offerings", () => {
    const result = catalogDisplayPrice("INR", "33999");
    expect(result.discountPercent).toBe(30);
    expect(result.discountLabel).toContain("30% off");
    expect(result.discountLabel).toContain("Lowest Price Guarantee");
  });

  it("forces 50% off and ₹60,000 MRP for mentorship course in INR", () => {
    const result = catalogDisplayPrice(
      "INR",
      "29990",
      "course-agile-fundamentals",
    );
    expect(result.saleFormatted).toBe("₹29,990");
    expect(result.mrpFormatted).toBe("₹60,000");
    expect(result.discountPercent).toBe(50);
    expect(result.discountLabel).toContain("50% off");
    expect(result.discountLabel).toContain("Lowest Price Guarantee");
  });

  it("keeps default ~30% for mentorship course in non-INR currencies", () => {
    const result = catalogDisplayPrice(
      "USD",
      "499",
      "course-agile-fundamentals",
    );
    expect(result.discountPercent).toBe(30);
    expect(result.mrpFormatted).not.toBe("₹60,000");
  });
});
