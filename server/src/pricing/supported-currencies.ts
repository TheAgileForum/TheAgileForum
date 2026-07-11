export type SupportedCurrency = {
  code: string;
  label: string;
  geo: string;
  decimals: number;
};

/** Session + geo-default currencies (FR-178). */
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  { code: "USD", label: "United States", geo: "US", decimals: 2 },
  { code: "INR", label: "India", geo: "IN", decimals: 2 },
  { code: "CAD", label: "Canada", geo: "CA", decimals: 2 },
  { code: "NGN", label: "Nigeria", geo: "NG", decimals: 2 },
  { code: "AUD", label: "Australia", geo: "AU", decimals: 2 },
  { code: "IDR", label: "Indonesia", geo: "ID", decimals: 0 },
  { code: "SGD", label: "Singapore", geo: "SG", decimals: 2 },
  { code: "BRL", label: "Brazil", geo: "BR", decimals: 2 },
  { code: "EUR", label: "Europe", geo: "NL", decimals: 2 },
  { code: "AED", label: "UAE", geo: "AE", decimals: 2 },
  { code: "GBP", label: "United Kingdom", geo: "GB", decimals: 2 },
];

export const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code);

export const GEO_DEFAULT_CURRENCY: Record<string, string> = {
  IN: "INR",
  US: "USD",
  CA: "CAD",
  NG: "NGN",
  GB: "GBP",
  AU: "AUD",
  ID: "IDR",
  NZ: "NZD",
  SG: "SGD",
  BR: "BRL",
  NL: "EUR",
  AE: "AED",
  DE: "EUR",
  FR: "EUR",
};

/** Stub FX rates from USD catalog base price (FR-178). */
export const USD_CONVERSION_RATES: Record<string, number> = {
  USD: 1,
  INR: 83,
  CAD: 1.36,
  NGN: 1500,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.35,
  AUD: 1.52,
  NZD: 1.64,
  EUR: 0.92,
  IDR: 16000,
  BRL: 5.0,
};

export function currencyDecimals(code: string): number {
  const match = SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase());
  return match?.decimals ?? 2;
}

export function formatAmountFromUsd(amountUsd: number, targetCurrency: string): string {
  const code = targetCurrency.toUpperCase();
  const rate = USD_CONVERSION_RATES[code] ?? 1;
  const raw = amountUsd * rate;
  return raw.toFixed(currencyDecimals(code));
}

export function geoFromCurrency(code: string): string {
  const match = SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase());
  return match?.geo ?? "US";
}

export function isSupportedCurrency(code: string): boolean {
  return SUPPORTED_CURRENCY_CODES.includes(code.toUpperCase());
}
