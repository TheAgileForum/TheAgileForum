import { describe, expect, it } from "vitest";
import { quoteOfferings } from "./quote-service.js";

describe("pricing quote service (FR-178, FR-13)", () => {
  it("returns quotes in a single session currency", () => {
    const result = quoteOfferings({
      offerIds: ["exam-mock-certification", "service-mock-interview-sm"],
      currency: "INR",
      geo: "IN",
    });
    expect(result.currency).toBe("INR");
    expect(result.quotes).toHaveLength(2);
    expect(result.quotes.every((q) => q.currency === "INR")).toBe(true);
  });

  it("omits installment plans for Singapore geo (FR-169 gate 13)", () => {
    const result = quoteOfferings({
      offerIds: ["safe-leading-safe"],
      currency: "SGD",
      geo: "SG",
    });
    expect(result.quotes[0]?.installmentPlans).toBeUndefined();
  });

  it("includes installment plans for India geo", () => {
    const result = quoteOfferings({
      offerIds: ["safe-leading-safe"],
      currency: "INR",
      geo: "IN",
    });
    expect(result.quotes[0]?.installmentPlans?.length).toBeGreaterThan(0);
    expect(result.quotes[0]?.installmentPlans?.[0]?.currency).toBe("INR");
  });
});
