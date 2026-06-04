import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { resetEnvCache } from "./config/env.js";
import { resetRateLimitBuckets } from "./middleware/rate-limit.js";

function withStrictAuthRateLimit<T>(run: () => Promise<T>): Promise<T> {
  const previous = process.env.RATE_LIMIT_MAX_REQUESTS;
  process.env.RATE_LIMIT_MAX_REQUESTS = "2";
  resetEnvCache();
  resetRateLimitBuckets();
  return run().finally(() => {
    process.env.RATE_LIMIT_MAX_REQUESTS = previous ?? "30";
    resetEnvCache();
    resetRateLimitBuckets();
  });
}

const hasDb = Boolean(process.env.DATABASE_URL);
const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

describe.skipIf(!hasDb)("auth integration", () => {
  const app = createApp();

  const loginCustomer = async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);
    return agent;
  };

  beforeAll(() => {
    execSync("npx tsx prisma/seed.ts", {
      cwd: serverRoot,
      stdio: "inherit",
      env: process.env,
    });
  });

  it("registers a new user and sets session cookie", async () => {
    const email = `register-${Date.now()}@demo.local`;
    const res = await request(app).post("/api/v1/auth/register").send({
      email,
      password: "password123",
      policyVersion: "v1",
      acceptTerms: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("CUSTOMER");
    expect(res.body.user.emailVerified).toBe(false);
    expect(res.body.emailVerificationSent).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("returns 409 when registering duplicate email", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "customer@demo.local",
      password: "password123",
      policyVersion: "v1",
      acceptTerms: true,
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("logs in with valid credentials and sets cookie", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("CUSTOMER");
    expect(res.body.user.tenantIds).toContain(
      "00000000-0000-4000-8000-000000000001",
    );
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(String(setCookie)).toMatch(/access_token=/);
  });

  it("returns 401 INVALID_CREDENTIALS for bad password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 400 for invalid body", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "x" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /me 401 without cookie", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /me 200 with session cookie via agent", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);
    const res = await agent.get("/api/v1/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("customer@demo.local");
    expect(res.body.user.emailVerified).toBe(true);
  });

  it("context-check ignores spoof tenantId in query and body", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);

    const realTenant = "00000000-0000-4000-8000-000000000001";
    const spoof = "00000000-0000-0000-0000-000000009999";

    const getRes = await agent
      .get("/api/v1/auth/context-check")
      .query({ tenantId: spoof });
    expect(getRes.status).toBe(200);
    expect(getRes.body.tenantId).toBe(realTenant);
    expect(getRes.body.tenantIds).toEqual([realTenant]);
    expect(getRes.body.ignoredClientHints.queryTenantId).toBe(spoof);

    const postRes = await agent
      .post("/api/v1/auth/context-check")
      .send({ tenantId: spoof });
    expect(postRes.status).toBe(200);
    expect(postRes.body.tenantId).toBe(realTenant);
    expect(postRes.body.ignoredClientHints.bodyTenantId).toBe(spoof);
  });

  it("OPS_ADMIN receives tenantIds spanning all tenants", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "ops@demo.local", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("OPS_ADMIN");
    expect(res.body.user.tenantIds).toContain(
      "00000000-0000-4000-8000-000000000001",
    );
  });

  it("stores consent event for authenticated user", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);

    const res = await agent.post("/api/v1/auth/consent").send({
      policyVersion: "v1",
      accepted: true,
      source: "integration-test",
    });

    expect(res.status).toBe(201);
    expect(res.body.consent.policyVersion).toBe("v1");
    expect(res.body.consent.accepted).toBe(true);
    expect(res.body.consent.source).toBe("integration-test");
  });

  it("applies default consent source and updates existing consent via upsert", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);

    const first = await agent.post("/api/v1/auth/consent").send({
      policyVersion: "policy-upsert",
      accepted: true,
    });
    expect(first.status).toBe(201);
    expect(first.body.consent.source).toBe("web");
    expect(first.body.consent.accepted).toBe(true);

    const second = await agent.post("/api/v1/auth/consent").send({
      policyVersion: "policy-upsert",
      accepted: false,
      source: "web",
    });
    expect(second.status).toBe(201);
    expect(second.body.consent.id).toBe(first.body.consent.id);
    expect(second.body.consent.accepted).toBe(false);
  });

  it("returns 400 for invalid consent body for authenticated users", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);

    const res = await agent.post("/api/v1/auth/consent").send({
      policyVersion: "",
      accepted: "yes",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates unsubscribe consent event for authenticated user", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);

    const res = await agent.post("/api/v1/auth/unsubscribe").send({
      channel: "email",
      reason: "No longer needed",
    });
    expect(res.status).toBe(202);
    expect(res.body.unsubscribe.accepted).toBe(true);
    expect(res.body.unsubscribe.channel).toBe("email");
    expect(res.body.unsubscribe.status).toBe("scheduled");
  });

  it("returns 400 for invalid unsubscribe channel", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);

    const res = await agent.post("/api/v1/auth/unsubscribe").send({
      channel: "sms",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when unsubscribe reason exceeds max length", async () => {
    resetRateLimitBuckets();
    const agent = await loginCustomer();
    const res = await agent.post("/api/v1/auth/unsubscribe").send({
      channel: "telegram",
      reason: "x".repeat(501),
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rate-limits repeated sensitive consent submissions", async () => {
    await withStrictAuthRateLimit(async () => {
    const agent = await loginCustomer();
    resetRateLimitBuckets();

    const first = await agent.post("/api/v1/auth/consent").send({
      policyVersion: "rate-limit-consent",
      accepted: true,
      source: "web",
    });
    const second = await agent.post("/api/v1/auth/consent").send({
      policyVersion: "rate-limit-consent",
      accepted: false,
      source: "web",
    });
    const third = await agent.post("/api/v1/auth/consent").send({
      policyVersion: "rate-limit-consent",
      accepted: true,
      source: "web",
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(third.status).toBe(429);
    expect(third.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(Number(third.headers["retry-after"])).toBeGreaterThan(0);
    });
  });

  it("rate-limits repeated unsubscribe submissions", async () => {
    await withStrictAuthRateLimit(async () => {
    const agent = await loginCustomer();
    resetRateLimitBuckets();

    const first = await agent.post("/api/v1/auth/unsubscribe").send({
      channel: "email",
    });
    const second = await agent.post("/api/v1/auth/unsubscribe").send({
      channel: "telegram",
    });
    const third = await agent.post("/api/v1/auth/unsubscribe").send({
      channel: "email",
    });

    expect(first.status).toBe(202);
    expect(second.status).toBe(202);
    expect(third.status).toBe(429);
    expect(third.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(Number(third.headers["retry-after"])).toBeGreaterThan(0);
    });
  });

  it("blocks CUSTOMER from admin-check route", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);

    const res = await agent.get("/api/v1/auth/admin-check");
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("allows OPS_ADMIN to access admin-check route", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "ops@demo.local", password: "password123" })
      .expect(200);

    const res = await agent.get("/api/v1/auth/admin-check");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("completes google OAuth stub callback and sets session cookie", async () => {
    const start = await request(app)
      .get("/api/v1/auth/oauth/google/start")
      .redirects(0);
    expect(start.status).toBe(302);
    const location = start.headers.location as string;
    const parsed = new URL(location, "http://localhost");
    const callback = await request(app).get(`${parsed.pathname}${parsed.search}`);
    expect(callback.status).toBe(302);
    const setCookie = callback.headers["set-cookie"];
    const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    expect(cookies.some((c) => c.startsWith("access_token="))).toBe(true);
  });

  it("verifies email via token link", async () => {
    const email = `verify-${Date.now()}@demo.local`;
    const register = await request(app).post("/api/v1/auth/register").send({
      email,
      password: "password123",
      policyVersion: "v1",
      acceptTerms: true,
    });
    expect(register.status).toBe(201);

    const { prisma } = await import("./db/client.js");
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.emailVerificationToken).toBeTruthy();

    const verify = await request(app).get(
      `/api/v1/auth/verify-email?token=${encodeURIComponent(user!.emailVerificationToken!)}`,
    );
    expect(verify.status).toBe(302);
    expect(String(verify.headers.location)).toContain("verified=1");

    const updated = await prisma.user.findUnique({ where: { email } });
    expect(updated?.emailVerifiedAt).toBeTruthy();
  });
});
