import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { resetEnvCache } from "../config/env.js";
import { createRateLimitMiddleware, resetRateLimitBuckets } from "./rate-limit.js";
import { createApp } from "../app.js";

describe("security middleware baseline", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mybmadproj";
    process.env.JWT_SECRET = "test-jwt-secret-must-be-32-chars-min!!";
    process.env.CORS_ALLOWED_ORIGINS = "http://allowed.local";
    process.env.RATE_LIMIT_WINDOW_MS = "60000";
    process.env.RATE_LIMIT_MAX_REQUESTS = "2";
    resetEnvCache();
    resetRateLimitBuckets();
  });

  it("adds baseline security headers", async () => {
    const res = await request(createApp()).get("/api/v1/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
  });

  it("blocks disallowed CORS origin", async () => {
    const res = await request(createApp())
      .get("/api/v1/health")
      .set("Origin", "http://blocked.local");
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("CORS_ORIGIN_BLOCKED");
  });

  it("accepts allowed CORS preflight requests", async () => {
    const res = await request(createApp())
      .options("/api/v1/health")
      .set("Origin", "http://allowed.local")
      .set("Access-Control-Request-Method", "GET");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("http://allowed.local");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.headers["vary"]).toContain("Origin");
  });

  it("rate limits after configured request count", async () => {
    const app = express();
    app.use(express.json());
    app.post("/limited", createRateLimitMiddleware("limited-route"), (_req, res) => {
      res.status(200).json({ ok: true });
    });

    const first = await request(app).post("/limited").send({});
    const second = await request(app).post("/limited").send({});
    const third = await request(app).post("/limited").send({});

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
    expect(third.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(Number(third.headers["retry-after"])).toBeGreaterThan(0);
  });
});
