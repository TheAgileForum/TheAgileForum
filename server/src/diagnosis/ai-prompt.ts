import {
  DIAGNOSIS_OFFERING_ALLOWLIST,
  DIAGNOSIS_PROMPT_VERSION,
} from "./ai-diagnosis-schema.js";

export type DiagnosisPromptInput = {
  targetRole: string | null;
  timeline: string | null;
  currentStatus: string | null;
  resumeText: string;
  jdText: string | null;
};

const OFFERING_BLURBS: Record<string, string> = {
  "course-agile-fundamentals":
    "Live Project Mentorship Masterclass (Scrum Master / Product Owner) — hands-on JIRA project",
  "service-mock-interview-sm": "Mock Interview series + Interview Prep",
  "service-power-resume-cover-letter": "Power Resume + Cover Letter",
  "safe-leading-safe": "SAFe Agilist (Leading SAFe) certification training",
  "safe-product-owner-product-manager-certification-training":
    "SAFe Product Owner / Product Manager certification training",
  "safe-scrum-master-certification-training": "SAFe Scrum Master certification training",
  "csm-certification-training": "CSM certification training",
  "safe-rte-certification-training": "SAFe RTE certification training",
  "psm-ii-certification-training": "PSM II certification training",
  "exam-practice-free": "Free practice exam",
  "exam-mock-certification": "Paid mock certification exam",
};

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n…[truncated]`;
}

export function buildDiagnosisSystemPrompt(): string {
  const allowlist = DIAGNOSIS_OFFERING_ALLOWLIST.map(
    (code) => `- ${code}: ${OFFERING_BLURBS[code] ?? code}`,
  ).join("\n");

  return `You are a career-skills diagnosis assistant for The Agile Forum (agile training & mentorship).

POLICY (must follow):
- Never guarantee a job, interview outcome, salary, promotion, or certification pass.
- Do not invent employer names, salary figures, or placement rates.
- Recommend ONLY offerings from the allowlist below (use offeringCode exactly).
- Prefer practical mentorship for hands-on / job-ready gaps; mock interview for interview prep; resume service for resume gaps; SAFe/CSM/PSM only when certification is clearly indicated.
- Be concise, specific, and evidence-based from the resume/JD provided.
- If resume text is thin or missing, lower confidence (≤ 0.55) and note ambiguity in rationale.
- When resume text is missing or marked as not extracted, use rationale label "Resume file" (never "Insufficient Data") and explain that a text-based PDF or DOCX is needed — not a scanned/image PDF.

OUTPUT:
- Respond with a single JSON object only (no markdown fences, no prose).
- Schema:
{
  "readinessScore": 0-100 integer,
  "strengths": string[1-8],
  "gaps": string[1-8],
  "confidence": 0-1 number,
  "primaryAction": {
    "type": "offer" | "assessment" | "webinar" | "mentor",
    "label": string,
    "href": string,
    "offeringCode": "<allowlist code when type is offer>"
  },
  "rationale": [{ "label": string, "detail": string }] (1-5 items)
}

Prompt version: ${DIAGNOSIS_PROMPT_VERSION}

ALLOWLIST:
${allowlist}`;
}

export function buildDiagnosisUserPrompt(input: DiagnosisPromptInput): string {
  const trimmedResume = input.resumeText.trim();
  const resume = trimmedResume
    ? truncate(trimmedResume, 12_000)
    : "(no resume text extracted — file may be image-based/scanned PDF, unsupported format, or extraction failed; treat as unreadable resume and recommend text-based PDF or DOCX)";
  const jd = input.jdText?.trim()
    ? truncate(input.jdText.trim(), 6_000)
    : "(no job description provided)";

  return `Target role: ${input.targetRole ?? "not specified"}
Timeline: ${input.timeline ?? "not specified"}
Current status: ${input.currentStatus ?? "not specified"}

--- RESUME TEXT ---
${resume}

--- JOB DESCRIPTION ---
${jd}

Produce the JSON diagnosis now.`;
}
