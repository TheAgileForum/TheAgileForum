import { describe, expect, it } from "vitest";
import {
  currencyDecimals,
  formatAmountFromUsd,
  geoFromCurrency,
  isSupportedCurrency,
  SUPPORTED_CURRENCY_CODES,
} from "./supported-currencies.js";

describe("supported currencies (FR-178)", () => {
  it("lists launch session currencies including new geos", () => {
    expect(SUPPORTED_CURRENCY_CODES).toEqual(
      expect.arrayContaining([
        "USD",
        "INR",
        "CAD",
        "NGN",
        "AUD",
        "IDR",
        "SGD",
        "BRL",
        "EUR",
        "AED",
        "GBP",
      ]),
    );
  });

  it("maps currency codes to representative geo", () => {
    expect(geoFromCurrency("CAD")).toBe("CA");
    expect(geoFromCurrency("NGN")).toBe("NG");
    expect(geoFromCurrency("EUR")).toBe("NL");
    expect(geoFromCurrency("AED")).toBe("AE");
  });

  it("formats IDR without decimals", () => {
    expect(currencyDecimals("IDR")).toBe(0);
    expect(formatAmountFromUsd(99, "IDR")).toBe(String(99 * 16000));
  });

  it("validates supported currency codes", () => {
    expect(isSupportedCurrency("SGD")).toBe(true);
    expect(isSupportedCurrency("xyz")).toBe(false);
  });
});
