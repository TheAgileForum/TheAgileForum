export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    retryable?: boolean;
  };
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error?.message ?? "Request failed");
    this.name = "ApiRequestError";
    this.status = status;
    this.code = body.error?.code ?? "REQUEST_FAILED";
    this.retryable = body.error?.retryable ?? false;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!res.ok) {
    throw new ApiRequestError(res.status, data);
  }
  return data;
}
