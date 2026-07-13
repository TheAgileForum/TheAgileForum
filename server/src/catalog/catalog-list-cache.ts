const CACHE_TTL_MS = 60_000;

type CacheEntry<T> = {
  value: T;
  at: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export function readCatalogListCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function writeCatalogListCache<T>(key: string, value: T) {
  cache.set(key, { value, at: Date.now() });
}

export function catalogListCacheKey(parts: Record<string, string | undefined>): string {
  return Object.keys(parts)
    .sort()
    .map((k) => `${k}=${parts[k] ?? ""}`)
    .join("&");
}
