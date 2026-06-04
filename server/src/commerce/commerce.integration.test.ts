import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetRateLimitBuckets } from "../middleware/rate-limit.js";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db/client.js";

const hasDb = Boolean(process.env.DATABASE_URL);
const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe.skipIf(!hasDb)("commerce integration (Sprint 1)", () => {
  const app = createApp();

  beforeAll(() => {
    execSync("npx tsx prisma/seed.ts", {
      cwd: serverRoot,
      stdio: "inherit",
      env: process.env,
    });
  });

  beforeEach(() => {
    resetRateLimitBuckets();
  });

  const loginCustomer = async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);
    return agent;
  };

  it("requires authentication for checkout start (FR-151)", async () => {
    const res = await request(app)
      .post("/api/v1/commerce/checkout/start")
      .send({ variant: "standard" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("blocks add-to-cart without scheduleRef for schedule-bound offering", async () => {
    const agent = await loginCustomer();
    const res = await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "course-agile-fundamentals",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("SCHEDULE_REQUIRED");
  });

  it("returns 402 for paid mock exam access without entitlement (FR-85–87)", async () => {
    const agent = await loginCustomer();
    const res = await agent.post("/api/v1/commerce/exam/access").send({
      offeringCode: "exam-mock-certification",
    });
    expect(res.status).toBe(402);
    expect(res.body.error.code).toBe("EXAM_PAYMENT_REQUIRED");
  });

  it("grants free skill assessment exam access (FR-85)", async () => {
    const agent = await loginCustomer();
    const res = await agent.post("/api/v1/commerce/exam/access").send({
      offeringCode: "exam-practice-free",
    });
    expect(res.status).toBe(200);
    expect(res.body.access.granted).toBe(true);
    expect(res.body.access.examAccess).toBe("free");
  });

  it("completes checkout and publishes enrollment events", async () => {
    const agent = await loginCustomer();
    const email = `s1-checkout-${Date.now()}@demo.local`;
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        policyVersion: "v1",
        acceptTerms: true,
      });

    const regAgent = request.agent(app);
    await regAgent
      .post("/api/v1/auth/login")
      .send({ email, password: "password123" })
      .expect(200);

    await regAgent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });

    const start = await regAgent
      .post("/api/v1/commerce/checkout/start")
      .send({ variant: "standard" });
    expect(start.status).toBe(201);
    expect(start.body.orderNumber).toMatch(/^ORD-/);

    const complete = await regAgent.post("/api/v1/commerce/checkout/complete").send({
      orderId: start.body.orderId,
    });
    expect(complete.status).toBe(200);
    expect(complete.body.order.status).toBe("paid");

    const events = await prisma.eventLog.findMany({
      where: {
        eventName: {
          in: [
            "enrollment.order_confirmed",
            "notification.enrollment_welcome",
            "notification.enrollment_delivered",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    expect(events.some((e) => e.eventName === "enrollment.order_confirmed")).toBe(true);
    expect(events.some((e) => e.eventName === "notification.enrollment_welcome")).toBe(true);
    expect(events.some((e) => e.eventName === "notification.enrollment_delivered")).toBe(true);
  });

  it("marks order paid when Stripe checkout.session.completed webhook fires", async () => {
    const agent = await loginCustomer();
    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });

    const start = await agent
      .post("/api/v1/commerce/checkout/start")
      .send({ variant: "standard" });
    expect(start.status).toBe(201);
    const orderId = start.body.orderId as string;

    const webhookPayload = {
      id: "evt_stripe_checkout_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_session_1",
          client_reference_id: orderId,
          metadata: { order_id: orderId },
        },
      },
    };

    const webhook = await request(app)
      .post("/api/v1/integrations/stripe/webhook")
      .set("content-type", "application/json")
      .set("stripe-signature", "stub-valid-signature")
      .send(webhookPayload);
    expect(webhook.status).toBe(202);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("paid");
    expect(order?.paymentRef).toContain("stripe:cs_test_session_1");
  });

  it("completes org reimbursement checkout for SAFe offering", async () => {
    const agent = await loginCustomer();

    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "safe-leading-safe",
      scheduleRef: "cohort-2026-06",
    });

    const start = await agent.post("/api/v1/commerce/checkout/start").send({
      variant: "org_reimbursement",
      orgReimbursement: {
        organizationName: "Acme Corp",
        purchaseOrderNumber: "PO-9001",
        billingContactEmail: "billing@acme.example",
      },
    });
    expect(start.status).toBe(201);
    expect(start.body.variant).toBe("org_reimbursement");

    const complete = await agent.post("/api/v1/commerce/checkout/complete").send({
      orderId: start.body.orderId,
      paymentRef: "org-po-PO-9001",
    });
    expect(complete.status).toBe(200);
    expect(complete.body.order.status).toBe("paid");
    expect(complete.body.order.paymentRef).toBe("org-po-PO-9001");
  });
});
