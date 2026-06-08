import { createHmac } from "node:crypto";
import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockCompleteOrderFromRazorpayWebhook = vi.fn();
const mockPublishEvent = vi.fn();

vi.mock("../services/checkout-service.js", () => ({
  completeOrderFromRazorpayWebhook: (...args: unknown[]) =>
    mockCompleteOrderFromRazorpayWebhook(...args),
}));

vi.mock("../events/publisher.js", () => ({
  publishEvent: (...args: unknown[]) => mockPublishEvent(...args),
}));

import { razorpayWebhookRouter } from "./razorpay-webhook.routes.js";

function app() {
  const a = express();
  a.use(
    "/api/v1/integrations/razorpay",
    express.raw({ type: "application/json" }),
  );
  a.use("/api/v1/integrations/razorpay", razorpayWebhookRouter);
  return a;
}

describe("razorpay webhook route (FR-170)", () => {
  const originalSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  beforeEach(() => {
    mockCompleteOrderFromRazorpayWebhook.mockReset();
    mockPublishEvent.mockReset();
    mockCompleteOrderFromRazorpayWebhook.mockResolvedValue({
      ok: true,
      order: {
        id: "order-internal-1",
        orderNumber: "ORD-TEST",
        status: "paid",
        paymentRef: "razorpay:order_1:pay_1",
        alreadyCompleted: false,
      },
    });
    mockPublishEvent.mockResolvedValue({ eventId: "evt-1", jobId: "job-1", queue: "q_reporting" });
  });

  afterEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = originalSecret;
    vi.restoreAllMocks();
  });

  it("rejects webhook when secret is missing", async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const res = await request(app())
      .post("/api/v1/integrations/razorpay/webhook")
      .set("content-type", "application/json")
      .send("{}");
    expect(res.status).toBe(503);
  });

  it("rejects invalid signature", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test";
    const res = await request(app())
      .post("/api/v1/integrations/razorpay/webhook")
      .set("content-type", "application/json")
      .set("x-razorpay-signature", "bad")
      .send('{"event":"payment.captured"}');
    expect(res.status).toBe(400);
  });

  it("accepts payment.captured with valid signature", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test";
    const body = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_1", order_id: "order_1", status: "captured" } },
        order: { entity: { id: "order_1", notes: { internal_order_id: "missing-order" } } },
      },
    });
    const signature = createHmac("sha256", "whsec_test").update(body).digest("hex");

    const res = await request(app())
      .post("/api/v1/integrations/razorpay/webhook")
      .set("content-type", "application/json")
      .set("x-razorpay-signature", signature)
      .send(body);
    expect(res.status).toBe(202);
    expect(res.body.accepted).toBe(true);
  });
});
