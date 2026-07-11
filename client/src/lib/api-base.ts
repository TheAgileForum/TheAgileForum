/** Optional absolute API origin for staging/prod (e.g. https://api.staging.example.com). */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) return "";
  return raw.replace(/\/$/, "");
}

/** Prefix API paths when VITE_API_URL is set; otherwise same-origin relative paths. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalized}` : normalized;
}
