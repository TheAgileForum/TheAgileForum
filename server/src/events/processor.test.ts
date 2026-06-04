import { describe, expect, it } from "vitest";
import { calculateBackoffDelayMs, transitionOnJobFailure } from "./processor.js";

describe("DLQ transition rules", () => {
  it("calculates exponential backoff delays by attempt", () => {
    expect(calculateBackoffDelayMs("q_critical", 1)).toBe(5000);
    expect(calculateBackoffDelayMs("q_critical", 2)).toBe(10000);
    expect(calculateBackoffDelayMs("q_critical", 3)).toBe(20000);
  });

  it("requeues with backoff when attempts are below max", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const result = transitionOnJobFailure({
      queue: "q_notifications",
      currentAttempts: 1,
      now,
      error: "smtp timeout",
    });

    expect(result.status).toBe("queued");
    expect(result.attempts).toBe(2);
    expect(result.nextRunAt).not.toBeNull();
    expect(result.error).toBe("smtp timeout");
  });

  it("moves to dead_letter at max attempts boundary", () => {
    const result = transitionOnJobFailure({
      queue: "q_reporting",
      currentAttempts: 2, // maxAttempts=3 -> next failure should DLQ
      error: "report job failed repeatedly",
    });

    expect(result.status).toBe("dead_letter");
    expect(result.attempts).toBe(3);
    expect(result.nextRunAt).toBeNull();
  });
});
