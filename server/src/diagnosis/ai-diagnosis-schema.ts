import { z } from "zod";
import type { PrimaryAction, RationaleChip } from "./contracts.js";

/** Bump when gap rubric or system prompt instructions change (audit trail). */
export const DIAGNOSIS_PROMPT_VERSION = "diagnosis-ai-v4";

/** Catalog offering codes the model may recommend (allowlist). */
export const DIAGNOSIS_OFFERING_ALLOWLIST = [
  "course-agile-fundamentals",
  "service-mock-interview-sm",
  "service-power-resume-cover-letter",
  "safe-leading-safe",
  "safe-product-owner-product-manager-certification-training",
  "safe-scrum-master-certification-training",
  "csm-certification-training",
  "safe-rte-certification-training",
  "psm-ii-certification-training",
  "exam-practice-free",
  "exam-mock-certification",
] as const;

export type DiagnosisOfferingCode = (typeof DIAGNOSIS_OFFERING_ALLOWLIST)[number];

const primaryActionSchema = z.object({
  type: z.enum(["offer", "assessment", "webinar", "mentor"]),
  label: z.string().min(1).max(200),
  href: z.string().min(1).max(500),
  // Accept any string here; allowlist is enforced in parseAiDiagnosisResult so
  // free models inventing codes soft-remap instead of failing the whole run.
  offeringCode: z.string().min(1).max(120).optional(),
});

const rationaleChipSchema = z.object({
  label: z.string().min(1).max(80),
  detail: z.string().min(1).max(400),
});

/**
 * Structured AI diagnosis payload — mirrors GapInsight + Recommendation contracts.
 * Coercions keep free / smaller models from failing the whole run on minor type drift.
 */
export const aiDiagnosisResultSchema = z.object({
  readinessScore: z.coerce.number().min(0).max(100).transform((n) => Math.round(n)),
  strengths: z.array(z.string().min(1).max(200)).min(1).max(8),
  /** Raised to 12 so rubric-driven SM/APM reviews can return more specific chips. */
  gaps: z.array(z.string().min(1).max(200)).min(1).max(12),
  confidence: z.coerce.number().min(0).max(1),
  primaryAction: primaryActionSchema,
  rationale: z.array(rationaleChipSchema).min(1).max(5),
});

export type AiDiagnosisResult = z.infer<typeof aiDiagnosisResultSchema>;

export type DiagnosisRecommendation = {
  primaryAction: PrimaryAction;
  rationale: RationaleChip[];
  readinessScore: number;
  strengths: string[];
  gaps: string[];
  confidence: number;
};

const OFFER_HREF_BY_CODE: Record<string, string> = {
  "course-agile-fundamentals": "/offers/course-agile-fundamentals",
  "service-mock-interview-sm": "/offers/service-mock-interview-sm",
  "service-power-resume-cover-letter": "/offers/service-power-resume-cover-letter",
  "safe-leading-safe": "/offers/safe-leading-safe",
  "safe-product-owner-product-manager-certification-training":
    "/offers/safe-product-owner-product-manager-certification-training",
  "safe-scrum-master-certification-training": "/offers/safe-scrum-master-certification-training",
  "csm-certification-training": "/offers/csm-certification-training",
  "safe-rte-certification-training": "/offers/safe-rte-certification-training",
  "psm-ii-certification-training": "/offers/psm-ii-certification-training",
  "exam-practice-free": "/offers/exam-practice-free",
  "exam-mock-certification": "/offers/exam-mock-certification",
};

/**
 * Parse model JSON (optionally fenced) and validate against the diagnosis schema.
 * Normalizes offer hrefs to catalog paths when offeringCode is present.
 */
export function parseAiDiagnosisResult(raw: string): DiagnosisRecommendation {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const jsonText = fenced?.[1]?.trim() ?? trimmed;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("AI diagnosis response is not valid JSON");
  }

  const result = aiDiagnosisResultSchema.safeParse(parsed);
  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    throw new Error(`AI diagnosis schema validation failed: ${detail}`);
  }

  const data = result.data;
  let primaryAction: PrimaryAction = { ...data.primaryAction };

  if (primaryAction.type === "offer") {
    const code = primaryAction.offeringCode;
    const allowed =
      code !== undefined &&
      (DIAGNOSIS_OFFERING_ALLOWLIST as readonly string[]).includes(code);
    if (!allowed || !code) {
      primaryAction = {
        type: "offer",
        label: "Start Live Project Mentorship Masterclass",
        href: OFFER_HREF_BY_CODE["course-agile-fundamentals"],
        offeringCode: "course-agile-fundamentals",
      };
    } else {
      primaryAction = {
        ...primaryAction,
        href: OFFER_HREF_BY_CODE[code] ?? `/offers/${code}`,
        offeringCode: code,
      };
    }
  }

  return {
    readinessScore: data.readinessScore,
    strengths: data.strengths,
    gaps: data.gaps,
    confidence: data.confidence,
    primaryAction,
    rationale: data.rationale,
  };
}
