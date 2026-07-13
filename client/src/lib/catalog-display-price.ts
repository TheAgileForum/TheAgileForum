import { formatPrice } from "./format-price";

const DISPLAY_DISCOUNT_RATE = 0.3;

/** Derive strikethrough MRP + sale display when API omits list/sale fields (FR-179). */
export function catalogDisplayPrice(currency: string, saleAmount: string): {
  saleFormatted: string;
  mrpFormatted: string;
  discountPercent: number;
  discountLabel: string;
} {
  const sale = Number.parseFloat(saleAmount);
  if (Number.isNaN(sale) || sale <= 0) {
    return {
      saleFormatted: formatPrice(currency, saleAmount),
      mrpFormatted: "",
      discountPercent: 0,
      discountLabel: "",
    };
  }

  const mrp = Math.round(sale / (1 - DISPLAY_DISCOUNT_RATE));
  const discountPercent = Math.round((1 - sale / mrp) * 100);

  return {
    saleFormatted: formatPrice(currency, String(sale)),
    mrpFormatted: formatPrice(currency, String(mrp)),
    discountPercent,
    discountLabel:
      discountPercent > 0 ? `${discountPercent}% off this week | Lowest Price Guarantee` : "",
  };
}
