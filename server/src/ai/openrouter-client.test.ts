import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetEnvCache } from "../config/env.js";
import { OpenRouterError, openRouterChatCompletion } from "./openrouter-client.js";

describe("openRouterChatCompletion", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://local:test@localhost:5432/test";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_MODEL = "google/gemma-4-26b-a4b-it:free";
    resetEnvCache();
  });

  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.AI_PROVIDER_MODE;
    resetEnvCache();
    vi.restoreAllMocks();
  });

  it("returns content and usage on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free",
          choices: [{ message: { content: '{"ok":true}' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
    });

    const result = await openRouterChatCompletion({
      messages: [{ role: "user", content: "hi" }],
      fetchImpl: fetchImpl as unknown as typeof fetch,
      maxRetries: 0,
    });

    expect(result.content).toBe('{"ok":true}');
    expect(result.usage.totalTokens).toBe(15);
    expect(result.attempts).toBe(1);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("retries then fails on persistent 500", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: { message: "upstream" } }),
    });

    await expect(
      openRouterChatCompletion({
        messages: [{ role: "user", content: "hi" }],
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxRetries: 1,
        timeoutMs: 2000,
      }),
    ).rejects.toBeInstanceOf(OpenRouterError);

    expect(fetchImpl.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("does not retry non-retryable 400", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: { message: "bad request" } }),
    });

    await expect(
      openRouterChatCompletion({
        messages: [{ role: "user", content: "hi" }],
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxRetries: 2,
      }),
    ).rejects.toMatchObject({
      message: expect.stringContaining("bad request"),
      retryable: false,
    });

    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("includes model and status in 404 unavailable-free errors", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () =>
        JSON.stringify({
          error: {
            message:
              "This model is unavailable for free. The paid version is available now.",
          },
        }),
    });

    await expect(
      openRouterChatCompletion({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [{ role: "user", content: "hi" }],
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxRetries: 0,
      }),
    ).rejects.toMatchObject({
      status: 404,
      retryable: false,
      message: expect.stringMatching(
        /model=meta-llama\/llama-3\.3-70b-instruct:free.*HTTP 404.*unavailable for free/i,
      ),
    });
  });
});
