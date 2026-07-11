import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { resetEnvCache } from "./config/env.js";
import { createApp } from "./app.js";
import { resetRateLimitBuckets } from "./middleware/rate-limit.js";

describe("auth contract baseline (no DB dependency)", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://local:test@localhost:5432/test";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    process.env.RATE_LIMIT_WINDOW_MS = "60000";
    process.env.RATE_LIMIT_MAX_REQUESTS = "2";
    resetEnvCache();
    resetRateLimitBuckets();
  });

  it("returns 400 VALIDATION_ERROR for invalid register body", async () => {
    const res = await request(createApp()).post("/api/v1/auth/register").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("redirects OAuth start in stub/test mode", async () => {
    const res = await request(createApp())
      .get("/api/v1/auth/oauth/google/start")
      .redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/oauth\/google\/callback/);
  });

  it("redirects linkedin OAuth start in stub/test mode", async () => {
    const res = await request(createApp())
      .get("/api/v1/auth/oauth/linkedin/start")
      .redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/oauth\/linkedin\/callback/);
  });

  it("returns 501 when stub disabled and provider not configured", async () => {
    process.env.OAUTH_STUB_MODE = "false";
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    resetEnvCache();
    const res = await request(createApp()).get("/api/v1/auth/oauth/google/start");
    expect(res.status).toBe(501);
    expect(res.body.error.code).toBe("OAUTH_NOT_CONFIGURED");
  });

  it("returns 501 for linkedin when stub disabled and credentials missing", async () => {
    process.env.OAUTH_STUB_MODE = "false";
    delete process.env.LINKEDIN_CLIENT_ID;
    delete process.env.LINKEDIN_CLIENT_SECRET;
    resetEnvCache();
    const res = await request(createApp()).get("/api/v1/auth/oauth/linkedin/start");
    expect(res.status).toBe(501);
    expect(res.body.error.code).toBe("OAUTH_NOT_CONFIGURED");
  });

  it("returns 204 for logout and clears auth cookie", async () => {
    const res = await request(createApp()).post("/api/v1/auth/logout");
    expect(res.status).toBe(204);
    expect(String(res.headers["set-cookie"])).toMatch(/access_token=/);
  });

  it("returns 400 VALIDATION_ERROR for invalid login body", async () => {
    const res = await request(createApp())
      .post("/api/v1/auth/login")
      .send({ email: "bad-email", password: "" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 UNAUTHENTICATED for protected routes without session", async () => {
    const app = createApp();
    const me = await request(app).get("/api/v1/auth/me");
    expect(me.status).toBe(401);
    expect(me.body.error.code).toBe("UNAUTHENTICATED");

    const consent = await request(app).post("/api/v1/auth/consent").send({
      policyVersion: "v1",
      accepted: true,
    });
    expect(consent.status).toBe(401);
    expect(consent.body.error.code).toBe("UNAUTHENTICATED");

    const adminCheck = await request(app).get("/api/v1/auth/admin-check");
    expect(adminCheck.status).toBe(401);
    expect(adminCheck.body.error.code).toBe("UNAUTHENTICATED");

    const unsubscribe = await request(app).post("/api/v1/auth/unsubscribe").send({
      channel: "email",
    });
    expect(unsubscribe.status).toBe(401);
    expect(unsubscribe.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 401 UNAUTHENTICATED for malformed auth cookie", async () => {
    const res = await request(createApp())
      .get("/api/v1/auth/me")
      .set("Cookie", ["access_token=not-a-jwt"]);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 429 when login exceeds configured rate limit", async () => {
    const app = createApp();
    const first = await request(app).post("/api/v1/auth/login").send({
      email: "bad-email",
      password: "",
    });
    const second = await request(app).post("/api/v1/auth/login").send({
      email: "bad-email",
      password: "",
    });
    const third = await request(app).post("/api/v1/auth/login").send({
      email: "bad-email",
      password: "",
    });

    expect(first.status).toBe(400);
    expect(second.status).toBe(400);
    expect(third.status).toBe(429);
    expect(third.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(Number(third.headers["retry-after"])).toBeGreaterThan(0);
  });

  it("returns 401 for invalid cookie on protected POST consent route", async () => {
    const res = await request(createApp())
      .post("/api/v1/auth/consent")
      .set("Cookie", ["access_token=invalid.jwt.token"])
      .send({ policyVersion: "v1", accepted: true });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });
});
