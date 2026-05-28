import type { Prisma } from "@prisma/client";
import { AnalysisRunStatus, AnalysisStage, DiagnosisSessionStatus } from "@prisma/client";
import { prisma } from "../db/client.js";
import type { PrimaryAction, RationaleChip } from "./contracts.js";

const STAGE_PROGRESS: Record<AnalysisStage, number> = {
  PARSING: 30,
  MAPPING: 65,
  INSIGHTS: 90,
};

function buildStubRecommendation(targetRole: string | null): {
  primaryAction: PrimaryAction;
  rationale: RationaleChip[];
  readinessScore: number;
  strengths: string[];
  gaps: string[];
  confidence: number;
} {
  const role = targetRole ?? "Agile professional";
  return {
    readinessScore: 62,
    strengths: ["Stakeholder communication", "Delivery rhythm"],
    gaps: ["SAFe PI planning depth", "Metrics storytelling"],
    confidence: 0.78,
    primaryAction: {
      type: "offer",
      label: `Start ${role} readiness program`,
      href: "/offers/agile-readiness",
      offeringCode: "agile-readiness",
    },
    rationale: [
      { label: "Role fit", detail: `Gaps align with ${role} hiring signals.` },
      { label: "Fastest win", detail: "Program addresses top two gaps in 4 weeks." },
    ],
  };
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

  const stub = buildStubRecommendation(run.session.targetRole);
  const completedAt = new Date();

  await prisma.$transaction([
    prisma.gapInsight.create({
      data: {
        analysisRunId: runId,
        readinessScore: stub.readinessScore,
        strengths: stub.strengths as Prisma.InputJsonValue,
        gaps: stub.gaps as Prisma.InputJsonValue,
        confidence: stub.confidence,
      },
    }),
    prisma.recommendation.create({
      data: {
        analysisRunId: runId,
        primaryAction: stub.primaryAction as Prisma.InputJsonValue,
        rationale: stub.rationale as Prisma.InputJsonValue,
      },
    }),
    prisma.analysisRun.update({
      where: { id: runId },
      data: {
        status: AnalysisRunStatus.COMPLETED,
        stage: AnalysisStage.INSIGHTS,
        progressPct: 100,
        completedAt,
      },
    }),
    prisma.diagnosisSession.update({
      where: { id: run.sessionId },
      data: {
        status: DiagnosisSessionStatus.COMPLETED,
        currentStep: "STEP_4",
      },
    }),
  ]);
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
