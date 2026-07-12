import {
  DiagnosisSessionStatus,
  DiagnosisStep,
  ResumeAssetStatus,
} from "@prisma/client";
import { prisma } from "../db/client.js";
import { ApiError } from "../errors/api-error.js";
import { publishEvent } from "../events/publisher.js";
import { validateResumeUpload } from "../security/upload-policy.js";
import { scheduleAnalysisRun } from "./analysis-runner.js";
import { upsertSessionJourney } from "./journey-state-service.js";
import type { PrimaryAction } from "./contracts.js";
import { enrichAnalysisPayload } from "./result-enrichment.js";
import { logError } from "../runtime/logger.js";

function nextStepForStatus(status: DiagnosisSessionStatus): string {
  switch (status) {
    case DiagnosisSessionStatus.DRAFT:
      return "step_1";
    case DiagnosisSessionStatus.INTENT_SAVED:
      return "step_2";
    case DiagnosisSessionStatus.INPUT_READY:
      return "step_2";
    case DiagnosisSessionStatus.ANALYZING:
      return "step_3";
    case DiagnosisSessionStatus.COMPLETED:
      return "step_4";
    default:
      return "step_1";
  }
}

async function getSessionOrThrow(sessionId: string) {
  const session = await prisma.diagnosisSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw new ApiError({
      status: 404,
      code: "DIAGNOSIS_SESSION_NOT_FOUND",
      message: "Diagnosis session not found",
    });
  }
  return session;
}

