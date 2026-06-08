import { getOfferingFromCatalog } from "../catalog/catalog-repository.js";
import {
  buildInstallmentPlans,
  INSTALLMENT_TERM_MONTHS,
  quoteOfferingPrice,
  resolveCurrencyContext,
} from "../pricing/pricing-service.js";

export type InstallmentPlanQuote = {
  provider: string;
  monthlyAmount: string;
  currency: string;
  termMonths: number;
};

export type InstallmentPlansResult = {
  offerId: string | null;
  amount: string;
  currency: string;
  geo: string;
  plans: InstallmentPlanQuote[];
  provider: string | null;
  disclaimerRef: "gateway";
};

function toPlanQuotes(
  plans: NonNullable<ReturnType<typeof buildInstallmentPlans>>,
): InstallmentPlanQuote[] {
  return plans.map((plan) => ({
    provider: plan.provider,
    monthlyAmount: plan.monthlyAmount,
    currency: plan.currency,
    termMonths: INSTALLMENT_TERM_MONTHS,
  }));
}

/** Quote installment plans from resolver SSOT (FR-174, api-contract-matrix). */
export async function quoteInstallmentPlans(input: {
  offerId?: string;
  amount?: string;
  currency: string;
  geo: string;
}): Promise<InstallmentPlansResult> {
  const context = resolveCurrencyContext({
    geo: input.geo,
    currencyOverride: input.currency,
  });

  let amount = input.amount?.trim();
  const offerId = input.offerId?.trim() || null;

  if (offerId) {
    const offering = await getOfferingFromCatalog(offerId);
    if (offering) {
      const quote = quoteOfferingPrice(offering, context);
      amount = quote.amount;
      const plans = quote.installmentPlans;
      return {
        offerId,
        amount: quote.amount,
        currency: quote.currency,
        geo: context.geoDetected,
        plans: plans ? toPlanQuotes(plans) : [],
        provider: plans?.[0]?.provider ?? null,
        disclaimerRef: "gateway",
      };
    }
  }

  if (!amount) {
    return {
      offerId,
      amount: "0.00",
      currency: context.currency,
      geo: context.geoDetected,
      plans: [],
      provider: null,
      disclaimerRef: "gateway",
    };
  }

  const plans = buildInstallmentPlans(amount, context.currency, context.geoDetected);
  return {
    offerId,
    amount,
    currency: context.currency,
    geo: context.geoDetected,
    plans: plans ? toPlanQuotes(plans) : [],
    provider: plans?.[0]?.provider ?? null,
    disclaimerRef: "gateway",
  };
}
