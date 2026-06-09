export type PaymentMode = "full_pay" | "installment";

export type FullPayProvider = "stripe" | "razorpay";

export type InstallmentProvider =
  | "razorpay_emi"
  | "affirm"
  | "klarna"
  | "clearpay"
  | "afterpay"
  | "zip";

export type LocalPaymentMethod = "upi" | "paynow" | "cards";

export type CountryGroup =
  | "india"
  | "usa"
  | "canada"
  | "uk"
  | "australia"
  | "new_zealand"
  | "europe"
  | "singapore"
  | "uae"
  | "default";

export type PaymentModeResolution = {
  countryGroup: CountryGroup;
  availableModes: PaymentMode[];
  fullPayProvider: FullPayProvider;
  installmentProviders: InstallmentProvider[];
  localPaymentMethods: LocalPaymentMethod[];
  disclaimerSource: "gateway";
};

const EU_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "CH",
  "CZ",
  "DE",
  "DK",
  "ES",
  "FI",
  "FR",
  "GR",
  "HU",
  "IE",
  "IT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
]);

function normalizeGeo(geo: string): string {
  return geo.trim().toUpperCase();
}

function resolveCountryGroup(geo: string): CountryGroup {
  const code = normalizeGeo(geo);

  if (code === "IN" || code === "INDIA") return "india";
  if (code === "US" || code === "USA") return "usa";
  if (code === "CA" || code === "CANADA") return "canada";
  if (code === "GB" || code === "UK") return "uk";
  if (code === "AU" || code === "AUSTRALIA") return "australia";
  if (code === "NZ" || code === "NEW ZEALAND") return "new_zealand";
  if (code === "SG" || code === "SINGAPORE") return "singapore";
  if (code === "AE" || code === "UAE") return "uae";
  if (EU_COUNTRY_CODES.has(code)) return "europe";

  return "default";
}

/** Resolve checkout payment options by geography (FR-170, FR-171). */
export function resolvePaymentModes(geo: string): PaymentModeResolution {
  const countryGroup = resolveCountryGroup(geo);

  switch (countryGroup) {
    case "india":
      return {
        countryGroup,
        availableModes: ["full_pay", "installment"],
        fullPayProvider: "razorpay",
        installmentProviders: ["razorpay_emi"],
        localPaymentMethods: ["upi"],
        disclaimerSource: "gateway",
      };
    case "usa":
    case "canada":
      return {
        countryGroup,
        availableModes: ["full_pay", "installment"],
        fullPayProvider: "stripe",
        installmentProviders: ["affirm", "klarna"],
        localPaymentMethods: [],
        disclaimerSource: "gateway",
      };
    case "uk":
      return {
        countryGroup,
        availableModes: ["full_pay", "installment"],
        fullPayProvider: "stripe",
        installmentProviders: ["klarna", "clearpay"],
        localPaymentMethods: [],
        disclaimerSource: "gateway",
      };
    case "australia":
      return {
        countryGroup,
        availableModes: ["full_pay", "installment"],
        fullPayProvider: "stripe",
        installmentProviders: ["afterpay", "zip"],
        localPaymentMethods: [],
        disclaimerSource: "gateway",
      };
    case "new_zealand":
      return {
        countryGroup,
        availableModes: ["full_pay", "installment"],
        fullPayProvider: "stripe",
        installmentProviders: ["afterpay"],
        localPaymentMethods: [],
        disclaimerSource: "gateway",
      };
    case "europe":
      return {
        countryGroup,
        availableModes: ["full_pay", "installment"],
        fullPayProvider: "stripe",
        installmentProviders: ["klarna"],
        localPaymentMethods: [],
        disclaimerSource: "gateway",
      };
    case "singapore":
      return {
        countryGroup,
        availableModes: ["full_pay"],
        fullPayProvider: "stripe",
        installmentProviders: [],
        localPaymentMethods: ["cards", "paynow"],
        disclaimerSource: "gateway",
      };
    case "uae":
      return {
        countryGroup,
        availableModes: ["full_pay"],
        fullPayProvider: "stripe",
        installmentProviders: [],
        localPaymentMethods: ["cards"],
        disclaimerSource: "gateway",
      };
    default:
      return {
        countryGroup,
        availableModes: ["full_pay"],
        fullPayProvider: "stripe",
        installmentProviders: [],
        localPaymentMethods: [],
        disclaimerSource: "gateway",
      };
  }
}

export function assertInstallmentParity(
  previewAmount: string,
  checkoutAmount: string,
): boolean {
  return previewAmount === checkoutAmount;
}
