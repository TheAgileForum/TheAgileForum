import type { OfferingMeta } from "./offerings.js";

export type OfferingCategory = "training" | "certification" | "service";

export type CatalogFilterQuery = {
  category?: OfferingCategory;
  role?: string;
  certBody?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryMode?: "live" | "self_paced";
  hasUpcomingBatch?: boolean;
};

function parsePrice(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function filterOfferings(
  offerings: OfferingMeta[],
  query: CatalogFilterQuery,
): OfferingMeta[] {
  return offerings.filter((offering) => {
    if (query.category && offering.category !== query.category) {
      return false;
    }
    if (query.role && !offering.roleTags.includes(query.role)) {
      return false;
    }
    if (query.certBody && offering.certBody !== query.certBody) {
      return false;
    }
    const price = parsePrice(offering.defaultUnitPrice);
    if (query.minPrice !== undefined && price < query.minPrice) {
      return false;
    }
    if (query.maxPrice !== undefined && price > query.maxPrice) {
      return false;
    }
    if (query.deliveryMode && offering.deliveryMode !== query.deliveryMode) {
      return false;
    }
    if (query.hasUpcomingBatch === true && !offering.upcomingBatchId) {
      return false;
    }
    return true;
  });
}

export function parseCatalogFilterQuery(
  params: Record<string, string | undefined>,
): CatalogFilterQuery {
  const minPrice = params.min_price ? Number(params.min_price) : undefined;
  const maxPrice = params.max_price ? Number(params.max_price) : undefined;
  const hasUpcomingBatch =
    params.upcoming_batch === "true" || params.upcoming_batch === "1"
      ? true
      : params.upcoming_batch === "false" || params.upcoming_batch === "0"
        ? false
        : undefined;

  return {
    category: params.category as OfferingCategory | undefined,
    role: params.role,
    certBody: params.cert_body,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    deliveryMode: params.delivery_mode as "live" | "self_paced" | undefined,
    hasUpcomingBatch,
  };
}
