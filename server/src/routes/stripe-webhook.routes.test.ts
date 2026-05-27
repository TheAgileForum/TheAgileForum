import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { resetEnvCache } from "../config/env.js";
import { createApp } from "../app.js";

const {
  mockVerifyWebhookSignature,
  mockParseWebhookEvent,
  mockPublishEvent,
} = vi.hoisted(() => ({
  mockVerifyWebhookSignature: vi.fn(),
  mockParseWebhookEvent: vi.fn(),
  mockPublishEvent: vi.fn(),
}));

vi.mock("../integrations/factory.js", () => ({
  createIntegrationAdapters: () => ({
    stripe: {
      verifyWebhookSignature: mockVerifyWebhookSignature,
      parseWebhookEvent: mockParseWebhookEvent,
    },
    email: {},
    telegram: {},
    webinar: {},
  }),
}));

vi.mock("../events/publisher.js", () => ({
  publishEvent: mockPublishEvent,
}));

describe("stripe webhook route", () => {
  beforeEach(() => {
    mockVerifyWebhookSignature.mockReset();
    mockParseWebhookEvent.mockReset();
    mockPublishEvent.mockReset();
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://local:test@localhost:5432/test";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    resetEnvCache();
  });

  it("rejects webhook when signature is invalid", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(false);
    const app = createApp();
    const payload = Buffer.from(JSON.stringify({ id: "evt_1", type: "x" }));

    const res = await request(app)
      .post("/api/v1/integrations/stripe/webhook")
      .set("content-type", "application/json")
      .set("stripe-signature", "invalid-signature")
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_WEBHOOK_SIGNATURE");
    expect(mockPublishEvent).not.toHaveBeenCalled();
  });

  it("accepts valid webhook and publishes canonical event", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);
    mockParseWebhookEvent.mockResolvedValue({
      id: "evt_checkout_1",
      type: "checkout.session.completed",
      rawPayload: '{"id":"evt_checkout_1"}',
    });
    mockPublishEvent.mockResolvedValue({
      eventId: "event_1",
      jobId: "job_1",
      queue: "q_critical",
      eventName: "stripe.checkout.session.completed",
      idempotencyKey: "stripe:evt_checkout_1",
    });

    const app = createApp();
    const payload = Buffer.from(JSON.stringify({ id: "evt_checkout_1" }));

    const res = await request(app)
      .post("/api/v1/integrations/stripe/webhook")
      .set("content-type", "application/json")
      .set("stripe-signature", "stub-valid-signature")
      .send(payload);

    expect(res.status).toBe(202);
    expect(res.body.accepted).toBe(true);
    expect(res.body.eventId).toBe("evt_checkout_1");
    expect(res.body.queue).toBe("q_critical");
    expect(mockPublishEvent).toHaveBeenCalledWith({
      eventName: "stripe.checkout.session.completed",
      source: "stripe-webhook",
      idempotencyKey: "stripe:evt_checkout_1",
      payload: {
        eventId: "evt_checkout_1",
        eventType: "checkout.session.completed",
        rawPayload: '{"id":"evt_checkout_1"}',
      },
    });
  });

  it("returns 500 when webhook parsing fails", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);
    mockParseWebhookEvent.mockRejectedValue(new Error("malformed payload"));

    const app = createApp();
    const payload = Buffer.from(JSON.stringify({ id: "evt_bad" }));

    const res = await request(app)
      .post("/api/v1/integrations/stripe/webhook")
      .set("content-type", "application/json")
      .set("stripe-signature", "stub-valid-signature")
      .send(payload);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("WEBHOOK_PROCESSING_FAILED");
  });
});
