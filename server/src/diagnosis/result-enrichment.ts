import type { PrimaryAction } from "./contracts.js";
import { MENTOR_BOOKING_URL } from "../constants/platform.js";

export type ConfidenceTier = "high" | "medium" | "low";

/** Whether we had usable resume text for the diagnosis. */
export type ResumeInputStatus = "available" | "unreadable" | "missing";

export type RoadmapMilestone = {
  phase: string;
  title: string;
  description: string;
  status: "current" | "upcoming" | "future";
};

export type SecondaryAction = {
  id: string;
  label: string;
  href: string;
  type: "micro_exam" | "webinar" | "mentor" | "support";
};

export type EscalationOptions = {
  title: string;
  message: string;
  mentorCtaLabel: string;
  mentorHref: string;
  supportHref: string;
};

export type RationaleChip = {
  label: string;
  detail: string;
};

const UNREADABLE_RESUME_DETAIL =
  "We couldn't read text from your resume file — try a text-based PDF or DOCX (not a scanned/image PDF).";

const MISSING_RESUME_DETAIL =
  "No resume was provided, so this estimate is based on your role and other answers only.";

export function confidenceTierFromScore(confidence: number): ConfidenceTier {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}

export function buildMatchHeadline(
  targetRole: string | null,
  readinessScore: number,
): string {
  const role = targetRole ?? "your target role";
  if (readinessScore < 50) {
    return `Your resume is just ${readinessScore}% match to ${role}`;
  }
  if (readinessScore < 75) {
    return `Your resume is a ${readinessScore}% match to ${role}`;
  }
  return `Your resume is a strong ${readinessScore}% match to ${role}`;
}

/**
 * Supporting copy under the big match %. Does NOT repeat buildMatchHeadline —
 * the UI already shows that sentence next to the score.
 * targetRole / readinessScore kept for call-site stability (unused here).
 */
export function buildSummaryPlain(
  _targetRole: string | null,
  _readinessScore: number,
  tier: ConfidenceTier,
  resumeInputStatus: ResumeInputStatus = "available",
): string {
  if (resumeInputStatus === "unreadable") {
    return `${UNREADABLE_RESUME_DETAIL} Re-upload a readable file for a fuller estimate.`;
  }
  if (resumeInputStatus === "missing") {
    return MISSING_RESUME_DETAIL;
  }

  if (tier === "low") {
    return "This estimate has lower certainty—we recommend validating with a mentor before committing to a full program.";
  }
  if (tier === "medium") {
    return "Focus on the top gaps in the roadmap below.";
  }
  return "Your recommended path addresses the highest-impact gaps first.";
}

export function isInsufficientResumeRationale(chip: RationaleChip): boolean {
  const blob = `${chip.label} ${chip.detail}`.toLowerCase();
  return (
    /insufficient\s*data/.test(blob) ||
    /no resume text/.test(blob) ||
    /resume text (was |is )?(not |missing|empty|unavailable|provided)/.test(blob) ||
    /missing resume/.test(blob) ||
    /without (a )?resume/.test(blob) ||
    /resume (was |is )?(not )?(provided|uploaded|available)/.test(blob)
  );
}

export function sanitizeRationaleForResumeStatus(
  rationale: RationaleChip[],
  resumeInputStatus: ResumeInputStatus,
): RationaleChip[] {
  if (resumeInputStatus === "available") return rationale;

  const filtered = rationale.filter((chip) => !isInsufficientResumeRationale(chip));
  const notice: RationaleChip =
    resumeInputStatus === "unreadable"
      ? { label: "Resume file", detail: UNREADABLE_RESUME_DETAIL }
      : { label: "No resume", detail: MISSING_RESUME_DETAIL };

  return [notice, ...filtered].slice(0, 5);
}

function isSmApmPathway(targetRole: string | null): boolean {
  if (!targetRole) return false;
  const n = targetRole.trim().toLowerCase();
  return n.includes("scrum master") || n.includes("agile project manager");
}

/**
 * 3–7 week roadmap preview copy. SM/APM uses founder pathway wording;
 * other roles share the same milestone shape with role-substituted mastery title.
 */
