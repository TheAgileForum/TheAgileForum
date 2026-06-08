import type { OfferingMeta } from "./offerings.js";

export function buildCatalogFacets(offerings: OfferingMeta[]) {
  const roles = new Set<string>();
  const certBodies = new Set<string>();
  const deliveryModes = new Set<string>();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  for (const o of offerings) {
    o.roleTags.forEach((r) => roles.add(r));
    if (o.certBody) certBodies.add(o.certBody);
    deliveryModes.add(o.deliveryMode);
    const price = Number.parseFloat(o.defaultUnitPrice);
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
