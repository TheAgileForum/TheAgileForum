/**
 * API origin resolution for browser fetches.
 *
 * - Local Vite: same-origin `/api` (vite proxy → localhost:3001).
 * - Deployed app hosts: prefer direct API subdomain (CORS + credentials already wired).
 *   Avoids Vercel `/api` rewrite hop (~0.5–1s measured on staging).
 * - Overrides: `VITE_API_URL` wins when set (preview builds, custom hosts).
 */

const DIRECT_API_BY_HOST: Record<string, string> = {
  "app.staging.theagileforum.com": "https://api.staging.theagileforum.com",
  "app.theagileforum.com": "https://api.theagileforum.com",
};

function isLocalDevHost(hostname: string, protocol: string): boolean {
  return (hostname === "localhost" || hostname === "127.0.0.1") && protocol === "http:";
}

/**
 * Optional absolute API origin (VITE_API_URL), else host-specific direct API, else "".
 * Local Vite always returns "" so the proxy stays in use.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (isLocalDevHost(hostname, protocol)) {
      return "";
    }
  }

  const raw = import.meta.env.VITE_API_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const direct = DIRECT_API_BY_HOST[window.location.hostname];
    if (direct) return direct;
  }

  return "";
}

/** Prefix API paths when an external API base is configured; otherwise same-origin relative paths. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalized}` : normalized;
}
