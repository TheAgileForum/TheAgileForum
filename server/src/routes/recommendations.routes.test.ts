import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { recommendationsRouter } from "./recommendations.routes.js";

function app() {
  const a = express();
  a.use("/api/v1/recommendations", recommendationsRouter);
  return a;
}

describe("recommendations routes (FR-181)", () => {
  it("GET /upsell returns role-based SKUs for diagnosis context", async () => {
    const res = await request(app()).get(
      "/api/v1/recommendations/upsell?target_role=scrum_master&context=diagnosis&geo=US",
    );
    expect(res.status).toBe(200);
    expect(res.body.safeCertSkus.length).toBeGreaterThan(0);
    expect(res.body.mockInterviewSkus.length).toBeGreaterThan(0);
    expect(res.body.primaryCta).toBeDefined();
    expect(res.body.items[0].priceQuote.currency).toBe("USD");
    expect(res.body.currencyContext.currency).toBe("USD");
  });

  it("GET /upsell accepts gap_tags for diagnosis personalization", async () => {
    const res = await request(app()).get(
      "/api/v1/recommendations/upsell?target_role=scrum_master&context=diagnosis&gap_tags=interview,communication",
    );
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("rejects missing target_role", async () => {
    const res = await request(app()).get(
      "/api/v1/recommendations/upsell?context=diagnosis",
    );
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("TARGET_ROLE_REQUIRED");
  });

  it("rejects invalid context", async () => {
    const res = await request(app()).get(
      "/api/v1/recommendations/upsell?target_role=scrum_master&context=invalid",
    );
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_CONTEXT");
  });
});
