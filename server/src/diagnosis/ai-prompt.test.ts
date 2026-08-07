import { describe, expect, it } from "vitest";
import {
  buildDiagnosisSystemPrompt,
  buildDiagnosisUserPrompt,
} from "./ai-prompt.js";
import { DIAGNOSIS_PROMPT_VERSION } from "./ai-diagnosis-schema.js";
import { loadGapDetectionRubric } from "./load-gap-rubric.js";

describe("gap detection rubric loader", () => {
  it("loads the markdown checklist from disk", () => {
    const rubric = loadGapDetectionRubric();
    expect(rubric).toMatch(/Quantified impact/i);
    expect(rubric).toMatch(/Role title vs Scrum Master/i);
    expect(rubric).toMatch(/Certification gaps/i);
    expect(rubric).toMatch(/do \*\*not\*\* recommend POPM or RTE/i);
    expect(rubric).toMatch(/Tool depth/i);
    expect(rubric).toMatch(/ATS keywords/i);
    expect(rubric).toMatch(/JD alignment/i);
    expect(rubric).toMatch(/Professional summary/i);
    expect(rubric).toMatch(/Experience section structure/i);
    expect(rubric).toMatch(/AI readiness/i);
  });
});

describe("buildDiagnosisSystemPrompt", () => {
  it("embeds policy guardrails, allowlist, version, and gap rubric", () => {
    const prompt = buildDiagnosisSystemPrompt();
    expect(prompt).toContain(DIAGNOSIS_PROMPT_VERSION);
    expect(prompt).toMatch(/Never guarantee a job/i);
    expect(prompt).toContain("course-agile-fundamentals");
    expect(prompt).toContain("gaps\": string[1-12]");
    expect(prompt).toContain("GAP DETECTION RUBRIC");
    expect(prompt).toMatch(/No quantified sprint\/delivery outcomes/i);
    expect(prompt).toMatch(/prefer 6–12 grounded gaps/i);
    expect(prompt).toMatch(/Do NOT recommend.*POPM|safe-product-owner/i);
    expect(prompt).toMatch(/safe-rte-certification-training \(RTE\)/i);
    expect(prompt).toMatch(/under 12 years|12\+ years/i);
  });
});

describe("buildDiagnosisUserPrompt", () => {
  it("asks for thorough rubric evaluation up to 12 gaps", () => {
    const prompt = buildDiagnosisUserPrompt({
      targetRole: "Scrum Master",
      timeline: null,
      currentStatus: null,
      resumeText: "Facilitated Daily Scrums for 2 teams.",
      jdText: null,
    });
    expect(prompt).toContain("Scrum Master");
    expect(prompt).toMatch(/up to 12/);
  });
});
