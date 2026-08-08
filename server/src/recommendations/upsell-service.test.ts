import { describe, expect, it } from "vitest";
import {
  SM_LEADING_SAFE_CODE,
  SM_SAFE_SCRUM_MASTER_CODE,
} from "./sm-pathway.js";
import { getUpsellRecommendations, POWER_RESUME_OFFER_CODE } from "./upsell-service.js";

describe("role-based upsell recommendations (FR-181)", () => {
  it("returns SAFe cert and mock interview SKUs for scrum master", () => {
    const result = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      geo: "US",
      currency: "USD",
    });
    expect(result.safeCertSkus.length).toBe(1);
    expect(result.safeCertSkus[0]?.code).toBe(SM_SAFE_SCRUM_MASTER_CODE);
    expect(result.safeCertSkus[0]?.scheduleRef).toBeTruthy();
    expect(result.safeCertSkus[0]?.action).toBe("book");
    expect(result.mockInterviewSkus.length).toBeGreaterThan(0);
    expect(result.mockInterviewSkus[0]?.code).toBe("service-mock-interview-sm");
    expect(result.mockInterviewSkus[0]?.action).toBe("book");
    expect(result.primaryCta?.offeringCode).toBeTruthy();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((i) => i.action === "book")).toBe(true);
    expect(result.items[0]?.priceQuote.currency).toBe("USD");
    expect(result.resumeSkus).toEqual([]);
  });

  it("includes New Resume upsell when readinessScore is below 85", () => {
    const result = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      readinessScore: 62,
      geo: "US",
    });
    expect(result.resumeSkus.map((s) => s.code)).toEqual([POWER_RESUME_OFFER_CODE]);
    expect(result.items.some((i) => i.code === POWER_RESUME_OFFER_CODE)).toBe(true);
    expect(result.resumeSkus[0]?.action).toBe("book");
  });

  it("does not include New Resume upsell when readinessScore is 85 or higher", () => {
    const atThreshold = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      readinessScore: 85,
      geo: "US",
    });
    const above = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      readinessScore: 90,
      geo: "US",
    });
    expect(atThreshold.resumeSkus).toEqual([]);
    expect(atThreshold.items.some((i) => i.code === POWER_RESUME_OFFER_CODE)).toBe(false);
    expect(above.resumeSkus).toEqual([]);
    expect(above.items.some((i) => i.code === POWER_RESUME_OFFER_CODE)).toBe(false);
  });

  it("omits resume upsell when readinessScore is omitted", () => {
    const result = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      geo: "US",
    });
    expect(result.resumeSkus).toEqual([]);
  });

  it("filters POPM and RTE from SM pathway and injects SAFe SM when YOE unknown", () => {
    const result = getUpsellRecommendations({
      targetRole: "Scrum Master/Agile Project Manager",
      context: "diagnosis",
      geo: "US",
    });
    const codes = result.safeCertSkus.map((s) => s.code);
    expect(codes).toEqual([SM_SAFE_SCRUM_MASTER_CODE]);
    expect(codes).not.toContain("safe-product-owner-product-manager-certification-training");
    expect(codes).not.toContain("safe-rte-certification-training");
    expect(codes).not.toContain(SM_LEADING_SAFE_CODE);
  });

  it("recommends Leading SAFe for SM pathway when YOE ≥ 12", () => {
    const result = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      yearsOfExperience: 12,
      geo: "US",
    });
    expect(result.safeCertSkus.map((s) => s.code)).toEqual([SM_LEADING_SAFE_CODE]);
  });

  it("recommends SAFe SM for SM pathway when YOE < 12", () => {
    const result = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      yearsOfExperience: 8,
      geo: "US",
    });
    expect(result.safeCertSkus.map((s) => s.code)).toEqual([SM_SAFE_SCRUM_MASTER_CODE]);
  });

  it("parses YOE from experienceHint when numeric YOE omitted", () => {
    const result = getUpsellRecommendations({
      targetRole: "Scrum Master",
      context: "diagnosis",
      experienceHint: "Senior developer with 15 years of IT experience",
      geo: "US",
    });
    expect(result.safeCertSkus.map((s) => s.code)).toEqual([SM_LEADING_SAFE_CODE]);
  });

  it("prices upsell SKUs in session currency (FR-178)", () => {
    const usd = getUpsellRecommendations({
      targetRole: "Scrum Master",
      context: "diagnosis",
      geo: "US",
      currency: "USD",
    });
    const inr = getUpsellRecommendations({
      targetRole: "Scrum Master",
      context: "diagnosis",
      geo: "IN",
      currency: "INR",
    });
    const usdAmount = usd.mockInterviewSkus[0]?.priceQuote.amount;
    const inrAmount = inr.mockInterviewSkus[0]?.priceQuote.amount;
    expect(usdAmount).toBeTruthy();
    expect(inrAmount).toBeTruthy();
    expect(Number.parseFloat(inrAmount!)).toBeGreaterThan(Number.parseFloat(usdAmount!));
  });

  it("ranks mock interview higher when gap tags mention interview", () => {
    const withGaps = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      gapTags: ["communication", "interview confidence"],
      geo: "US",
    });
    expect(withGaps.items[0]?.kind).toBe("service");
  });

  it("does not include discount marketing fields on upsell SKUs (FR-179)", () => {
    const result = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "detail",
      offerId: "course-agile-fundamentals",
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/percent_off|promo_badge|strikethrough/i);
  });
});
