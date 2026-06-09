import { describe, expect, it } from "vitest";
import { filterOfferings } from "./filter.js";
import { listOfferings } from "./offerings.js";

describe("catalog filter (FR-163)", () => {
  const all = listOfferings();

  it("filters by category training", () => {
    const result = filterOfferings(all, { category: "training" });
    expect(result.every((o) => o.category === "training")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters by role tag", () => {
    const result = filterOfferings(all, { role: "scrum_master" });
    expect(result.every((o) => o.roleTags.includes("scrum_master"))).toBe(true);
  });

  it("filters by certification body", () => {
    const result = filterOfferings(all, { certBody: "scrum.org" });
    expect(result.every((o) => o.certBody === "scrum.org")).toBe(true);
  });

  it("filters by price range", () => {
    const result = filterOfferings(all, { minPrice: 50, maxPrice: 500 });
    expect(result.every((o) => {
      const price = Number.parseFloat(o.defaultUnitPrice);
      return price >= 50 && price <= 500;
    })).toBe(true);
  });

  it("filters by delivery mode and upcoming batch", () => {
    const result = filterOfferings(all, {
      deliveryMode: "live",
      hasUpcomingBatch: true,
    });
    expect(
      result.every((o) => o.deliveryMode === "live" && o.upcomingBatchId),
    ).toBe(true);
  });
});
