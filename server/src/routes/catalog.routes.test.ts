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

  it("lists published SAFe certification courses aligned to live site", async () => {
    const res = await request(app()).get("/api/v1/catalog/certifications");
    expect(res.status).toBe(200);
    expect(res.body.offerings.every((o: { category: string; kind: string }) =>
      o.category === "certification" && o.kind === "course",
    )).toBe(true);

    const codes = res.body.offerings.map((o: { code: string }) => o.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        "safe-leading-safe",
        "safe-product-owner-product-manager-certification-training",
        "safe-scrum-master-certification-training",
        "csm-certification-training",
        "safe-rte-certification-training",
        "psm-i-certification-training",
        "psm-ii-certification-training",
      ]),
    );
    expect(codes).not.toContain("exam-practice-free");
    expect(codes).not.toContain("exam-mock-certification");
    expect(res.body.offerings).toHaveLength(7);

    const leading = res.body.offerings.find(
      (o: { code: string }) => o.code === "safe-leading-safe",
    );
    expect(leading?.title).toContain("Leading SAFe");
    expect(leading?.defaultUnitPrice).toBe("549.00");
    expect(leading?.certificationName).toContain("SAFe Agilist");
    expect(leading?.durationHours).toBe(16);

    const csm = res.body.offerings.find(
      (o: { code: string }) => o.code === "csm-certification-training",
    );
    expect(csm?.certBody).toBe("scrum alliance");
    expect(csm?.certificationName).toContain("CSM");
    expect(csm?.durationHours).toBe(16);

    const rte = res.body.offerings.find(
      (o: { code: string }) => o.code === "safe-rte-certification-training",
    );
    expect(rte?.certBody).toBe("scaled agile");
    expect(rte?.certificationName).toContain("Release Train Engineer");
    expect(rte?.durationHours).toBe(24);

    const psmI = res.body.offerings.find(
      (o: { code: string }) => o.code === "psm-i-certification-training",
    );
    expect(psmI?.certBody).toBe("scrum.org");
    expect(psmI?.title).toContain("PSM-I");
    expect(psmI?.defaultUnitPrice).toBe("149.00");
    expect(psmI?.durationHours).toBe(8);
    expect(psmI?.slug).toBe(
      "professional-scrum-master-psm-i-training-crash-course",
    );

    const psmIi = res.body.offerings.find(
      (o: { code: string }) => o.code === "psm-ii-certification-training",
    );
    expect(psmIi?.certBody).toBe("scrum.org");
    expect(psmIi?.certificationName).toContain("PSM II");
    expect(psmIi?.durationHours).toBe(16);
  });

  it("resolves PSM I marketing slug alias to canonical offer", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/offerings/professional-scrum-master-psm-i-training-crash-course?geo=IN",
    );
    expect(res.status).toBe(200);
    expect(res.body.offering.code).toBe("psm-i-certification-training");
    expect(res.body.offering.durationHours).toBe(8);
    expect(res.body.priceQuote).toMatchObject({
      amount: "9999.00",
      currency: "INR",
    });
  });

  it("resolves live-site slug alias for Leading SAFe detail", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/offerings/safe-agilist-leading-safe-certification-training?geo=US",
    );
    expect(res.status).toBe(200);
    expect(res.body.offering.code).toBe("safe-leading-safe");
    expect(res.body.offering.slug).toBe(
      "safe-agilist-leading-safe-certification-training",
    );
  });

  it.each([
    "service-power-resume-cover-letter",
    "power-resume-cover-letter",
    "new-resume-with-cover-letter-linkedin-upgrade",
  ])("resolves resume service code or alias %s to the canonical offer", async (code) => {
    const res = await request(app()).get(
      `/api/v1/catalog/offerings/${code}?geo=US`,
    );
    expect(res.status).toBe(200);
    expect(res.body.offering).toMatchObject({
      code: "service-power-resume-cover-letter",
      slug: "new-resume-with-cover-letter-linkedin-upgrade",
      title: "New Resume With Cover Letter & Linkedin Upgrade",
    });
    expect(res.body.offering.includes).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/LinkedIn profile upgrade/i),
        expect.stringMatching(
          /ATS Friendly Resume, with tried and tested formats which get you hired/i,
        ),
      ]),
    );
  });

  it("quotes resume service at INR 6999 for India geo", async () => {
    const res = await request(app()).get(
      "/api/v1/catalog/offerings/service-power-resume-cover-letter?geo=IN",
    );
    expect(res.status).toBe(200);
    expect(res.body.priceQuote).toMatchObject({
      amount: "6999.00",
      currency: "INR",
    });
  });

  it.each([
    "course-agile-fundamentals",
    "scrum-master-mentorship-masterclass",
    "live-project-mentorship-masterclass-for-scrum-master-product-owner",
  ])("resolves mentorship code or alias %s to the canonical offer", async (code) => {
    const res = await request(app()).get(
      `/api/v1/catalog/offerings/${code}?geo=IN`,
    );

    expect(res.status).toBe(200);
    expect(res.body.offering).toMatchObject({
      code: "course-agile-fundamentals",
      category: "training",
      scheduleBound: true,
      slug: "live-project-mentorship-masterclass-for-scrum-master-product-owner",
      durationLabel: "3 weeks",
    });
    expect(res.body.offering.title).toContain("Mentorship Masterclass");
    expect(res.body.offering.includes.length).toBeGreaterThan(5);
    expect(res.body.offering.cohortSchedules).toHaveLength(2);
    expect(res.body.priceQuote).toMatchObject({
      amount: "29990.00",
      currency: "INR",
    });
  });

  it("keeps free/paid exam SKUs available by code (FR-85/86/87)", async () => {
    const free = await request(app()).get(
      "/api/v1/catalog/offerings/exam-practice-free",
    );
    const paid = await request(app()).get(
      "/api/v1/catalog/offerings/exam-mock-certification",
    );
    expect(free.status).toBe(200);
    expect(paid.status).toBe(200);
    expect(free.body.offering.examAccess).toBe("free");
    expect(paid.body.offering.examAccess).toBe("paid");
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
    expect(
      res.body.offerings.every(
        (o: { priceQuote: { currency: string } }) =>
          o.priceQuote.currency === "INR",
      ),
    ).toBe(true);
    const psmI = res.body.offerings.find(
      (o: { code: string }) => o.code === "psm-i-certification-training",
    );
    expect(psmI?.priceQuote).toMatchObject({
      amount: "9999.00",
      currency: "INR",
    });
    const psmIi = res.body.offerings.find(
      (o: { code: string }) => o.code === "psm-ii-certification-training",
    );
    expect(psmIi?.priceQuote).toMatchObject({
      amount: "33999.00",
      currency: "INR",
    });
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
      "/api/v1/catalog/services?min_price=100&max_price=300",
    );
    expect(res.status).toBe(200);
    expect(res.body.offerings.length).toBeGreaterThan(0);
    expect(
      res.body.offerings.every((o: { defaultUnitPrice: string }) => {
        const price = Number.parseFloat(o.defaultUnitPrice);
        return price >= 100 && price <= 300;
      }),
    ).toBe(true);
  });
});
