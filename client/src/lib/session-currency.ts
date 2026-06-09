const KEY = "af_session_currency";

export type SessionCurrency = "USD" | "INR" | "EUR" | "GBP";

const OPTIONS: SessionCurrency[] = ["USD", "INR", "EUR", "GBP"];

export function getSessionCurrency(): SessionCurrency {
  const stored = sessionStorage.getItem(KEY);
  if (stored && OPTIONS.includes(stored as SessionCurrency)) {
    return stored as SessionCurrency;
  }
  return "USD";
}

export function setSessionCurrency(currency: SessionCurrency) {
  sessionStorage.setItem(KEY, currency);
}

export function listSessionCurrencies(): SessionCurrency[] {
  return OPTIONS;
}

/** Map session currency to geo for payment-mode resolver (checkout FR-170/171). */
export function geoFromSessionCurrency(currency: SessionCurrency): string {
  switch (currency) {
    case "INR":
      return "IN";
    case "GBP":
      return "GB";
    case "EUR":
      return "DE";
    default:
      return "US";
  }
}
