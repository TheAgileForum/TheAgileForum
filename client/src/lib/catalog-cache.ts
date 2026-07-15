import { wakeApi } from "./api";
import {
  filtersToApiQuery,
  parseCatalogFilters,
  type CatalogCategoryPath,
} from "./catalog-filters";
import {
  geoFromSessionCurrency,
  getSessionCurrency,
  hasPersistedSessionCurrency,
  type SessionCurrency,
} from "./session-currency";
import {
  listCatalogCategory,
  type CatalogListResponse,
} from "./forum-api";

/** In-memory freshness window for deduped fetches. */
const MEMORY_TTL_MS = 60_000;
/** Stale sessionStorage entries may render instantly while revalidating. */
const PERSIST_STALE_MS = 2 * 60 * 60_000;
const STORAGE_PREFIX = "af_catalog_cache_v1:";

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

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function hasOfferings(data: CatalogListResponse | undefined): boolean {
  return Array.isArray(data?.offerings) && data.offerings.length > 0;
}

function readPersistedEntry(key: string): CacheEntry | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!hasOfferings(parsed?.data) || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > PERSIST_STALE_MS) {
      sessionStorage.removeItem(storageKey(key));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedEntry(key: string, entry: CacheEntry) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    // Quota or private mode — memory cache still works for this session.
  }
}

function readFreshEntry(key: string): CatalogListResponse | null {
  const entry = memory.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > MEMORY_TTL_MS) {
    memory.delete(key);
    return null;
  }
  return entry.data;
}

function readAnyEntry(key: string): { data: CatalogListResponse; stale: boolean } | null {
  const fresh = readFreshEntry(key);
  if (fresh) return { data: fresh, stale: false };

  const mem = memory.get(key);
  if (mem) return { data: mem.data, stale: true };

  const persisted = readPersistedEntry(key);
  if (persisted) {
    memory.set(key, persisted);
    return { data: persisted.data, stale: true };
  }
  return null;
}

export function peekCatalogCache(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
  geo: string,
  currency: string,
): CatalogListResponse | null {
  return readAnyEntry(catalogCacheKey(categoryPath, searchKey, geo, currency))?.data ?? null;
}

/** Stale catalog list for same category/filters regardless of geo/currency (pricing flip fallback). */
export function peekCatalogCacheAnyPricing(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
): CatalogListResponse | null {
  const prefix = `${categoryPath}|${searchKey}|`;
  let newest: CacheEntry | null = null;

  for (const [key, entry] of memory.entries()) {
    if (!key.startsWith(prefix) || !hasOfferings(entry.data)) continue;
    if (!newest || entry.at > newest.at) newest = entry;
  }

  if (typeof sessionStorage !== "undefined") {
    try {
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const storageItemKey = sessionStorage.key(i);
        if (!storageItemKey?.startsWith(STORAGE_PREFIX)) continue;
        const cacheKey = storageItemKey.slice(STORAGE_PREFIX.length);
        if (!cacheKey.startsWith(prefix)) continue;
        const entry = readPersistedEntry(cacheKey);
        if (!entry) continue;
        if (!newest || entry.at > newest.at) newest = entry;
      }
    } catch {
      // Private mode / quota — memory scan above is enough.
    }
  }

  return newest?.data ?? null;
}

export function hasCatalogCache(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
  geo: string,
  currency: string,
): boolean {
  return readAnyEntry(catalogCacheKey(categoryPath, searchKey, geo, currency)) !== null;
}

export function writeCatalogCache(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
  geo: string,
  currency: string,
  data: CatalogListResponse,
) {
  const key = catalogCacheKey(categoryPath, searchKey, geo, currency);
  const entry = { data, at: Date.now() };
  memory.set(key, entry);
  writePersistedEntry(key, entry);
}

export async function fetchCatalogCategoryCached(
  categoryPath: CatalogCategoryPath,
  searchKey: string,
  geo: string,
  currency: string,
): Promise<CatalogListResponse> {
  const key = catalogCacheKey(categoryPath, searchKey, geo, currency);
  const fresh = readFreshEntry(key);
  if (fresh) return fresh;

  const pending = inflight.get(key);
  if (pending) return pending;

  const stale = readAnyEntry(key);
  const query = filtersToApiQuery(parseCatalogFilters(searchKey));
  const anyPricingStale = peekCatalogCacheAnyPricing(categoryPath, searchKey);
  const hasFallback = Boolean(stale || anyPricingStale);

  // Wake Render in parallel with the first uncached load (and quietly on revalidate).
  void wakeApi();

  const promise = listCatalogCategory(categoryPath, query, { geo, currency }, {
    // Uncached: full cold-start budget. Cached: still retry once so a single 5xx doesn't stick.
    retries: hasFallback ? 1 : 2,
  }).then((res) => {
    if (hasOfferings(res)) {
      writeCatalogCache(categoryPath, searchKey, geo, currency, res);
    }
    inflight.delete(key);
    return res;
  }).catch((err) => {
    inflight.delete(key);
    if (stale) return stale.data;
    if (anyPricingStale) return anyPricingStale;
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
  if (readFreshEntry(key) || inflight.has(key)) return;
  void fetchCatalogCategoryCached(categoryPath, "", geo, currency);
}

/**
 * Prefetch default catalog lists once session currency is known.
 * Skipping before that avoids a wasted USD fetch that geo would replace with INR.
 */
export function prefetchDefaultCatalogLists() {
  if (!hasPersistedSessionCurrency()) return;
  void wakeApi();
  const categories: CatalogCategoryPath[] = ["trainings", "certifications", "services"];
  for (const category of categories) {
    prefetchCatalogCategory(category);
  }
}

export function sessionPricingForCatalog(): { geo: string; currency: SessionCurrency } {
  const currency = getSessionCurrency();
  return { currency, geo: geoFromSessionCurrency(currency) };
}
