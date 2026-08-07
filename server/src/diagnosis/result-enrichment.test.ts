import { describe, expect, it } from "vitest";
import {
  buildEscalation,
  buildMatchHeadline,
  buildRoadmapPreview,
  buildSummaryPlain,
  confidenceTierFromScore,
  enrichAnalysisPayload,
  isInsufficientResumeRationale,
  sanitizeRationaleForResumeStatus,
} from "./result-enrichment.js";

const TOPMATE_URL =
  "https://topmate.io/coach_dhirender_verma/877632?utm_source=public_profile&utm_campaign=coach_dhirender_verma";

describe("result-enrichment", () => {
  it("maps confidence scores to tiers", () => {
    expect(confidenceTierFromScore(0.8)).toBe("high");
    expect(confidenceTierFromScore(0.65)).toBe("medium");
    expect(confidenceTierFromScore(0.5)).toBe("low");
  });

  it("builds plain-language match headlines", () => {
    expect(buildMatchHeadline("Scrum Master", 30)).toBe(
      "Your resume is just 30% match to Scrum Master",
    );
    expect(buildMatchHeadline("Product Owner", 62)).toContain("62% match");
    expect(buildMatchHeadline("Scrum Master", 82)).toContain("strong");
  });

  it("returns three roadmap milestones", () => {
    const roadmap = buildRoadmapPreview("Product Owner", ["Prioritization", "Discovery"]);
    expect(roadmap).toHaveLength(3);
    expect(roadmap[0].status).toBe("current");
    expect(roadmap[0].description).toContain("Prioritization");
  });

  it("includes escalation only for low confidence without pricing", () => {
    expect(buildEscalation("high", "PO")).toBeNull();
    const escalation = buildEscalation("low", "PO");
    expect(escalation?.mentorCtaLabel).toBe("Book mentor validation call");
    expect(escalation?.mentorCtaLabel).not.toMatch(/₹|\$/);
    expect(escalation?.mentorHref).toBe(TOPMATE_URL);
    expect(escalation?.message).toMatch(/match/i);
  });

  it("explains unreadable resume in escalation and summary", () => {
    const escalation = buildEscalation("low", "Scrum Master", "unreadable");
    expect(escalation?.message).toMatch(/couldn't read/i);
    const summary = buildSummaryPlain("Scrum Master", 30, "low", "unreadable");
    expect(summary).toMatch(/text-based PDF or DOCX/i);
    expect(summary).not.toMatch(/% match/i);
  });

  it("does not repeat the match headline in summaryPlain", () => {
    const headline = buildMatchHeadline("Scrum Master", 35);
    const summary = buildSummaryPlain("Scrum Master", 35, "high", "available");
    expect(headline).toContain("35% match");
    expect(summary).not.toContain("35% match");
    expect(summary).toMatch(/recommended path/i);
    expect(buildSummaryPlain("Scrum Master", 35, "medium")).not.toMatch(/% match/i);
    expect(buildSummaryPlain("Scrum Master", 35, "low")).not.toMatch(/% match/i);
  });

  it("sanitizes Insufficient Data rationale when resume was unreadable", () => {
    const sanitized = sanitizeRationaleForResumeStatus(
      [
        {
          label: "Insufficient Data",
          detail: "No resume text was provided for analysis.",
        },
        { label: "Fit", detail: "Role gaps suggest mentorship." },
      ],
      "unreadable",
    );
    expect(sanitized[0].label).toBe("Resume file");
    expect(sanitized[0].detail).toMatch(/couldn't read text/i);
    expect(sanitized.some((c) => /insufficient/i.test(c.label))).toBe(false);
    expect(isInsufficientResumeRationale({ label: "Insufficient Data", detail: "x" })).toBe(true);
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
        href: "/offers/course-agile-fundamentals",
        offeringCode: "course-agile-fundamentals",
      },
      rationale: [{ label: "Fit", detail: "Aligned" }],
    });
    expect(payload.confidenceTier).toBe("low");
    expect(payload.escalation).not.toBeNull();
    expect(payload.matchHeadline).toContain("62% match");
    expect(payload.resumeInputStatus).toBe("available");
    expect(payload.roadmapPreview).toHaveLength(3);
    expect(payload.secondaryActions.length).toBeGreaterThanOrEqual(3);
    expect(payload.secondaryActions.find((a) => a.type === "mentor")?.label).toBe(
      "Book mentor call",
    );
    expect(payload.usedStubFallback).toBe(false);
    expect(payload).not.toHaveProperty("fallbackReason");
    expect(payload.yearsOfExperience).toBeNull();
  });

  it("passes through parsed yearsOfExperience when provided", () => {
    const payload = enrichAnalysisPayload({
      targetRole: "Scrum Master",
      readinessScore: 50,
      confidence: 0.8,
      strengths: ["Comms"],
      gaps: ["SAFe"],
      primaryAction: {
        type: "offer",
        label: "Start program",
        href: "/offers/course-agile-fundamentals",
        offeringCode: "course-agile-fundamentals",
      },
      rationale: [{ label: "Fit", detail: "Aligned" }],
      yearsOfExperience: 14,
    });
    expect(payload.yearsOfExperience).toBe(14);
  });

  it("surfaces fallbackReason only when usedStubFallback is true", () => {
    const payload = enrichAnalysisPayload({
      targetRole: "Scrum Master",
      readinessScore: 62,
      confidence: 0.78,
      strengths: ["Comms"],
      gaps: ["SAFe"],
      primaryAction: {
        type: "offer",
        label: "Start program",
        href: "/offers/course-agile-fundamentals",
        offeringCode: "course-agile-fundamentals",
      },
      rationale: [{ label: "Fit", detail: "Aligned" }],
      usedStubFallback: true,
      fallbackReason: "OpenRouter model=x HTTP 404: unavailable for free",
    });
    expect(payload.usedStubFallback).toBe(true);
    expect(payload.fallbackReason).toContain("unavailable for free");
  });
});
