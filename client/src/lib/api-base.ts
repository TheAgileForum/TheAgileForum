/** SPA hosts that proxy /api to the backend via Vercel (see client/vercel.json). */
const SAME_ORIGIN_API_HOSTS = new Set([
  "app.staging.theagileforum.com",
  "app.theagileforum.com",
]);

function isLocalDevHost(hostname: string, protocol: string): boolean {
  return (hostname === "localhost" || hostname === "127.0.0.1") && protocol === "http:";
}

/**
 * Optional absolute API origin (VITE_API_URL).
 * On deployed SPA hosts and local Vite dev, use same-origin /api so Vercel/Vite proxy handles routing.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (SAME_ORIGIN_API_HOSTS.has(hostname) || isLocalDevHost(hostname, protocol)) {
      return "";
    }
  }

  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) return "";
  return raw.replace(/\/$/, "");
}

/** Prefix API paths when an external API base is configured; otherwise same-origin relative paths. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalized}` : normalized;
}
