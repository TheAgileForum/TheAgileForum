const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  SGD: "S$",
  AED: "AED ",
  NGN: "₦",
  IDR: "Rp",
  BRL: "R$",
};

const ZERO_DECIMAL_CURRENCIES = new Set(["IDR"]);

/** Format catalog/checkout amounts consistently (e.g. INR 33999 → ₹33,999). */
export function formatPrice(currency: string, amount: string): string {
  const code = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOL[code] ?? `${code} `;
  const num = Number.parseFloat(amount);
  if (Number.isNaN(num)) return `${symbol}${amount}`;
  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return `${symbol}${Math.round(num).toLocaleString("en-US")}`;
  }
  const isWhole = Math.abs(num - Math.round(num)) < 0.005;
  if (isWhole) {
    return `${symbol}${Math.round(num).toLocaleString("en-US")}`;
  }
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type PricedOffering = {
  defaultUnitPrice: string;
  currency: string;
  priceQuote?: { amount: string; currency: string };
};

/** Prefer resolver quote (FR-178) over catalog base currency. */
export function resolvedOfferingPrice(offering: PricedOffering): {
  amount: string;
  currency: string;
} {
  if (offering.priceQuote) {
    return { amount: offering.priceQuote.amount, currency: offering.priceQuote.currency };
  }
  return { amount: offering.defaultUnitPrice, currency: offering.currency };
}
