import type { CurrencyContext } from "../pricing/pricing-service.js";
import { quoteOfferingPrice } from "../pricing/pricing-service.js";
import type { OfferingMeta } from "./offerings.js";

function sessionUnitPrice(
  offering: OfferingMeta,
  context?: CurrencyContext,
): number {
  if (context) {
    return Number.parseFloat(quoteOfferingPrice(offering, context).amount);
  }
  return Number.parseFloat(offering.defaultUnitPrice);
}

/** Facets for browse UI. Price range uses session currency when context is provided (FR-178). */
export function buildCatalogFacets(
  offerings: OfferingMeta[],
  context?: CurrencyContext,
) {
  const roles = new Set<string>();
  const certBodies = new Set<string>();
  const deliveryModes = new Set<string>();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  for (const o of offerings) {
    o.roleTags.forEach((r) => roles.add(r));
    if (o.certBody) certBodies.add(o.certBody);
    deliveryModes.add(o.deliveryMode);
    const price = sessionUnitPrice(o, context);
    if (Number.isFinite(price)) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }
  }

  return {
    roles: [...roles].sort(),
    certBodies: [...certBodies].sort(),
    deliveryModes: [...deliveryModes].sort(),
    priceRange:
      minPrice === Number.POSITIVE_INFINITY
        ? null
        : { min: minPrice, max: maxPrice },
    upcomingBatchCount: offerings.filter((o) => o.upcomingBatchId).length,
  };
}
