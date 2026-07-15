import { formatPrice } from "./format-price";
import { MENTORSHIP_OFFER_CODE } from "./offer-routes";

const DISPLAY_DISCOUNT_RATE = 0.3;

export type CatalogDisplayPrice = {
  saleFormatted: string;
  mrpFormatted: string;
  discountPercent: number;
  discountLabel: string;
};

/**
 * Per-offering display overrides (card MRP / discount label).
 * Sale amount still comes from the API quote; these only affect strikethrough + %.
 */
const OFFERING_DISPLAY_OVERRIDES: Record<
  string,
  {
    discountRate: number;
    /** Fixed MRP when rounding from sale/(1-rate) should show a clean list price. */
    mrpAmount?: number;
    /** When set, override applies only for these currencies (e.g. Indian customers). */
    currencies?: string[];
  }
> = {
  [MENTORSHIP_OFFER_CODE]: {
    discountRate: 0.5,
    mrpAmount: 60_000,
    currencies: ["INR"],
  },
};

/** Derive strikethrough MRP + sale display when API omits list/sale fields (FR-179). */
export function catalogDisplayPrice(
  currency: string,
  saleAmount: string,
  offeringCode?: string,
): CatalogDisplayPrice {
  const sale = Number.parseFloat(saleAmount);
  if (Number.isNaN(sale) || sale <= 0) {
    return {
      saleFormatted: formatPrice(currency, saleAmount),
      mrpFormatted: "",
      discountPercent: 0,
      discountLabel: "",
    };
  }

  const currencyCode = currency.toUpperCase();
  const override = offeringCode
    ? OFFERING_DISPLAY_OVERRIDES[offeringCode]
    : undefined;
  const overrideApplies =
    override &&
    (!override.currencies ||
      override.currencies.some((c) => c.toUpperCase() === currencyCode));

  const discountRate = overrideApplies
    ? override.discountRate
    : DISPLAY_DISCOUNT_RATE;
  const mrp =
    overrideApplies && override.mrpAmount != null
      ? override.mrpAmount
      : Math.round(sale / (1 - discountRate));
  const discountPercent = Math.round((1 - sale / mrp) * 100);

  return {
    saleFormatted: formatPrice(currency, String(sale)),
    mrpFormatted: formatPrice(currency, String(mrp)),
    discountPercent,
    discountLabel:
      discountPercent > 0
        ? `${discountPercent}% off this week | Lowest Price Guarantee`
        : "",
  };
}