export function buildRoadmapPreview(
  targetRole: string | null,
  gaps: string[],
): RoadmapMilestone[] {
  const role = targetRole ?? "Agile professional";
  const topGap = gaps[0] ?? "core agile practices";
  const smPathway = isSmApmPathway(targetRole);
  const masteryTitle = smPathway
    ? "Scrum Master/Agile Project Manager Complete Mastery with Live Practical Project and Sprint Execution"
    : `${role} Complete Mastery with Live Practical Project and Sprint Execution`;
  const week1Description = smPathway
    ? `Close Skill gap of "${topGap}" with live labs and backlog practice. Full end to end industry enablement for Scrum Master/Agile PM role with Scrum, Kanban, Agile Project Management and other 60+ topics covered to clear interviews with 100% confidence. This Live Project training is also a prerequisite for taking the PSM certification exam. Micro-exams also helps you to be fully prepared for the role.`
    : `Close Skill gap of "${topGap}" with live labs and backlog practice. Full end to end industry enablement for ${role} with hands-on project work and interview-focused practice. Micro-exams also help you prepare for the role.`;

  return [
    {
      phase: "Week 1–3",
      title: masteryTitle,
      description: week1Description,
      status: "current",
    },
    {
      phase: "Week 3–4",
      title: "Getting SAFe Certified",
      description:
        "Globally recognized SAFe certification helps your resume to be in Top 1% list and also help you to answer all scaling agile related concepts in Interview.",
      status: "upcoming",
    },
    {
      phase: "Week 5–7",
      title: "Interview readiness",
      description: "Mock interview bundle.",
      status: "future",
    },
  ];
}

export function buildSecondaryActions(): SecondaryAction[] {
  return [
    {
      id: "micro-exam",
      label: "Take micro-exam",
      href: "#micro-exam",
      type: "micro_exam",
    },
    {
      id: "webinar",
      label: "Join free webinar",
      href: "mailto:support@theagileforum.com?subject=Webinar%20registration",
      type: "webinar",
    },
    {
      id: "mentor",
      label: "Book mentor call",
      href: MENTOR_BOOKING_URL,
      type: "mentor",
    },
  ];
}

export function buildEscalation(
  tier: ConfidenceTier,
  targetRole: string | null,
  resumeInputStatus: ResumeInputStatus = "available",
): EscalationOptions | null {
  if (tier !== "low") return null;
  const role = targetRole ?? "this role";
  let message: string;
  if (resumeInputStatus === "unreadable") {
    message = `We couldn't read enough text from your resume to score ${role} confidently. A 30-minute mentor call clarifies your gaps—and you can re-upload a text-based PDF or DOCX for a better match estimate.`;
  } else if (resumeInputStatus === "missing") {
    message = `Without a resume, your match estimate for ${role} is limited. A 30-minute mentor call confirms your gaps and saves you from the wrong program.`;
  } else {
    message = `Your resume match for ${role} looks incomplete or uncertain. A 30-minute mentor call confirms your gaps and saves you from the wrong program.`;
  }
  return {
    title: "Validate before you enroll",
    message,
    mentorCtaLabel: "Book mentor validation call",
    mentorHref: MENTOR_BOOKING_URL,
    supportHref: "mailto:support@theagileforum.com?subject=Diagnosis%20support",
  };
}

export function enrichAnalysisPayload(input: {
  targetRole: string | null;
  readinessScore: number;
  confidence: number;
  strengths: string[];
  gaps: string[];
  primaryAction: PrimaryAction;
  rationale: Array<{ label: string; detail: string }>;
  usedStubFallback?: boolean;
  fallbackReason?: string;
  resumeInputStatus?: ResumeInputStatus;
  /** Parsed total YOE from intent/resume; null when unknown (SM pathway defaults to SAFe SM). */
  yearsOfExperience?: number | null;
}) {
  const confidenceTier = confidenceTierFromScore(input.confidence);
  const usedStubFallback = Boolean(input.usedStubFallback);
  const resumeInputStatus = input.resumeInputStatus ?? "available";
  const rationale = sanitizeRationaleForResumeStatus(input.rationale, resumeInputStatus);
  const yearsOfExperience =
    typeof input.yearsOfExperience === "number" && Number.isFinite(input.yearsOfExperience)
      ? input.yearsOfExperience
      : null;
  return {
    targetRole: input.targetRole,
    readinessScore: input.readinessScore,
    matchHeadline: buildMatchHeadline(input.targetRole, input.readinessScore),
    summaryPlain: buildSummaryPlain(
      input.targetRole,
      input.readinessScore,
      confidenceTier,
      resumeInputStatus,
    ),
    confidenceTier,
    resumeInputStatus,
    yearsOfExperience,
    insights: {
      strengths: input.strengths,
      gaps: input.gaps,
      confidence: input.confidence,
    },
    roadmapPreview: buildRoadmapPreview(input.targetRole, input.gaps),
    recommendation: {
      primaryAction: input.primaryAction,
      rationale,
    },
    rationale,
    primaryAction: input.primaryAction,
    secondaryActions: buildSecondaryActions(),
    escalation: buildEscalation(confidenceTier, input.targetRole, resumeInputStatus),
    usedStubFallback,
    ...(usedStubFallback && input.fallbackReason
      ? { fallbackReason: input.fallbackReason }
      : {}),
  };
}
