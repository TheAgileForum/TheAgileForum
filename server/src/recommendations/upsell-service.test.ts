import { describe, expect, it } from "vitest";
import { getUpsellRecommendations } from "./upsell-service.js";

describe("role-based upsell recommendations (FR-181)", () => {
  it("returns SAFe cert and mock interview SKUs for scrum master", () => {
    const result = getUpsellRecommendations({
      targetRole: "scrum_master",
      context: "diagnosis",
      geo: "US",
      currency: "USD",
    });
    expect(result.safeCertSkus.length).toBeGreaterThan(0);
    expect(result.safeCertSkus[0]?.scheduleRef).toBeTruthy();
    expect(result.mockInterviewSkus.length).toBeGreaterThan(0);
    expect(result.mockInterviewSkus[0]?.code).toBe("service-mock-interview-sm");
    expect(result.primaryCta?.offeringCode).toBeTruthy();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.priceQuote.currency).toBe("USD");
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
