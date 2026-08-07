import { describe, expect, it } from "vitest";
import {
  aiDiagnosisResultSchema,
  parseAiDiagnosisResult,
} from "./ai-diagnosis-schema.js";

const validPayload = {
  readinessScore: 72,
  strengths: ["Sprint facilitation"],
  gaps: ["SAFe PI planning"],
  confidence: 0.8,
  primaryAction: {
    type: "offer" as const,
    label: "Start Mentorship",
    href: "/offers/course-agile-fundamentals",
    offeringCode: "course-agile-fundamentals" as const,
  },
  rationale: [{ label: "Gap fit", detail: "Mentorship closes live-project gaps." }],
};

describe("ai diagnosis schema", () => {
  it("accepts a valid payload", () => {
    expect(aiDiagnosisResultSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects unknown offering codes", () => {
    const bad = {
      ...validPayload,
      primaryAction: {
        ...validPayload.primaryAction,
        offeringCode: "not-a-real-offer",
      },
    };
    expect(aiDiagnosisResultSchema.safeParse(bad).success).toBe(false);
  });

  it("parses fenced JSON and normalizes offer href", () => {
    const raw = `\`\`\`json
${JSON.stringify({
  ...validPayload,
  primaryAction: {
    type: "offer",
    label: "Mentorship",
    href: "https://evil.example/x",
    offeringCode: "course-agile-fundamentals",
  },
})}
\`\`\``;
    const parsed = parseAiDiagnosisResult(raw);
    expect(parsed.primaryAction.href).toBe("/offers/course-agile-fundamentals");
    expect(parsed.readinessScore).toBe(72);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseAiDiagnosisResult("not-json")).toThrow(/not valid JSON/);
  });
});
