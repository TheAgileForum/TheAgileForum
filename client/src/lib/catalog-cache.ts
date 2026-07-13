import {
  filtersToApiQuery,
  parseCatalogFilters,
  type CatalogCategoryPath,
} from "./catalog-filters";
import {
  geoFromSessionCurrency,
  getSessionCurrency,
  type SessionCurrency,
} from "./session-currency";
import {
  listCatalogCategory,
  type CatalogListResponse,
} from "./forum-api";

const CACHE_TTL_MS = 60_000;

type CacheEntry = {
  data: CatalogListResponse;
  at: number;
};

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CatalogListResponse>>();

export function catalogCacheKey(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
  geo: string,
  currency: string,
): string {
  return `${categoryPath}|${searchKey}|${geo}|${currency}`;
}

function readEntry(key: string): CatalogListResponse | null {
  const entry = memory.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    memory.delete(key);
    return null;
  }
  return entry.data;
}

export function peekCatalogCache(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
  geo: string,
  currency: string,
): CatalogListResponse | null {
  return readEntry(catalogCacheKey(categoryPath, searchKey, geo, currency));
}

export function writeCatalogCache(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
  geo: string,
  currency: string,
  data: CatalogListResponse,
) {
  memory.set(catalogCacheKey(categoryPath, searchKey, geo, currency), {
    data,
    at: Date.now(),
  });
}

export async function fetchCatalogCategoryCached(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
  geo: string,
  currency: string,
): Promise<CatalogListResponse> {
  const key = catalogCacheKey(categoryPath, searchKey, geo, currency);
  const cached = readEntry(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const query = filtersToApiQuery(parseCatalogFilters(searchKey));
  const promise = listCatalogCategory(categoryPath, query, { geo, currency }).then((res) => {
    memory.set(key, { data: res, at: Date.now() });
    inflight.delete(key);
    return res;
  }).catch((err) => {
    inflight.delete(key);
    throw err;
  });
  inflight.set(key, promise);
  return promise;
}

/** Warm catalog list on nav hover; uses session currency/geo. */
export function prefetchCatalogCategory(categoryPath: CatalogCategoryPath) {
  const currency = getSessionCurrency();
  const geo = geoFromSessionCurrency(currency);
  const key = catalogCacheKey(categoryPath, "", geo, currency);
  if (readEntry(key) || inflight.has(key)) return;
  void fetchCatalogCategoryCached(categoryPath, "", geo, currency);
}

export function sessionPricingForCatalog(): { geo: string; currency: SessionCurrency } {
  const currency = getSessionCurrency();
  return { currency, geo: geoFromSessionCurrency(currency) };
}
