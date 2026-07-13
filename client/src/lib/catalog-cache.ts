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

/** In-memory freshness window for deduped fetches. */
const MEMORY_TTL_MS = 60_000;
/** Stale sessionStorage entries may render instantly while revalidating. */
const PERSIST_STALE_MS = 30 * 60_000;
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

function readPersistedEntry(key: string): CacheEntry | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed?.data?.offerings || typeof parsed.at !== "number") return null;
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
  const promise = listCatalogCategory(categoryPath, query, { geo, currency }, {
    allowRetry: !stale,
  }).then((res) => {
    writeCatalogCache(categoryPath, searchKey, geo, currency, res);
    inflight.delete(key);
    return res;
  }).catch((err) => {
    inflight.delete(key);
    if (stale) return stale.data;
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

/** Prefetch default catalog lists as soon as the forum shell boots. */
export function prefetchDefaultCatalogLists() {
  const categories: CatalogCategoryPath[] = ["trainings", "certifications", "services"];
  for (const category of categories) {
    prefetchCatalogCategory(category);
  }
}

export function sessionPricingForCatalog(): { geo: string; currency: SessionCurrency } {
  const currency = getSessionCurrency();
  return { currency, geo: geoFromSessionCurrency(currency) };
}
