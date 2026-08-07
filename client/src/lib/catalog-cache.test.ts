import { describe, expect, it } from "vitest";
import { catalogMatchesCurrency } from "./catalog-cache";
import type { CatalogListResponse, CatalogOffering } from "./forum-api";

function offering(currency: string, quoteCurrency = currency): CatalogOffering {
  return {
    code: "mock-interview-series-with-interview-preparation",
    title: "Mock Interview",
    kind: "service",
    category: "service",
    scheduleBound: false,
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "249",
    currency,
    roleTags: [],
    deliveryMode: "live",
    priceQuote: { amount: "249", currency: quoteCurrency },
  };
}

function list(currency: string, quoteCurrency = currency): CatalogListResponse {
  return {
    offerings: [offering(currency, quoteCurrency)],
    filters: {},
    currencyContext: { currency, geoDetected: "US", source: "user" },
  };
}

describe("catalogMatchesCurrency", () => {
  it("accepts offerings whose priceQuote matches the session currency", () => {
    expect(catalogMatchesCurrency(list("INR", "INR"), "INR")).toBe(true);
  });

  it("rejects offerings quoted in a different currency", () => {
    expect(catalogMatchesCurrency(list("USD", "USD"), "INR")).toBe(false);
  });

  it("rejects when currencyContext disagrees", () => {
    const data = list("INR", "INR");
    data.currencyContext = { currency: "USD", geoDetected: "US", source: "geo" };
    expect(catalogMatchesCurrency(data, "INR")).toBe(false);
  });
});
