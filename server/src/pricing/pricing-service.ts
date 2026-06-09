import type { Request } from "express";
import { resolvePaymentModes } from "../commerce/payment-mode.js";
import type { OfferingMeta } from "../catalog/offerings.js";
import { getOffering } from "../catalog/offerings.js";

export type CurrencySource = "geo" | "user";

export type CurrencyContext = {
  currency: string;
  geoDetected: string;
  source: CurrencySource;
};

export type PriceQuote = {
  offerId: string;
  amount: string;
  currency: string;
  installmentPlans?: Array<{
    provider: string;
    monthlyAmount: string;
    currency: string;
  }>;
};

export type PricingHttpInput = {
  geo?: string;
  currencyOverride?: string;
  sessionCurrencyCookie?: string;
};

export const SESSION_CURRENCY_COOKIE = "af_session_currency";

export const SESSION_CURRENCY_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const GEO_DEFAULT_CURRENCY: Record<string, string> = {
  IN: "INR",
  US: "USD",
  CA: "USD",
  GB: "GBP",
  AU: "AUD",
  NZ: "NZD",
  SG: "SGD",
  AE: "AED",
  DE: "EUR",
  FR: "EUR",
};

/** Installment term shared across catalog, checkout, and payments APIs (FR-174). */
export const INSTALLMENT_TERM_MONTHS = 6;

const USD_CONVERSION_RATES: Record<string, number> = {
  USD: 1,
  INR: 83,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.35,
  AUD: 1.52,
  NZD: 1.64,
  EUR: 0.92,
};

const GEO_HEADER_KEYS = ["x-geo", "cf-ipcountry", "x-vercel-ip-country"] as const;

function normalizeGeo(geo: string): string {
  const code = geo.trim().toUpperCase();
  if (code === "INDIA") return "IN";
  if (code === "USA") return "US";
  if (code === "UK") return "GB";
  if (code === "UAE") return "AE";
  return code;
}

function headerValue(
  headers: Request["headers"],
  key: string,
): string | undefined {
  const raw = headers[key];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && raw[0]?.trim()) return raw[0].trim();
  return undefined;
}

/** Geo-detect stub from query param or common CDN/proxy headers (FR-178). */
export function detectGeo(input: PricingHttpInput): string {
  if (input.geo?.trim()) {
    return normalizeGeo(input.geo);
  }
  return "US";
}

export function detectGeoFromRequest(req: Request): string {
  const queryGeo =
    typeof req.query.geo === "string" ? req.query.geo : undefined;
  if (queryGeo?.trim()) {
    return normalizeGeo(queryGeo);
  }

  for (const key of GEO_HEADER_KEYS) {
    const value = headerValue(req.headers, key);
    if (value) return normalizeGeo(value);
  }

  return "US";
}

export function parsePricingInputFromRequest(req: Request): PricingHttpInput {
  const geo = detectGeoFromRequest(req);
  const currencyOverride =
    typeof req.query.currency_override === "string"
      ? req.query.currency_override
      : typeof req.query.currency === "string"
        ? req.query.currency
        : undefined;
  const sessionCurrencyCookie = readSessionCurrencyCookie(req.cookies);

  return { geo, currencyOverride, sessionCurrencyCookie };
}

export function readSessionCurrencyCookie(
  cookies: Record<string, unknown> | undefined,
): string | undefined {
  const raw = cookies?.[SESSION_CURRENCY_COOKIE];
  return typeof raw === "string" && raw.trim() ? raw.trim().toUpperCase() : undefined;
}

/** Resolve session currency from geo-detect with optional user override (FR-178). */
export function resolveCurrencyContext(input: PricingHttpInput): CurrencyContext {
  const geoDetected = detectGeo(input);
  const geoCurrency = GEO_DEFAULT_CURRENCY[geoDetected] ?? "USD";
  const override =
    input.currencyOverride?.trim() || input.sessionCurrencyCookie?.trim();

  if (override) {
    return {
      currency: override.toUpperCase(),
      geoDetected,
      source: "user",
    };
  }

  return {
    currency: geoCurrency,
    geoDetected,
    source: "geo",
  };
}

export function convertFromUsd(amountUsd: number, targetCurrency: string): string {
  const rate = USD_CONVERSION_RATES[targetCurrency] ?? 1;
  return (amountUsd * rate).toFixed(2);
}

function amountUsdFromOffering(offering: Pick<OfferingMeta, "defaultUnitPrice">): number {
  return Number.parseFloat(offering.defaultUnitPrice);
}

export function buildInstallmentPlans(
  amount: string,
  currency: string,
  geo: string,
): PriceQuote["installmentPlans"] {
  const paymentModes = resolvePaymentModes(geo);
  const amountNum = Number.parseFloat(amount);
  if (
    paymentModes.installmentProviders.length === 0 ||
    !Number.isFinite(amountNum) ||
    amountNum <= 0
  ) {
    return undefined;
  }
  const monthly = (amountNum / INSTALLMENT_TERM_MONTHS).toFixed(2);
  return paymentModes.installmentProviders.map((provider) => ({
    provider,
    monthlyAmount: monthly,
    currency,
  }));
}

export function quoteOfferingPrice(
  offering: Pick<OfferingMeta, "code" | "defaultUnitPrice">,
  context: CurrencyContext,
): PriceQuote {
  const amountUsd = amountUsdFromOffering(offering);
  const amount = convertFromUsd(amountUsd, context.currency);
  const paymentModes = resolvePaymentModes(context.geoDetected);
  const quote: PriceQuote = {
    offerId: offering.code,
    amount,
    currency: context.currency,
  };

  quote.installmentPlans = buildInstallmentPlans(
    amount,
    context.currency,
    context.geoDetected,
  );

  return quote;
}

export function quoteOfferings(input: {
  offerIds: string[];
  currency: string;
  geo: string;
}): { quotes: PriceQuote[]; currency: string } {
  const context = resolveCurrencyContext({
    geo: input.geo,
    currencyOverride: input.currency,
  });
  const quotes: PriceQuote[] = [];

  for (const offerId of input.offerIds) {
    const offering = getOffering(offerId);
    if (!offering) continue;
    quotes.push(quoteOfferingPrice(offering, context));
  }

  return { quotes, currency: context.currency };
}

export type ResolvedCartLine = {
  offeringCode: string;
  quantity: number;
  unitPrice: string;
  currency: string;
  lineTotal: string;
};

export async function resolveCartLineTotals(
  items: Array<{ offeringCode: string; quantity: number }>,
  context: CurrencyContext,
  lookupOffering: (code: string) => Promise<Pick<OfferingMeta, "code" | "defaultUnitPrice"> | null>,
): Promise<{ currency: string; subtotal: string; lines: ResolvedCartLine[] }> {
  const lines: ResolvedCartLine[] = [];
  let subtotal = 0;

  for (const item of items) {
    const offering = await lookupOffering(item.offeringCode);
    if (!offering) continue;
    const quote = quoteOfferingPrice(offering, context);
    const lineTotal = (Number.parseFloat(quote.amount) * item.quantity).toFixed(2);
    subtotal += Number.parseFloat(lineTotal);
    lines.push({
      offeringCode: item.offeringCode,
      quantity: item.quantity,
      unitPrice: quote.amount,
      currency: context.currency,
      lineTotal,
    });
  }

  return {
    currency: context.currency,
    subtotal: subtotal.toFixed(2),
    lines,
  };
}
