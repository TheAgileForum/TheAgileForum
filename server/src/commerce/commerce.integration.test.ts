import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db/client.js";

const hasDb = Boolean(process.env.DATABASE_URL);
const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe.skipIf(!hasDb)("commerce integration (Sprint 1)", () => {
  const app = createApp();

  beforeAll(() => {
    execSync("npx prisma migrate deploy", {
      cwd: serverRoot,
      stdio: "inherit",
      env: process.env,
    });
    execSync("npx tsx prisma/seed.ts", {
      cwd: serverRoot,
      stdio: "inherit",
      env: process.env,
    });
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
        eventName: { in: ["enrollment.order_confirmed", "notification.enrollment_welcome"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    expect(events.some((e) => e.eventName === "enrollment.order_confirmed")).toBe(true);
    expect(events.some((e) => e.eventName === "notification.enrollment_welcome")).toBe(true);
  });
});
