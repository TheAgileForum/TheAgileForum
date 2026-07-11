import { describe, expect, it } from "vitest";
import {
  buildEscalation,
  buildRoadmapPreview,
  confidenceTierFromScore,
  enrichAnalysisPayload,
} from "./result-enrichment.js";

describe("result-enrichment", () => {
  it("maps confidence scores to tiers", () => {
    expect(confidenceTierFromScore(0.8)).toBe("high");
    expect(confidenceTierFromScore(0.65)).toBe("medium");
    expect(confidenceTierFromScore(0.5)).toBe("low");
  });

  it("returns three roadmap milestones", () => {
    const roadmap = buildRoadmapPreview("Product Owner", ["Prioritization", "Discovery"]);
    expect(roadmap).toHaveLength(3);
    expect(roadmap[0].status).toBe("current");
    expect(roadmap[0].description).toContain("Prioritization");
  });

  it("includes escalation only for low confidence", () => {
    expect(buildEscalation("high", "PO")).toBeNull();
    expect(buildEscalation("low", "PO")?.mentorCtaLabel).toMatch(/mentor validation/i);
    expect(buildEscalation("low", "PO")?.mentorHref).toBe("https://topmate.io/coach_dhirender_verma");
  });

  it("enriches full analysis payload", () => {
    const payload = enrichAnalysisPayload({
      targetRole: "Product Owner",
      readinessScore: 62,
      confidence: 0.55,
      strengths: ["Comms"],
      gaps: ["Prioritization"],
      primaryAction: {
        type: "offer",
        label: "Start program",
        href: "/offers/agile-readiness",
        offeringCode: "agile-readiness",
      },
      rationale: [{ label: "Fit", detail: "Aligned" }],
    });
    expect(payload.confidenceTier).toBe("low");
    expect(payload.escalation).not.toBeNull();
    expect(payload.roadmapPreview).toHaveLength(3);
    expect(payload.secondaryActions.length).toBeGreaterThanOrEqual(3);
  });
});
