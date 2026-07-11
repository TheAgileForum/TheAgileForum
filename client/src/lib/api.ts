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
const DEFAULT_API_TIMEOUT_MS = 12_000;

export async function apiFetch<T>(
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
          message: "Request timed out. Check that the API server is running.",
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
