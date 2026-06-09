const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

/** Format catalog/checkout amounts consistently (e.g. USD 299.00 → $299). */
export function formatPrice(currency: string, amount: string): string {
  const symbol = CURRENCY_SYMBOL[currency.toUpperCase()] ?? `${currency} `;
  const num = Number.parseFloat(amount);
  if (Number.isNaN(num)) return `${symbol}${amount}`;
  const formatted = Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.00$/, "");
  return `${symbol}${formatted}`;
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
