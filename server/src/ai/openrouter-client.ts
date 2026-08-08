import { getEnv } from "../config/env.js";
import { logInfo, logWarn } from "../runtime/logger.js";

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_RETRIES = 2;

export type OpenRouterChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenRouterUsage = {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
};

export type OpenRouterChatResult = {
  content: string;
  model: string;
  usage: OpenRouterUsage;
  latencyMs: number;
  attempts: number;
};

export type OpenRouterChatOptions = {
  model?: string;
  messages: OpenRouterChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
  timeoutMs?: number;
  maxRetries?: number;
  /** Optional HTTP fetch override for tests. */
  fetchImpl?: typeof fetch;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseUsage(raw: unknown): OpenRouterUsage {
  if (!raw || typeof raw !== "object") {
    return { promptTokens: null, completionTokens: null, totalTokens: null };
  }
  const usage = raw as Record<string, unknown>;
  const asInt = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
  return {
    promptTokens: asInt(usage.prompt_tokens),
    completionTokens: asInt(usage.completion_tokens),
    totalTokens: asInt(usage.total_tokens),
  };
}

export class OpenRouterError extends Error {
  readonly status?: number;
  readonly retryable: boolean;

  constructor(message: string, options?: { status?: number; retryable?: boolean }) {
    super(message);
    this.name = "OpenRouterError";
    this.status = options?.status;
    this.retryable = options?.retryable ?? true;
  }
}

/**
 * OpenAI-compatible chat completions via OpenRouter.
 * Retries transient failures with exponential backoff; logs token usage on success.
 */
export async function openRouterChatCompletion(
  options: OpenRouterChatOptions,
): Promise<OpenRouterChatResult> {
  const env = getEnv();
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError("OPENROUTER_API_KEY is not configured", {
      retryable: false,
    });
  }

  const model = options.model ?? env.OPENROUTER_MODEL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const fetchImpl = options.fetchImpl ?? fetch;
  const startedAt = Date.now();

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    attempt += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(OPENROUTER_CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_PUBLIC_URL ?? "https://www.theagileforum.com",
          "X-Title": "The Agile Forum Diagnosis",
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 2048,
          ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
        }),
        signal: controller.signal,
      });

      const bodyText = await response.text();
      let parsed: Record<string, unknown> = {};
      try {
        parsed = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
      } catch {
        throw new OpenRouterError(`OpenRouter returned non-JSON (HTTP ${response.status})`, {
          status: response.status,
          retryable: response.status >= 500,
        });
      }

      if (!response.ok) {
        const errObj = parsed.error as { message?: string } | undefined;
        const upstream = errObj?.message ?? `OpenRouter HTTP ${response.status}`;
        const message = `OpenRouter model=${model} HTTP ${response.status}: ${upstream}`;
        const retryable = response.status === 429 || response.status >= 500;
        throw new OpenRouterError(message, { status: response.status, retryable });
      }

      const choices = parsed.choices as Array<{ message?: { content?: string } }> | undefined;
      const content = choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new OpenRouterError("OpenRouter response missing message content", {
          retryable: false,
        });
      }

      const usage = parseUsage(parsed.usage);
      const latencyMs = Date.now() - startedAt;
      const resolvedModel = typeof parsed.model === "string" ? parsed.model : model;

      logInfo("openrouter.chat.completed", {
        component: "ai",
        event: "openrouter.chat.completed",
        model: resolvedModel,
        latencyMs,
        attempts: attempt,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
      });

      return {
        content,
        model: resolvedModel,
        usage,
        latencyMs,
        attempts: attempt,
      };
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new OpenRouterError(String(error));
      if (err.name === "AbortError") {
        lastError = new OpenRouterError(`OpenRouter timeout after ${timeoutMs}ms`, {
          retryable: true,
        });
      } else if (error instanceof OpenRouterError) {
        lastError = error;
        if (!error.retryable) {
          throw error;
        }
      } else {
        lastError = new OpenRouterError(err.message, { retryable: true });
      }

      if (attempt > maxRetries) {
        break;
      }

      logWarn("openrouter.chat.retry", {
        component: "ai",
        event: "openrouter.chat.retry",
        attempt,
        error: lastError.message,
      });
      await sleep(Math.pow(2, attempt - 1) * 200);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new OpenRouterError("OpenRouter request failed");
}
