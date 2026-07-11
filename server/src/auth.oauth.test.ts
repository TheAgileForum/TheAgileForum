import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("OAuth routes (contract)", () => {
  const app = createApp();

  it("redirects google start to callback in stub mode", async () => {
    const res = await request(app)
      .get("/api/v1/auth/oauth/google/start")
      .redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/api\/v1\/auth\/oauth\/google\/callback\?/);
    expect(res.headers.location).toContain("code=dev-stub");
  });

  it("redirects linkedin start to callback in stub mode", async () => {
    const res = await request(app)
      .get("/api/v1/auth/oauth/linkedin/start")
      .redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/api\/v1\/auth\/oauth\/linkedin\/callback\?/);
    expect(res.headers.location).toContain("code=dev-stub");
  });
});
