import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetEnvCache } from "../config/env.js";

const mockRunLive = vi.fn();
const mockShouldUseLive = vi.fn();

vi.mock("./ai-analyzer.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./ai-analyzer.js")>();
  return {
    ...actual,
    runLiveDiagnosis: (...args: unknown[]) => mockRunLive(...args),
    shouldUseLiveAi: (...args: unknown[]) => mockShouldUseLive(...args),
  };
});

const { resolveAnalysisRecommendation, buildStubRecommendation } = await import(
  "./analysis-runner.js"
);
const { buildStubAudit } = await import("./ai-analyzer.js");

describe("resolveAnalysisRecommendation", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://local:test@localhost:5432/test";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    process.env.AI_PROVIDER_MODE = "live";
    process.env.OPENROUTER_API_KEY = "test-key";
    resetEnvCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.AI_PROVIDER_MODE;
    delete process.env.OPENROUTER_API_KEY;
    resetEnvCache();
  });

  it("falls back to stub and marks usedStubFallback when live AI fails", async () => {
    mockShouldUseLive.mockReturnValue(true);
    mockRunLive.mockRejectedValue(new Error("OpenRouter down"));

    const result = await resolveAnalysisRecommendation({
      targetRole: "Scrum Master",
      timeline: "3 months",
      currentStatus: "Dev",
      resumeText: "Experienced SM",
      jdText: null,
    });

    expect(mockRunLive).toHaveBeenCalledOnce();
    expect(result.audit.usedStubFallback).toBe(true);
    expect(result.audit.fallbackReason).toContain("OpenRouter down");
    expect(result.recommendation.primaryAction.offeringCode).toBe("course-agile-fundamentals");
  });

  it("returns live recommendation when OpenRouter succeeds", async () => {
    mockShouldUseLive.mockReturnValue(true);
    mockRunLive.mockResolvedValue({
      recommendation: {
        readinessScore: 80,
        strengths: ["Facilitation"],
        gaps: ["Metrics"],
        confidence: 0.9,
        primaryAction: {
          type: "offer",
          label: "Mentorship",
          href: "/offers/course-agile-fundamentals",
          offeringCode: "course-agile-fundamentals",
        },
        rationale: [{ label: "Fit", detail: "Strong match" }],
      },
      audit: {
        provider: "openrouter",
        mode: "live",
        model: "google/gemma-4-26b-a4b-it:free",
        promptVersion: "diagnosis-ai-v1",
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        latencyMs: 400,
        usedStubFallback: false,
      },
    });

    const result = await resolveAnalysisRecommendation({
      targetRole: "Scrum Master",
      timeline: null,
      currentStatus: null,
      resumeText: "SM resume",
      jdText: "Need SAFe",
    });

    expect(result.audit.usedStubFallback).toBe(false);
    expect(result.recommendation.readinessScore).toBe(80);
    expect(result.audit.totalTokens).toBe(150);
  });

  it("uses stub path without fallback flag when AI_PROVIDER_MODE is stub", async () => {
    mockShouldUseLive.mockReturnValue(false);

    const result = await resolveAnalysisRecommendation({
      targetRole: "Product Owner",
      timeline: null,
      currentStatus: null,
      resumeText: "",
      jdText: null,
    });

    expect(mockRunLive).not.toHaveBeenCalled();
    expect(result.audit.usedStubFallback).toBe(false);
    expect(result.recommendation.readinessScore).toBe(
      buildStubRecommendation("Product Owner").readinessScore,
    );
    expect(buildStubAudit().usedStubFallback).toBe(false);
  });
});
