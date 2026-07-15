import { apiUrl, getApiBaseUrl } from "./api-base.js";

export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ path?: string; code?: string; message?: string }>;
    retryable?: boolean;
  };
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;

  constructor(status: number, body: ApiErrorBody) {
    const detail = body.error?.details?.[0]?.message;
    super(detail ?? body.error?.message ?? "Request failed");
    this.name = "ApiRequestError";
    this.status = status;
    this.code = body.error?.code ?? "REQUEST_FAILED";
    this.retryable = body.error?.retryable ?? false;
  }
}

/** Default request budget so hung proxies/APIs surface an error instead of an infinite spinner. */
const DEFAULT_API_TIMEOUT_MS = 20_000;

/**
 * Catalog listing via same-origin /api (Vercel → Render).
 * Keep long enough for free-tier cold starts (~15–40s) without waiting forever.
 */
export const CATALOG_FETCH_TIMEOUT_MS = 25_000;
/** Direct cross-origin API (dev preview hosts): allow a wider cold-start budget. */
export const CATALOG_FETCH_TIMEOUT_MS_EXTERNAL = 45_000;
/** Upper clamp when catalog retries grow the per-attempt budget. */
const CATALOG_FETCH_TIMEOUT_MS_MAX = 45_000;

export function isSameOriginApi(): boolean {
  return getApiBaseUrl() === "";
}

export function catalogFetchTimeoutMs(): number {
  return isSameOriginApi() ? CATALOG_FETCH_TIMEOUT_MS : CATALOG_FETCH_TIMEOUT_MS_EXTERNAL;
}

/** Checkout start may hit Render cold start plus Stripe session creation. */
export const CHECKOUT_START_TIMEOUT_MS = 45_000;

const RETRYABLE_HTTP_STATUSES = new Set([408, 502, 503, 504]);

const REQUEST_TIMEOUT_MESSAGE =
  "Catalog is taking longer than usual. Please try again in a moment.";

function isRetryableApiError(err: unknown): err is ApiRequestError {
  return (
    err instanceof ApiRequestError &&
    (err.retryable || RETRYABLE_HTTP_STATUSES.has(err.status))
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function apiFetchOnce<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const { timeoutMs = DEFAULT_API_TIMEOUT_MS, signal: outerSignal, ...rest } = init ?? {};
  const controller = new AbortController();
  const onOuterAbort = () => controller.abort(outerSignal?.reason);
  if (outerSignal) {
    if (outerSignal.aborted) controller.abort(outerSignal.reason);
    else outerSignal.addEventListener("abort", onOuterAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(apiUrl(path), {
      credentials: "include",
      ...rest,
      signal: controller.signal,
      headers: {
        // Avoid Content-Type on bodyless GETs so cross-origin catalog calls stay
        // "simple" and skip an OPTIONS preflight round-trip.
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...rest.headers,
      },
    });
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new ApiRequestError(res.status, {
        error: {
          code: "INVALID_API_RESPONSE",
          message:
            "API returned non-JSON (check /api proxy on SPA host or VITE_API_URL).",
          retryable: true,
        },
      });
    }
    const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;
    if (!res.ok) {
      throw new ApiRequestError(res.status, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiRequestError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      // User/navigation abort — do not rebrand as a timeout.
      if (outerSignal?.aborted) throw err;
      throw new ApiRequestError(408, {
        error: {
          code: "REQUEST_TIMEOUT",
          message: REQUEST_TIMEOUT_MESSAGE,
          retryable: true,
        },
      });
    }
    // Transient network blips / cold proxy drops.
    throw new ApiRequestError(0, {
      error: {
        code: "NETWORK_ERROR",
        message: REQUEST_TIMEOUT_MESSAGE,
        retryable: true,
      },
    });
  } finally {
    clearTimeout(timer);
    outerSignal?.removeEventListener("abort", onOuterAbort);
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number; retries?: number },
): Promise<T> {
  const { retries = 0, timeoutMs = DEFAULT_API_TIMEOUT_MS, ...rest } = init ?? {};
  let attempt = 0;
  let budgetMs = timeoutMs;

  while (true) {
    try {
      return await apiFetchOnce<T>(path, { ...rest, timeoutMs: budgetMs });
    } catch (err) {
      if (!isRetryableApiError(err) || attempt >= retries) throw err;
      attempt += 1;
      // Grow budget on later attempts so a cold Render instance can finish waking.
      budgetMs = Math.min(
        Math.max(Math.round(budgetMs * 1.35), catalogFetchTimeoutMs()),
        CATALOG_FETCH_TIMEOUT_MS_MAX,
      );
      await delay(attempt === 1 ? 800 : attempt === 2 ? 2_000 : 3_500);
    }
  }
}

let wakeInflight: Promise<void> | null = null;
let lastWakeAt = 0;
const WAKE_COOLDOWN_MS = 60_000;

/**
 * Fire-and-forget ping so Render can leave spin-down before (or while) catalog loads.
 * Safe to call repeatedly; deduped for 60s.
 */
export function wakeApi(): Promise<void> {
  const now = Date.now();
  if (wakeInflight) return wakeInflight;
  if (now - lastWakeAt < WAKE_COOLDOWN_MS) return Promise.resolve();

  wakeInflight = apiFetchOnce<{ status?: string }>("/api/v1/health", {
    timeoutMs: 20_000,
  })
    .then(() => {
      lastWakeAt = Date.now();
    })
    .catch(() => {
      // Wake is best-effort; catalog fetch retries handle real failures.
    })
    .finally(() => {
      wakeInflight = null;
    });

  return wakeInflight;
}
