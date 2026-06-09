import type { PrimaryAction } from "./contracts.js";

export type ConfidenceTier = "high" | "medium" | "low";

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

export function confidenceTierFromScore(confidence: number): ConfidenceTier {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}

export function buildSummaryPlain(
  targetRole: string | null,
  readinessScore: number,
  tier: ConfidenceTier,
): string {
  const role = targetRole ?? "your target role";
  if (tier === "low") {
    return `Your ${readinessScore}% readiness estimate for ${role} has lower confidence—we recommend validating with a mentor before committing to a full program.`;
  }
  if (tier === "medium") {
    return `You are on track for ${role} with a ${readinessScore}% readiness estimate. Focus on the top gaps in the roadmap below.`;
  }
  return `Strong alignment for ${role} at ${readinessScore}% readiness. Your recommended path addresses the highest-impact gaps first.`;
}

export function buildRoadmapPreview(
  targetRole: string | null,
  gaps: string[],
): RoadmapMilestone[] {
  const role = targetRole ?? "Agile professional";
  const topGap = gaps[0] ?? "core agile practices";
  const secondGap = gaps[1] ?? "stakeholder communication";
  return [
    {
      phase: "Week 1–2",
      title: `${role} foundations`,
      description: `Close "${topGap}" with live labs and backlog practice.`,
      status: "current",
    },
    {
      phase: "Week 3–4",
      title: "Applied practice",
      description: `Micro-exam + workshop on ${secondGap}.`,
      status: "upcoming",
    },
    {
      phase: "Week 5–8",
      title: "Interview readiness",
      description: "Mock interview bundle + certificate prep milestones.",
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
      label: "Book paid mentor call",
      href: "mailto:support@theagileforum.com?subject=Mentor%20call%20request",
      type: "mentor",
    },
  ];
}

export function buildEscalation(
  tier: ConfidenceTier,
  targetRole: string | null,
): EscalationOptions | null {
  if (tier !== "low") return null;
  const role = targetRole ?? "this role";
  return {
    title: "Validate before you enroll",
    message: `Resume signals for ${role} were thin or ambiguous. A 30-minute mentor call confirms your gaps and saves you from the wrong program.`,
    mentorCtaLabel: "Book mentor validation call · from ₹49 / $9",
    mentorHref:
      "mailto:support@theagileforum.com?subject=Low%20confidence%20diagnosis%20validation",
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
}) {
  const confidenceTier = confidenceTierFromScore(input.confidence);
  return {
    targetRole: input.targetRole,
    readinessScore: input.readinessScore,
    summaryPlain: buildSummaryPlain(input.targetRole, input.readinessScore, confidenceTier),
    confidenceTier,
    insights: {
      strengths: input.strengths,
      gaps: input.gaps,
      confidence: input.confidence,
    },
    roadmapPreview: buildRoadmapPreview(input.targetRole, input.gaps),
    recommendation: {
      primaryAction: input.primaryAction,
      rationale: input.rationale,
    },
    rationale: input.rationale,
    primaryAction: input.primaryAction,
    secondaryActions: buildSecondaryActions(),
    escalation: buildEscalation(confidenceTier, input.targetRole),
  };
}
