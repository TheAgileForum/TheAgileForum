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
    expect(roadmap[0].phase).toBe("Week 1–3");
    expect(roadmap[0].title).toContain("Complete Mastery");
    expect(roadmap[0].description).toContain('Close Skill gap of "Prioritization"');
    expect(roadmap[1].title).toBe("Getting SAFe Certified");
    expect(roadmap[1].description).toMatch(/recognized SAFe/i);
    expect(roadmap[2].title).toBe("Interview readiness");
    expect(roadmap[2].description).toMatch(/Mock interview bundle/i);
    expect(roadmap.map((m) => m.phase)).toEqual(["Week 1–3", "Week 3–4", "Week 5–7"]);
  });

  it("uses founder SM/APM mastery copy for Scrum Master pathway", () => {
    const roadmap = buildRoadmapPreview("Scrum Master/Agile Project Manager", [
      "Summary lacks Scrum Master/Agile PM specific positioning",
    ]);
    expect(roadmap[0].title).toBe(
      "Scrum Master/Agile Project Manager Complete Mastery with Live Practical Project and Sprint Execution",
    );
    expect(roadmap[0].description).toContain(
      'Close Skill gap of "Summary lacks Scrum Master/Agile PM specific positioning"',
    );
    expect(roadmap[0].description).toContain("PSM certification");
    expect(roadmap[0].description).toContain("60+ topics");
    expect(roadmap[1].description).toMatch(/Top 1%/i);
    expect(roadmap[1].description).toMatch(/related concepts/i);
  });

  it("includes escalation only for low confidence without pricing", () => {
    expect(buildEscalation("high", "PO")).toBeNull();
    expect(buildEscalation("medium", "PO")).toBeNull();
    const escalation = buildEscalation("low", "PO");
    expect(escalation?.title).toBe("Validate before you enroll");
    expect(escalation?.mentorCtaLabel).toBe("Book mentor validation call");
    expect(escalation?.mentorCtaLabel).not.toMatch(/₹|\$/);
    expect(escalation?.mentorHref).toBe(TOPMATE_URL);
    expect(escalation?.message).toMatch(/match/i);
  });

  it("keeps clear low-certainty copy and mentor escalation for weak confidence", () => {
    const lowSummary = buildSummaryPlain("Scrum Master", 40, "low", "available");
    expect(lowSummary).toMatch(/lower certainty/i);
    expect(lowSummary).toMatch(/mentor/i);

    // High/medium summaries must not surface estimate-badge phrasing (UI hides those badges).
    expect(buildSummaryPlain("Scrum Master", 80, "high")).not.toMatch(/Strong estimate|Moderate estimate/i);
    expect(buildSummaryPlain("Scrum Master", 65, "medium")).not.toMatch(/Strong estimate|Moderate estimate/i);

    const lowPayload = enrichAnalysisPayload({
      targetRole: "Scrum Master",
      readinessScore: 40,
      confidence: 0.5,
      strengths: ["Comms"],
      gaps: ["Facilitation"],
      primaryAction: {
        type: "offer",
        label: "Start program",
        href: "/offers/course-agile-fundamentals",
        offeringCode: "course-agile-fundamentals",
      },
      rationale: [{ label: "Fit", detail: "Aligned" }],
    });
    expect(lowPayload.confidenceTier).toBe("low");
    expect(lowPayload.summaryPlain).toMatch(/lower certainty/i);
    expect(lowPayload.escalation).not.toBeNull();
    expect(lowPayload.escalation?.mentorCtaLabel).toBe("Book mentor validation call");

    const highPayload = enrichAnalysisPayload({
      targetRole: "Scrum Master",
      readinessScore: 80,
      confidence: 0.85,
      strengths: ["Comms"],
      gaps: ["SAFe"],
      primaryAction: {
        type: "offer",
        label: "Start program",
        href: "/offers/course-agile-fundamentals",
        offeringCode: "course-agile-fundamentals",
      },
      rationale: [{ label: "Fit", detail: "Aligned" }],
    });
    expect(highPayload.confidenceTier).toBe("high");
    expect(highPayload.escalation).toBeNull();
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
