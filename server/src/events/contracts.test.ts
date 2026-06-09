import { describe, expect, it } from "vitest";
import {
  eventEnvelopeSchema,
  queueRetryPolicies,
  queueNames,
} from "./contracts.js";
import { resolveQueueForEvent } from "./dispatcher.js";

describe("event and queue contracts", () => {
  it("validates event envelope shape", () => {
    const parsed = eventEnvelopeSchema.parse({
      eventName: "checkout.completed",
      source: "unit-test",
      idempotencyKey: "idem-key-1234",
      payload: { orderId: "o-1" },
    });

    expect(parsed.eventName).toBe("checkout.completed");
  });

  it("routes event names to expected queues", () => {
    expect(resolveQueueForEvent("checkout.completed")).toBe("q_critical");
    expect(resolveQueueForEvent("campaign.sent")).toBe("q_notifications");
    expect(resolveQueueForEvent("ai.embedding.completed")).toBe("q_ai_processing");
    expect(resolveQueueForEvent("report.daily.rollup")).toBe("q_reporting");
  });

  it("has retry policy for every queue", () => {
    for (const queueName of queueNames) {
      expect(queueRetryPolicies[queueName]).toBeDefined();
      expect(queueRetryPolicies[queueName].maxAttempts).toBeGreaterThan(0);
    }
  });
});
