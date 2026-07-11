import { describe, expect, it } from "vitest";
import {
  convertFromUsd,
  detectGeo,
  detectGeoFromRequest,
  quoteOfferingPrice,
  quoteOfferings,
  resolveCurrencyContext,
  resolveCartLineTotals,
} from "./pricing-service.js";

describe("pricing-service (FR-178)", () => {
  it("geo-detects INR for India via query", () => {
    expect(detectGeo({ geo: "IN" })).toBe("IN");
    const ctx = resolveCurrencyContext({ geo: "IN" });
    expect(ctx.currency).toBe("INR");
    expect(ctx.source).toBe("geo");
  });

  it("user override wins over geo default", () => {
    const ctx = resolveCurrencyContext({
      geo: "IN",
      currencyOverride: "USD",
    });
    expect(ctx.currency).toBe("USD");
    expect(ctx.source).toBe("user");
  });

  it("reads session currency cookie override", () => {
    const ctx = resolveCurrencyContext({
      geo: "US",
      sessionCurrencyCookie: "EUR",
    });
    expect(ctx.currency).toBe("EUR");
    expect(ctx.source).toBe("user");
  });

  it("detectGeoFromRequest prefers query over headers", () => {
    const geo = detectGeoFromRequest({
      query: { geo: "IN" },
      headers: { "cf-ipcountry": "US" },
    } as import("express").Request);
    expect(geo).toBe("IN");
  });

  it("detectGeoFromRequest falls back to CDN header", () => {
    const geo = detectGeoFromRequest({
      query: {},
      headers: { "cf-ipcountry": "GB" },
    } as import("express").Request);
    expect(geo).toBe("GB");
  });

  it("converts USD base price to INR", () => {
    expect(convertFromUsd(49, "INR")).toBe((49 * 83).toFixed(2));
  });

  it("converts USD base price to IDR without decimals", () => {
    expect(convertFromUsd(49, "IDR")).toBe(String(49 * 16000));
  });

  it("geo-detects CAD for Canada", () => {
    const ctx = resolveCurrencyContext({ geo: "CA" });
    expect(ctx.currency).toBe("CAD");
  });

  it("geo-detects NGN for Nigeria", () => {
    const ctx = resolveCurrencyContext({ geo: "NG" });
    expect(ctx.currency).toBe("NGN");
  });

  it("quotes offering in session currency with installment plans for India", () => {
    const ctx = resolveCurrencyContext({ geo: "IN" });
    const quote = quoteOfferingPrice(
      { code: "safe-leading-safe", defaultUnitPrice: "549.00" },
      ctx,
    );
    expect(quote.currency).toBe("INR");
    expect(quote.amount).toBe("33999.00");
    expect(quote.installmentPlans?.length).toBeGreaterThan(0);
    expect(quote.installmentPlans?.[0]?.monthlyAmount).toBe(
      (33999 / 6).toFixed(2),
    );
  });

  it("keeps USD list price for SAFe certs outside India", () => {
    const ctx = resolveCurrencyContext({ geo: "US", currencyOverride: "USD" });
    const quote = quoteOfferingPrice(
      { code: "safe-leading-safe", defaultUnitPrice: "549.00" },
      ctx,
    );
    expect(quote.currency).toBe("USD");
    expect(quote.amount).toBe("549.00");
  });

  it("uses FX conversion when no regional list price exists", () => {
    const ctx = resolveCurrencyContext({ geo: "IN" });
    const quote = quoteOfferingPrice(
      { code: "exam-mock-certification", defaultUnitPrice: "49.00" },
      ctx,
    );
    expect(quote.currency).toBe("INR");
    expect(quote.amount).toBe((49 * 83).toFixed(2));
  });

  it("omits installment plans for Singapore geo (FR-169)", () => {
    const ctx = resolveCurrencyContext({ geo: "SG", currencyOverride: "SGD" });
    const quote = quoteOfferingPrice(
      { code: "safe-leading-safe", defaultUnitPrice: "999.00" },
      ctx,
    );
    expect(quote.installmentPlans).toBeUndefined();
  });

  it("quoteOfferings returns single currency for all SKUs", () => {
    const result = quoteOfferings({
      offerIds: ["exam-mock-certification", "service-mock-interview-sm"],
      currency: "INR",
      geo: "IN",
    });
    expect(result.currency).toBe("INR");
    expect(result.quotes.every((q) => q.currency === "INR")).toBe(true);
  });

  it("resolveCartLineTotals sums lines in session currency", async () => {
    const ctx = resolveCurrencyContext({ geo: "US", currencyOverride: "USD" });
    const totals = await resolveCartLineTotals(
      [
        { offeringCode: "exam-mock-certification", quantity: 2 },
        { offeringCode: "exam-practice-free", quantity: 1 },
      ],
      ctx,
      async (code) =>
        code === "exam-mock-certification"
          ? { code, defaultUnitPrice: "49.00" }
          : code === "exam-practice-free"
            ? { code, defaultUnitPrice: "0.00" }
            : null,
    );
    expect(totals.currency).toBe("USD");
    expect(Number.parseFloat(totals.subtotal)).toBe(98);
  });
});
