import { describe, expect, it } from "vitest";
import { buildCatalogFacets } from "./facets.js";
import { listTrainingCourses } from "./catalog-seed-data.js";
import { resolveCurrencyContext } from "../pricing/pricing-service.js";

describe("buildCatalogFacets", () => {
  it("uses USD catalog base when no currency context is provided", () => {
    const trainings = listTrainingCourses();
    const facets = buildCatalogFacets(trainings);
    expect(facets.priceRange).toEqual({ min: 499, max: 499 });
  });

  it("quotes price range in session currency (FR-178)", () => {
    const trainings = listTrainingCourses();
    const inr = resolveCurrencyContext({ geo: "IN", currencyOverride: "INR" });
    const facets = buildCatalogFacets(trainings, inr);
    expect(facets.priceRange).toEqual({ min: 29990, max: 29990 });
  });
});
