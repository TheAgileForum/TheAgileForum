import { getEnv } from "../config/env.js";
import type { ExternalCallResult } from "./contracts.js";

type ExternalCallOptions = {
  timeoutMs?: number;
  maxRetries?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: ExternalCallOptions = {},
): Promise<ExternalCallResult<T>> {
  const env = getEnv();
  const timeoutMs = options.timeoutMs ?? env.INTEGRATION_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? env.INTEGRATION_MAX_RETRIES;

  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt += 1;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Integration timeout after ${timeoutMs}ms`)), timeoutMs);
      });
      const data = await Promise.race([operation(), timeoutPromise]);
      return { ok: true, data, attempts: attempt };
    } catch (error) {
      if (attempt > maxRetries) {
        return {
          ok: false,
          attempts: attempt,
          error: error instanceof Error ? error.message : String(error),
        };
      }
      const backoffMs = Math.pow(2, attempt - 1) * 100;
      await sleep(backoffMs);
    }
  }

  return { ok: false, attempts: attempt, error: "Unknown integration execution failure" };
}
