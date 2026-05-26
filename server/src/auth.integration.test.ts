import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

const hasDb = Boolean(process.env.DATABASE_URL);
const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

describe.skipIf(!hasDb)("auth integration", () => {
  const app = createApp();

  beforeAll(() => {
    execSync("npx tsx prisma/seed.ts", {
      cwd: serverRoot,
      stdio: "inherit",
      env: process.env,
    });
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
});
