import type { Prisma } from "@prisma/client";
import { AnalysisRunStatus, AnalysisStage, DiagnosisSessionStatus } from "@prisma/client";
import { prisma } from "../db/client.js";
import { logInfo, logWarn } from "../runtime/logger.js";
import type { PrimaryAction, RationaleChip } from "./contracts.js";
import {
  buildStubAudit,
  runLiveDiagnosis,
  shouldUseLiveAi,
  type AnalysisAuditMeta,
} from "./ai-analyzer.js";
import type { DiagnosisRecommendation } from "./ai-diagnosis-schema.js";

const STAGE_PROGRESS: Record<AnalysisStage, number> = {
  PARSING: 30,
  MAPPING: 65,
  INSIGHTS: 90,
};

export function buildStubRecommendation(targetRole: string | null): DiagnosisRecommendation {
  const role = targetRole ?? "Agile professional";
  const isPoTransition = /product owner/i.test(role);
  return {
    readinessScore: isPoTransition ? 68 : 62,
    strengths: ["Stakeholder communication", "Delivery rhythm"],
    gaps: isPoTransition
      ? ["Prioritization frameworks", "Product discovery"]
      : ["SAFe PI planning depth", "Metrics storytelling"],
    confidence: isPoTransition ? 0.55 : 0.78,
    primaryAction: {
      type: "offer",
      label: `Start Live Project Mentorship Masterclass`,
      href: "/offers/course-agile-fundamentals",
      offeringCode: "course-agile-fundamentals",
    },
    rationale: [
      { label: "Role fit", detail: `Gaps align with ${role} hiring signals.` },
      {
        label: "Fastest win",
        detail: "Live project mentorship addresses top gaps for SM and PO roles.",
      },
    ],
  };
}

async function loadAnalysisInputs(sessionId: string): Promise<{
  resumeText: string;
  jdText: string | null;
}> {
  const [resume, jd] = await Promise.all([
    prisma.resumeAsset.findFirst({
      where: { sessionId, status: "VALIDATED" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jdInput.findUnique({ where: { sessionId } }),
  ]);
  return {
    resumeText: resume?.extractedText?.trim() ?? "",
    jdText: jd?.jdText?.trim() || null,
  };
}

/**
 * Choose live OpenRouter vs stub recommendation (with soft stub fallback on live failure).
 * Extracted for unit testing without Prisma.
 */
export async function resolveAnalysisRecommendation(input: {
  targetRole: string | null;
  timeline: string | null;
  currentStatus: string | null;
  resumeText: string;
  jdText: string | null;
}): Promise<{ recommendation: DiagnosisRecommendation; audit: AnalysisAuditMeta }> {
  if (!shouldUseLiveAi()) {
    return {
      recommendation: buildStubRecommendation(input.targetRole),
      audit: buildStubAudit(),
    };
  }

  try {
    const live = await runLiveDiagnosis(input);
    return { recommendation: live.recommendation, audit: live.audit };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logWarn("diagnosis.analysis.stub_fallback", {
      component: "diagnosis",
      event: "diagnosis.analysis.stub_fallback",
      reason,
    });
    return {
      recommendation: buildStubRecommendation(input.targetRole),
      audit: buildStubAudit(reason),
    };
  }
}

async function persistCompletedRun(input: {
  runId: string;
  sessionId: string;
  recommendation: DiagnosisRecommendation;
  audit: AnalysisAuditMeta;
  completedAt: Date;
}): Promise<void> {
  const { runId, sessionId, recommendation, audit, completedAt } = input;
  await prisma.$transaction([
    prisma.gapInsight.create({
      data: {
        analysisRunId: runId,
        readinessScore: recommendation.readinessScore,
        strengths: recommendation.strengths as Prisma.InputJsonValue,
        gaps: recommendation.gaps as Prisma.InputJsonValue,
        confidence: recommendation.confidence,
      },
    }),
    prisma.recommendation.create({
      data: {
        analysisRunId: runId,
        primaryAction: recommendation.primaryAction as Prisma.InputJsonValue,
        rationale: recommendation.rationale as Prisma.InputJsonValue,
      },
    }),
    prisma.analysisRun.update({
      where: { id: runId },
      data: {
        status: AnalysisRunStatus.COMPLETED,
        stage: AnalysisStage.INSIGHTS,
        progressPct: 100,
        completedAt,
        auditMeta: audit as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.diagnosisSession.update({
      where: { id: sessionId },
      data: {
        status: DiagnosisSessionStatus.COMPLETED,
        currentStep: "STEP_4",
      },
    }),
  ]);
}

export async function processAnalysisRun(runId: string): Promise<void> {
  const run = await prisma.analysisRun.findUnique({
    where: { id: runId },
    include: { session: true },
  });
  if (!run || run.status === AnalysisRunStatus.COMPLETED) {
    return;
  }

  const startedAt = new Date();
  await prisma.analysisRun.update({
    where: { id: runId },
    data: {
      status: AnalysisRunStatus.PROCESSING,
      startedAt,
    },
  });
  await prisma.diagnosisSession.update({
    where: { id: run.sessionId },
    data: { status: DiagnosisSessionStatus.ANALYZING },
  });

  for (const stage of [
    AnalysisStage.PARSING,
    AnalysisStage.MAPPING,
    AnalysisStage.INSIGHTS,
  ] as const) {
    await prisma.analysisRun.update({
      where: { id: runId },
      data: {
        stage,
        progressPct: STAGE_PROGRESS[stage],
      },
    });
  }

  let recommendation: DiagnosisRecommendation;
  let audit: AnalysisAuditMeta;

  const inputs = await loadAnalysisInputs(run.sessionId);
  const resolved = await resolveAnalysisRecommendation({
    targetRole: run.session.targetRole,
    timeline: run.session.timeline,
    currentStatus: run.session.currentStatus,
    resumeText: inputs.resumeText,
    jdText: inputs.jdText,
  });
  recommendation = resolved.recommendation;
  audit = resolved.audit;
  if (audit.provider === "openrouter" && !audit.usedStubFallback) {
    logInfo("diagnosis.analysis.live", {
      component: "diagnosis",
      event: "diagnosis.analysis.live",
      analysisRunId: runId,
      model: audit.model,
      latencyMs: audit.latencyMs,
    });
  }

  const completedAt = new Date();
  await persistCompletedRun({
    runId,
    sessionId: run.sessionId,
    recommendation,
    audit,
    completedAt,
  });
}

export function scheduleAnalysisRun(runId: string): void {
  setImmediate(() => {
    void processAnalysisRun(runId).catch(async (error) => {
      const message = error instanceof Error ? error.message : String(error);
      await prisma.analysisRun.update({
        where: { id: runId },
        data: {
          status: AnalysisRunStatus.FAILED,
          errorMessage: message,
        },
      });
    });
  });
}

// Re-export types used by tests / callers
export type { PrimaryAction, RationaleChip };