export async function createDiagnosisSession(input: {
  userId?: string;
  roleIntent?: string;
  campaignId?: string;
}) {
  const session = await prisma.diagnosisSession.create({
    data: {
      userId: input.userId,
      roleIntent: input.roleIntent,
      campaignId: input.campaignId,
      status: DiagnosisSessionStatus.DRAFT,
      currentStep: DiagnosisStep.STEP_1,
    },
  });

  void upsertSessionJourney({
    sessionId: session.id,
    currentFlow: "diagnosis",
    currentStep: "step_1",
    resumePayload: { diagnosisSessionId: session.id },
  }).catch((error) => {
    logError("diagnosis journey upsert failed", {
      component: "diagnosis",
      diagnosisSessionId: session.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  void publishEvent({
    eventName: "diagnosis.started",
    source: "api",
    idempotencyKey: `diagnosis.started:${session.id}`,
    payload: {
      diagnosisSessionId: session.id,
      campaignId: input.campaignId ?? null,
    },
  }).catch((error) => {
    logError("diagnosis.started event publish failed", {
      component: "diagnosis",
      diagnosisSessionId: session.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return {
    diagnosisSessionId: session.id,
    nextStep: nextStepForStatus(session.status),
  };
}

export async function saveDiagnosisIntent(
  sessionId: string,
  input: {
    targetRole: string;
    timeline: string;
    currentStatus: string;
    consentAck: true;
    policyVersion: string;
    roleIntent?: string;
  },
) {
  const session = await getSessionOrThrow(sessionId);
  const now = new Date();

  const updated = await prisma.diagnosisSession.update({
    where: { id: session.id },
    data: {
      targetRole: input.targetRole,
      timeline: input.timeline,
      currentStatus: input.currentStatus,
      consentAck: true,
      consentAt: now,
      policyVersion: input.policyVersion,
      roleIntent: input.roleIntent ?? session.roleIntent,
      status: DiagnosisSessionStatus.INTENT_SAVED,
      currentStep: DiagnosisStep.STEP_2,
    },
  });

  await upsertSessionJourney({
    sessionId: updated.id,
    currentFlow: "diagnosis",
    currentStep: "step_2",
    resumePayload: {
      diagnosisSessionId: updated.id,
      targetRole: updated.targetRole,
    },
  });

  await publishEvent({
    eventName: "diagnosis.intent_saved",
    source: "api",
    idempotencyKey: `diagnosis.intent_saved:${updated.id}:${now.toISOString()}`,
    payload: { diagnosisSessionId: updated.id },
  });

  return { saved: true, nextStep: "step_2" };
}

export async function registerResumeAsset(
  sessionId: string,
  input: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksum?: string;
  },
) {
  const session = await getSessionOrThrow(sessionId);
  const validation = validateResumeUpload({
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
  });
  if (!validation.ok) {
    throw new ApiError({
      status: 400,
      code: validation.code ?? "INVALID_RESUME",
      message: validation.message ?? "Invalid resume upload",
      retryable: true,
    });
  }

  const asset = await prisma.resumeAsset.create({
    data: {
      sessionId: session.id,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      checksum: input.checksum,
      storagePath: `local-stub://${session.id}/${input.fileName}`,
      status: ResumeAssetStatus.VALIDATED,
    },
  });

  const updated = await prisma.diagnosisSession.update({
    where: { id: session.id },
    data: {
      status: DiagnosisSessionStatus.INPUT_READY,
      currentStep: DiagnosisStep.STEP_2,
    },
  });

  await publishEvent({
    eventName: "resume.upload_succeeded",
    source: "api",
    idempotencyKey: `resume.upload_succeeded:${asset.id}`,
    payload: { diagnosisSessionId: session.id, resumeAssetId: asset.id },
  });

  return {
    resumeAssetId: asset.id,
    validationStatus: "validated",
    nextStep: nextStepForStatus(updated.status),
  };
}

export async function saveJdInput(
  sessionId: string,
  input: { jdText?: string; jdUrl?: string; targetRole: string },
) {
  const session = await getSessionOrThrow(sessionId);

  await prisma.jdInput.upsert({
    where: { sessionId: session.id },
    update: {
      jdText: input.jdText,
      jdUrl: input.jdUrl,
      targetRole: input.targetRole,
    },
    create: {
      sessionId: session.id,
      jdText: input.jdText,
      jdUrl: input.jdUrl,
      targetRole: input.targetRole,
    },
  });

  const updated = await prisma.diagnosisSession.update({
    where: { id: session.id },
    data: {
      targetRole: input.targetRole,
      status: DiagnosisSessionStatus.INPUT_READY,
      currentStep: DiagnosisStep.STEP_2,
    },
  });

  await publishEvent({
    eventName: "diagnosis.jd_saved",
    source: "api",
    idempotencyKey: `diagnosis.jd_saved:${session.id}`,
    payload: { diagnosisSessionId: session.id },
  });

  return { saved: true, nextStep: nextStepForStatus(updated.status) };
}

export async function requestAnalysis(sessionId: string, runReason?: string) {
  const session = await getSessionOrThrow(sessionId);
  if (!session.consentAck) {
    throw new ApiError({
      status: 400,
      code: "CONSENT_REQUIRED",
      message: "Consent is required before analysis",
      retryable: false,
    });
  }

  const resumeCount = await prisma.resumeAsset.count({
    where: { sessionId: session.id, status: ResumeAssetStatus.VALIDATED },
  });
  if (resumeCount === 0) {
    throw new ApiError({
      status: 400,
      code: "RESUME_REQUIRED",
      message: "A validated resume upload is required before analysis",
      retryable: false,
    });
  }

  const run = await prisma.analysisRun.create({
    data: {
      sessionId: session.id,
      status: "QUEUED",
    },
  });

  await prisma.diagnosisSession.update({
    where: { id: session.id },
    data: {
      status: DiagnosisSessionStatus.ANALYZING,
      currentStep: DiagnosisStep.STEP_3,
    },
  });

  await upsertSessionJourney({
    sessionId: session.id,
    currentFlow: "diagnosis",
    currentStep: "step_3",
    resumePayload: {
      diagnosisSessionId: session.id,
      analysisRunId: run.id,
    },
  });

  await publishEvent({
    eventName: "diagnosis.analysis_requested",
    source: "api",
    idempotencyKey: `diagnosis.analysis_requested:${run.id}`,
    payload: {
      diagnosisSessionId: session.id,
      analysisRunId: run.id,
      runReason: runReason ?? null,
    },
  });

  scheduleAnalysisRun(run.id);

  return {
    analysisRunId: run.id,
    status: "queued",
  };
}

export async function getAnalysisRunStatus(runId: string) {
  const run = await prisma.analysisRun.findUnique({ where: { id: runId } });
  if (!run) {
    throw new ApiError({
      status: 404,
      code: "ANALYSIS_RUN_NOT_FOUND",
      message: "Analysis run not found",
    });
  }

  return {
    status: run.status.toLowerCase(),
    stage: run.stage?.toLowerCase() ?? null,
    progressPct: run.progressPct,
    errorMessage: run.errorMessage,
  };
}

export async function getAnalysisResult(runId: string) {
  const run = await prisma.analysisRun.findUnique({
    where: { id: runId },
    include: { gapInsight: true, recommendation: true, session: true },
  });
  if (!run) {
    throw new ApiError({
      status: 404,
      code: "ANALYSIS_RUN_NOT_FOUND",
      message: "Analysis run not found",
    });
  }
  if (run.status !== "COMPLETED" || !run.gapInsight || !run.recommendation) {
    throw new ApiError({
      status: 409,
      code: "ANALYSIS_NOT_READY",
      message: "Analysis is not complete yet",
      retryable: true,
    });
  }

  const strengths = run.gapInsight.strengths as string[];
  const gaps = run.gapInsight.gaps as string[];
  const primaryAction = run.recommendation.primaryAction as PrimaryAction;
  const rationale = run.recommendation.rationale as Array<{ label: string; detail: string }>;

  return enrichAnalysisPayload({
    targetRole: run.session.targetRole,
    readinessScore: run.gapInsight.readinessScore,
    confidence: run.gapInsight.confidence,
    strengths,
    gaps,
    primaryAction,
    rationale,
  });
}
