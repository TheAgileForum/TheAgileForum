import { describe, expect, it } from "vitest";
import { executeWithRetry } from "./external-call.js";

describe("external call wrapper", () => {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/mybmadproj";
  process.env.JWT_SECRET =
    process.env.JWT_SECRET ?? "test-jwt-secret-must-be-32-chars-min!!";

  it("retries and succeeds before max retries", async () => {
    let attempts = 0;
    const result = await executeWithRetry(
      async () => {
        attempts += 1;
        if (attempts < 2) {
          throw new Error("temporary failure");
        }
        return "ok";
      },
      { timeoutMs: 500, maxRetries: 2 },
    );

    expect(result.ok).toBe(true);
    expect(result.data).toBe("ok");
    expect(result.attempts).toBe(2);
  });

  it("returns failure after retry exhaustion", async () => {
    const result = await executeWithRetry(
      async () => {
        throw new Error("permanent failure");
      },
      { timeoutMs: 200, maxRetries: 1 },
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("permanent failure");
    expect(result.attempts).toBe(2);
  });

  it("times out long-running calls", async () => {
    const result = await executeWithRetry(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return "late";
      },
      { timeoutMs: 50, maxRetries: 0 },
    );
    expect(result.ok).toBe(false);
    expect(result.error).toContain("timeout");
  });
});
