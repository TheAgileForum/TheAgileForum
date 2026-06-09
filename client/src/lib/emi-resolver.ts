import type { InstallmentPlanQuote } from "./forum-api";
import { formatPrice } from "./format-price";

/** Matches backend pricing-service installment term (FR-174 parity). */
export const EMI_TERM_MONTHS = 6;

export type EmiPreview = {
  monthlyAmount: string;
  termMonths: number;
  currency: string;
  provider: string;
  disclaimer: string;
};

const PROVIDER_DISCLAIMERS: Record<string, string> = {
  razorpay_emi: "Razorpay EMI · Subject to approval · Gateway T&C apply",
  affirm: "Affirm · Subject to approval · Gateway T&C apply",
  klarna: "Klarna · Subject to approval · Gateway T&C apply",
  clearpay: "Clearpay · Subject to approval · Gateway T&C apply",
  afterpay: "Afterpay · Subject to approval · Gateway T&C apply",
  zip: "Zip · Subject to approval · Gateway T&C apply",
};

export function emiPreviewFromPlans(
  plans: InstallmentPlanQuote[] | undefined,
  totalAmount?: string,
  totalCurrency?: string,
): EmiPreview | null {
  const primary = plans?.[0];
  if (!primary) return null;

  const monthlyLabel = formatPrice(primary.currency, primary.monthlyAmount);
  return {
    monthlyAmount: monthlyLabel,
    termMonths: primary.termMonths ?? EMI_TERM_MONTHS,
    currency: primary.currency,
    provider: primary.provider,
    disclaimer:
      PROVIDER_DISCLAIMERS[primary.provider] ??
      "Installment · Subject to approval · Gateway T&C apply",
    ...(totalAmount && totalCurrency
      ? {}
      : {}),
  };
}

/** @deprecated Prefer resolver plans via postInstallmentPlans or priceQuote.installmentPlans */
export function resolveEmiPreview(
  sessionCurrency: string,
  unitPrice: string,
  offeringCurrency: string,
): EmiPreview | null {
  if (offeringCurrency !== sessionCurrency) return null;
  const price = Number.parseFloat(unitPrice);
  if (!Number.isFinite(price) || price <= 0) return null;

  const monthly = (price / EMI_TERM_MONTHS).toFixed(2);
  return {
    monthlyAmount: formatPrice(sessionCurrency, monthly),
    termMonths: EMI_TERM_MONTHS,
    currency: sessionCurrency,
    provider: sessionCurrency === "INR" ? "razorpay_emi" : "klarna",
    disclaimer:
      sessionCurrency === "INR"
        ? PROVIDER_DISCLAIMERS.razorpay_emi
        : "Installment via Affirm/Klarna where available · Subject to approval",
  };
}
