import { describe, expect, it } from "vitest";
import { resolveCurrencyContext } from "./currency-context.js";

describe("currency context resolver (FR-178)", () => {
  it("geo-detects INR for India", () => {
    const ctx = resolveCurrencyContext({ geo: "IN" });
    expect(ctx.currency).toBe("INR");
    expect(ctx.geoDetected).toBe("IN");
    expect(ctx.source).toBe("geo");
  });

  it("geo-detects USD for US", () => {
    const ctx = resolveCurrencyContext({ geo: "US" });
    expect(ctx.currency).toBe("USD");
    expect(ctx.source).toBe("geo");
  });

  it("geo-detects CAD for Canada", () => {
    const ctx = resolveCurrencyContext({ geo: "CA" });
    expect(ctx.currency).toBe("CAD");
    expect(ctx.geoDetected).toBe("CA");
    expect(ctx.source).toBe("geo");
  });

  it("geo-detects NGN for Nigeria", () => {
    const ctx = resolveCurrencyContext({ geo: "NG" });
    expect(ctx.currency).toBe("NGN");
    expect(ctx.source).toBe("geo");
  });

  it("geo-detects IDR for Indonesia", () => {
    const ctx = resolveCurrencyContext({ geo: "ID" });
    expect(ctx.currency).toBe("IDR");
    expect(ctx.source).toBe("geo");
  });

  it("geo-detects EUR for Netherlands", () => {
    const ctx = resolveCurrencyContext({ geo: "NL" });
    expect(ctx.currency).toBe("EUR");
    expect(ctx.source).toBe("geo");
  });

  it("geo-detects BRL for Brazil", () => {
    const ctx = resolveCurrencyContext({ geo: "BR" });
    expect(ctx.currency).toBe("BRL");
    expect(ctx.source).toBe("geo");
  });

  it("user override wins over geo default", () => {
    const ctx = resolveCurrencyContext({
      geo: "IN",
      currencyOverride: "usd",
    });
    expect(ctx.currency).toBe("USD");
    expect(ctx.source).toBe("user");
  });
});
