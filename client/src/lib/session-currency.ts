const STORAGE_KEY = "af_session_currency";
const OVERRIDE_KEY = "af_session_currency_user_override";
export const SESSION_CURRENCY_COOKIE = "af_session_currency";

export type SessionCurrency =
  | "USD"
  | "INR"
  | "CAD"
  | "NGN"
  | "AUD"
  | "IDR"
  | "SGD"
  | "BRL"
  | "EUR"
  | "AED"
  | "GBP";

type CurrencyOption = { code: SessionCurrency; label: string; geo: string };

const OPTIONS: CurrencyOption[] = [
  { code: "USD", label: "United States", geo: "US" },
  { code: "INR", label: "India", geo: "IN" },
  { code: "CAD", label: "Canada", geo: "CA" },
  { code: "NGN", label: "Nigeria", geo: "NG" },
  { code: "AUD", label: "Australia", geo: "AU" },
  { code: "IDR", label: "Indonesia", geo: "ID" },
  { code: "SGD", label: "Singapore", geo: "SG" },
  { code: "BRL", label: "Brazil", geo: "BR" },
  { code: "EUR", label: "Europe", geo: "NL" },
  { code: "AED", label: "UAE", geo: "AE" },
  { code: "GBP", label: "United Kingdom", geo: "GB" },
];

function isSessionCurrency(value: string): value is SessionCurrency {
  return OPTIONS.some((o) => o.code === value);
}

function readSessionCurrencyCookie(): SessionCurrency | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${SESSION_CURRENCY_COOKIE}=([^;]+)`),
  );
  const raw = match?.[1]?.trim().toUpperCase();
  if (raw && isSessionCurrency(raw)) return raw;
  return null;
}

/** True when the user chose currency in the header or has a prior-visit cookie override. */
export function hasExplicitSessionCurrencyOverride(): boolean {
  if (sessionStorage.getItem(OVERRIDE_KEY) === "1") return true;
  return readSessionCurrencyCookie() !== null;
}

/** True when geo/currency can be read locally without waiting on currency-context. */
export function hasPersistedSessionCurrency(): boolean {
  if (hasExplicitSessionCurrencyOverride()) return true;
  if (sessionStorage.getItem(STORAGE_KEY)) return true;
  return readSessionCurrencyCookie() !== null;
}

export function markExplicitSessionCurrencyOverride() {
  sessionStorage.setItem(OVERRIDE_KEY, "1");
}

export function getSessionCurrency(): SessionCurrency {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored && isSessionCurrency(stored)) {
    return stored;
  }
  const fromCookie = readSessionCurrencyCookie();
  if (fromCookie) return fromCookie;
  return "USD";
}

export function setSessionCurrency(currency: SessionCurrency) {
  sessionStorage.setItem(STORAGE_KEY, currency);
}

export function listSessionCurrencies(): SessionCurrency[] {
  return OPTIONS.map((o) => o.code);
}

export function listSessionCurrencyOptions(): CurrencyOption[] {
  return OPTIONS;
}

export function sessionCurrencyLabel(currency: SessionCurrency): string {
  return OPTIONS.find((o) => o.code === currency)?.label ?? currency;
}

/** Map session currency to geo for payment-mode resolver (checkout FR-170/171). */
export function geoFromSessionCurrency(currency: SessionCurrency): string {
  return OPTIONS.find((o) => o.code === currency)?.geo ?? "US";
}
