import { apiUrl } from "./api-base.js";

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

/** Catalog list may wait on Render cold start behind the Vercel /api proxy. */
export const CATALOG_FETCH_TIMEOUT_MS = 30_000;

/** Checkout start may hit Render cold start plus Stripe session creation. */
export const CHECKOUT_START_TIMEOUT_MS = 45_000;

const RETRYABLE_HTTP_STATUSES = new Set([408, 502, 503, 504]);

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
        "Content-Type": "application/json",
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
      throw new ApiRequestError(408, {
        error: {
          code: "REQUEST_TIMEOUT",
          message: "Request timed out. The server may be waking up — please try again.",
          retryable: true,
        },
      });
    }
    throw err;
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
      budgetMs = Math.max(budgetMs, CATALOG_FETCH_TIMEOUT_MS);
      await delay(1_500);
    }
  }
}
