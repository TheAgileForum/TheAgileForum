import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { collectForbiddenDiscountFields } from "../catalog/catalog-response-policy.js";
import { catalogRouter } from "./catalog.routes.js";

function app() {
  const a = express();
  a.use("/api/v1/catalog", catalogRouter);
  return a;
}

describe("catalog routes (FR-161, FR-162, FR-163)", () => {
  it("lists all offerings", async () => {
    const res = await request(app()).get("/api/v1/catalog/offerings");
    expect(res.status).toBe(200);
    expect(res.body.offerings.length).toBeGreaterThan(0);
  });

  it("lists trainings category only", async () => {
    const res = await request(app()).get("/api/v1/catalog/trainings");
    expect(res.status).toBe(200);
    expect(res.body.category).toBe("training");
    expect(res.body.offerings.every((o: { category: string }) => o.category === "training")).toBe(true);
    expect(res.body.facets).toMatchObject({ roles: expect.any(Array), priceRange: expect.any(Object) });
  });

  it("lists certifications category only", async () => {
    const res = await request(app()).get("/api/v1/catalog/certifications");
    expect(res.body.offerings.every((o: { category: string }) => o.category === "certification")).toBe(true);
  });

  it("lists services category only", async () => {
    const res = await request(app()).get("/api/v1/catalog/services");
    expect(res.body.offerings.every((o: { category: string }) => o.category === "service")).toBe(true);
  });

  it("applies query filters on offerings", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/offerings?category=certification&cert_body=scrum.org",
    );
    expect(res.status).toBe(200);
    expect(res.body.offerings.length).toBeGreaterThan(0);
    expect(
      res.body.offerings.every(
        (o: { category: string; certBody?: string }) =>
          o.category === "certification" && o.certBody === "scrum.org",
      ),
    ).toBe(true);
  });

  it("exposes exam access labels on certification listings (FR-85/86/87)", async () => {
    const res = await request(app()).get("/api/v1/catalog/certifications");
    expect(res.status).toBe(200);

    const exams = res.body.offerings.filter(
      (o: { kind: string }) => o.kind === "exam" || o.kind === "certification_mock",
    );
    expect(exams.length).toBeGreaterThanOrEqual(2);

    const freeExam = exams.find(
      (o: { code: string }) => o.code === "exam-practice-free",
    );
    const paidExam = exams.find(
      (o: { code: string }) => o.code === "exam-mock-certification",
    );
    expect(freeExam?.examAccess).toBe("free");
    expect(paidExam?.examAccess).toBe("paid");
  });

  it("applies combined role, delivery mode, and batch filters (FR-163)", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/trainings?role=scrum_master&delivery_mode=live&upcoming_batch=true",
    );
    expect(res.status).toBe(200);
    expect(res.body.offerings.length).toBeGreaterThan(0);
    expect(
      res.body.offerings.every(
        (o: {
          category: string;
          roleTags: string[];
          deliveryMode: string;
          upcomingBatchId?: string;
        }) =>
          o.category === "training" &&
          o.roleTags.includes("scrum_master") &&
          o.deliveryMode === "live" &&
          Boolean(o.upcomingBatchId),
      ),
    ).toBe(true);
  });

  it(
    "does not expose discount marketing fields on listings (FR-179)",
    async () => {
      const res = await request(app()).get("/api/v1/catalog/offerings");
      expect(res.status).toBe(200);
      expect(collectForbiddenDiscountFields(res.body)).toEqual([]);
    },
    15_000,
  );

  it("includes resolved priceQuote in session currency (FR-178)", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/certifications?geo=IN",
    );
    expect(res.status).toBe(200);
    expect(res.body.currencyContext.currency).toBe("INR");
    expect(res.body.offerings.length).toBeGreaterThan(0);
    expect(res.body.offerings[0].priceQuote.currency).toBe("INR");
    expect(res.body.offerings.every(
      (o: { priceQuote: { currency: string } }) =>
        o.priceQuote.currency === "INR",
    )).toBe(true);
  });

  it("GET /offerings/:code returns detail priceQuote (api-contract)", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/offerings/exam-mock-certification?geo=US",
    );
    expect(res.status).toBe(200);
    expect(res.body.priceQuote.currency).toBe("USD");
    expect(res.body.offering.code).toBe("exam-mock-certification");
    expect(res.body.scheduleRequired).toBe(false);
  });

  it("returns resolved priceQuote in session currency for India geo (FR-178)", async () => {
    const res = await request(app()).get("/api/v1/catalog/trainings?geo=IN");
    expect(res.status).toBe(200);
    expect(res.body.currencyContext.currency).toBe("INR");
    expect(res.body.offerings.length).toBeGreaterThan(0);
    expect(res.body.offerings[0].priceQuote.currency).toBe("INR");
    expect(res.body.offerings.every(
      (o: { priceQuote: { currency: string } }) => o.priceQuote.currency === "INR",
    )).toBe(true);
  });

  it("GET /offerings/:code returns detail with priceQuote (FR-178)", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/offerings/safe-leading-safe?geo=US&currency_override=USD",
    );
    expect(res.status).toBe(200);
    expect(res.body.offering.code).toBe("safe-leading-safe");
    expect(res.body.priceQuote.currency).toBe("USD");
    expect(res.body.scheduleRequired).toBe(true);
  });

  it("applies price range filter on services category (FR-163)", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/services?min_price=50&max_price=100",
    );
    expect(res.status).toBe(200);
    expect(res.body.offerings.length).toBeGreaterThan(0);
    expect(
      res.body.offerings.every((o: { defaultUnitPrice: string }) => {
        const price = Number.parseFloat(o.defaultUnitPrice);
        return price >= 50 && price <= 100;
      }),
    ).toBe(true);
  });
});
