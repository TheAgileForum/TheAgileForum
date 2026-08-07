import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getEnv, resetEnvCache } from "./env.js";

describe("AI env schema", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://local:test@localhost:5432/test";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    resetEnvCache();
  });

  afterEach(() => {
    delete process.env.AI_PROVIDER_MODE;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    resetEnvCache();
  });

  it("defaults AI_PROVIDER_MODE to stub and Gemma free model", () => {
    delete process.env.AI_PROVIDER_MODE;
    delete process.env.OPENROUTER_MODEL;
    resetEnvCache();
    const env = getEnv();
    expect(env.AI_PROVIDER_MODE).toBe("stub");
    expect(env.OPENROUTER_MODEL).toBe("google/gemma-4-26b-a4b-it:free");
  });

  it("accepts AI_PROVIDER_MODE=live", () => {
    process.env.AI_PROVIDER_MODE = "live";
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    resetEnvCache();
    const env = getEnv();
    expect(env.AI_PROVIDER_MODE).toBe("live");
    expect(env.OPENROUTER_API_KEY).toBe("sk-or-test");
  });
});
