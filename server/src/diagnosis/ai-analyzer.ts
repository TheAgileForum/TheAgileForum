import { getEnv } from "../config/env.js";
import { openRouterChatCompletion } from "../ai/openrouter-client.js";
import {
  DIAGNOSIS_PROMPT_VERSION,
  parseAiDiagnosisResult,
  type DiagnosisRecommendation,
} from "./ai-diagnosis-schema.js";
import { buildDiagnosisSystemPrompt, buildDiagnosisUserPrompt } from "./ai-prompt.js";

export type AnalysisAuditMeta = {
  provider: "openrouter" | "stub";
  mode: "live" | "stub";
  model: string | null;
  promptVersion: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  latencyMs: number | null;
  usedStubFallback: boolean;
  fallbackReason?: string;
};

export type LiveAnalysisOutcome = {
  recommendation: DiagnosisRecommendation;
  audit: AnalysisAuditMeta;
};

export function shouldUseLiveAi(): boolean {
  const env = getEnv();
  return env.AI_PROVIDER_MODE === "live" && Boolean(env.OPENROUTER_API_KEY?.trim());
}

export async function runLiveDiagnosis(input: {
  targetRole: string | null;
  timeline: string | null;
  currentStatus: string | null;
  resumeText: string;
  jdText: string | null;
}): Promise<LiveAnalysisOutcome> {
  const env = getEnv();
  const result = await openRouterChatCompletion({
    messages: [
      { role: "system", content: buildDiagnosisSystemPrompt() },
      { role: "user", content: buildDiagnosisUserPrompt(input) },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0.2,
    maxTokens: 2048,
  });

  const recommendation = parseAiDiagnosisResult(result.content);

  return {
    recommendation,
    audit: {
      provider: "openrouter",
      mode: "live",
      model: result.model || env.OPENROUTER_MODEL,
      promptVersion: DIAGNOSIS_PROMPT_VERSION,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
      latencyMs: result.latencyMs,
      usedStubFallback: false,
    },
  };
}

export function buildStubAudit(reason?: string): AnalysisAuditMeta {
  return {
    provider: "stub",
    mode: "stub",
    model: null,
    promptVersion: DIAGNOSIS_PROMPT_VERSION,
    promptTokens: null,
    completionTokens: null,
    totalTokens: null,
    latencyMs: null,
    usedStubFallback: Boolean(reason),
    ...(reason ? { fallbackReason: reason } : {}),
  };
}
