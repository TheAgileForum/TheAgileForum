import { describe, expect, it } from "vitest";
import {
  assertInstallmentParity,
  resolvePaymentModes,
} from "./payment-mode.js";

describe("payment mode resolver (FR-170, FR-171)", () => {
  it("India: Razorpay EMI + UPI", () => {
    const modes = resolvePaymentModes("IN");
    expect(modes.countryGroup).toBe("india");
    expect(modes.fullPayProvider).toBe("razorpay");
    expect(modes.installmentProviders).toEqual(["razorpay_emi"]);
    expect(modes.localPaymentMethods).toContain("upi");
    expect(modes.availableModes).toContain("installment");
  });

  it("USA: Stripe + Affirm + Klarna", () => {
    const modes = resolvePaymentModes("US");
    expect(modes.fullPayProvider).toBe("stripe");
    expect(modes.installmentProviders).toEqual(["affirm", "klarna"]);
  });

  it("Canada: Stripe + Affirm + Klarna", () => {
    const modes = resolvePaymentModes("CA");
    expect(modes.installmentProviders).toEqual(["affirm", "klarna"]);
  });

  it("UK: Stripe + Klarna + Clearpay", () => {
    const modes = resolvePaymentModes("GB");
    expect(modes.installmentProviders).toEqual(["klarna", "clearpay"]);
  });

  it("Australia: Stripe + Afterpay + Zip", () => {
    const modes = resolvePaymentModes("AU");
    expect(modes.installmentProviders).toEqual(["afterpay", "zip"]);
  });

  it("New Zealand: Stripe + Afterpay", () => {
    const modes = resolvePaymentModes("NZ");
    expect(modes.installmentProviders).toEqual(["afterpay"]);
  });

  it("Europe: Stripe + Klarna", () => {
    const de = resolvePaymentModes("DE");
    const fr = resolvePaymentModes("FR");
    expect(de.countryGroup).toBe("europe");
    expect(de.installmentProviders).toEqual(["klarna"]);
    expect(fr.installmentProviders).toEqual(["klarna"]);
  });

  it("Singapore: Stripe + Cards + PayNow (no installment)", () => {
    const modes = resolvePaymentModes("SG");
    expect(modes.availableModes).toEqual(["full_pay"]);
    expect(modes.localPaymentMethods).toEqual(["cards", "paynow"]);
    expect(modes.installmentProviders).toEqual([]);
  });

  it("UAE: Stripe + Cards (no installment)", () => {
    const modes = resolvePaymentModes("AE");
    expect(modes.availableModes).toEqual(["full_pay"]);
    expect(modes.localPaymentMethods).toEqual(["cards"]);
  });

  it("unsupported geo falls back to Stripe full pay only", () => {
    const modes = resolvePaymentModes("BR");
    expect(modes.countryGroup).toBe("default");
    expect(modes.fullPayProvider).toBe("stripe");
    expect(modes.availableModes).toEqual(["full_pay"]);
  });

  it("enforces course-page and checkout installment parity (FR-174)", () => {
    expect(assertInstallmentParity("2499.00", "2499.00")).toBe(true);
    expect(assertInstallmentParity("2499.00", "2500.00")).toBe(false);
  });
});
