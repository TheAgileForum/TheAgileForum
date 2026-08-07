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

  it("accepts unknown offering codes at schema level (normalized later)", () => {
    const invented = {
      ...validPayload,
      primaryAction: {
        ...validPayload.primaryAction,
        offeringCode: "not-a-real-offer",
      },
    };
    expect(aiDiagnosisResultSchema.safeParse(invented).success).toBe(true);
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

  it("soft-remaps invented offering codes instead of failing the run", () => {
    const parsed = parseAiDiagnosisResult(
      JSON.stringify({
        ...validPayload,
        primaryAction: {
          type: "offer",
          label: "Mystery course",
          href: "/offers/whatever",
          offeringCode: "asmc-101",
        },
      }),
    );
    expect(parsed.primaryAction.offeringCode).toBe("course-agile-fundamentals");
    expect(parsed.primaryAction.href).toBe("/offers/course-agile-fundamentals");
  });

  it("coerces string readinessScore and confidence from free models", () => {
    const parsed = parseAiDiagnosisResult(
      JSON.stringify({
        ...validPayload,
        readinessScore: "72.4",
        confidence: "0.8",
      }),
    );
    expect(parsed.readinessScore).toBe(72);
    expect(parsed.confidence).toBe(0.8);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseAiDiagnosisResult("not-json")).toThrow(/not valid JSON/);
  });
});
