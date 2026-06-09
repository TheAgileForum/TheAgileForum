import { describe, expect, it } from "vitest";
import {
  mapOfferingToMeta,
  listOfferingsFromCatalog,
  getOfferingFromCatalog,
} from "./catalog-repository.js";
import { listStubOfferings } from "./catalog-seed-data.js";

describe("catalog repository (FR-182 SSOT)", () => {
  it("maps DB row to OfferingMeta with primary schedule ref", () => {
    const meta = mapOfferingToMeta({
      id: "off-1",
      code: "course-agile-fundamentals",
      title: "Agile Fundamentals (Cohort)",
      kind: "course",
      category: "training",
      scheduleBound: true,
      examAccess: "preview_only",
      safeOrgPaymentEligible: false,
      defaultUnitPrice: { toFixed: () => "299.00" } as never,
      currency: "USD",
      roleTags: ["learner", "scrum_master"],
      certBody: null,
      deliveryMode: "live",
      enabled: true,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      schedules: [
        {
          id: "sch-1",
          offeringId: "off-1",
          refCode: "cohort-2026-q3",
          label: null,
          startsAt: null,
          enabled: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    expect(meta.upcomingBatchId).toBe("cohort-2026-q3");
    expect(meta.defaultUnitPrice).toBe("299.00");
    expect(meta.roleTags).toEqual(["learner", "scrum_master"]);
  });

  it("falls back to stub catalog when DB is unavailable", async () => {
    const offerings = await listOfferingsFromCatalog();
    expect(offerings.length).toBe(listStubOfferings().length);
    expect(offerings.some((o) => o.code === "exam-practice-free")).toBe(true);
  });

  it("resolves stub offering by code when DB row missing", async () => {
    const offering = await getOfferingFromCatalog("safe-leading-safe");
    expect(offering?.safeOrgPaymentEligible).toBe(true);
  });
});
