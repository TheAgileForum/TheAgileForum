-- Sprint 1: evolve diagnosis_sessions and add diagnosis domain tables

CREATE TABLE IF NOT EXISTS "diagnosis_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "tenant_id" TEXT,
    "kind" TEXT,
    "payload" JSONB,
    "preview_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "diagnosis_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "diagnosis_sessions_user_id_created_at_idx"
    ON "diagnosis_sessions"("user_id", "created_at");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'diagnosis_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE "diagnosis_sessions"
      ADD CONSTRAINT "diagnosis_sessions_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TYPE "DiagnosisSessionStatus" AS ENUM ('DRAFT', 'INTENT_SAVED', 'INPUT_READY', 'ANALYZING', 'COMPLETED');
CREATE TYPE "DiagnosisStep" AS ENUM ('STEP_1', 'STEP_2', 'STEP_3', 'STEP_4');
CREATE TYPE "ResumeAssetStatus" AS ENUM ('PENDING', 'VALIDATED', 'FAILED');
CREATE TYPE "AnalysisRunStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'TIMEOUT');
CREATE TYPE "AnalysisStage" AS ENUM ('PARSING', 'MAPPING', 'INSIGHTS');
CREATE TYPE "JourneySubjectType" AS ENUM ('SESSION', 'USER');

ALTER TABLE "diagnosis_sessions" DROP COLUMN IF EXISTS "tenant_id";
ALTER TABLE "diagnosis_sessions" DROP COLUMN IF EXISTS "kind";
ALTER TABLE "diagnosis_sessions" DROP COLUMN IF EXISTS "payload";
ALTER TABLE "diagnosis_sessions" DROP COLUMN IF EXISTS "preview_only";

ALTER TABLE "diagnosis_sessions" ADD COLUMN "status" "DiagnosisSessionStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "diagnosis_sessions" ADD COLUMN "current_step" "DiagnosisStep" NOT NULL DEFAULT 'STEP_1';
ALTER TABLE "diagnosis_sessions" ADD COLUMN "role_intent" TEXT;
ALTER TABLE "diagnosis_sessions" ADD COLUMN "target_role" TEXT;
ALTER TABLE "diagnosis_sessions" ADD COLUMN "timeline" TEXT;
ALTER TABLE "diagnosis_sessions" ADD COLUMN "current_status" TEXT;
ALTER TABLE "diagnosis_sessions" ADD COLUMN "consent_ack" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "diagnosis_sessions" ADD COLUMN "consent_at" TIMESTAMP(3);
ALTER TABLE "diagnosis_sessions" ADD COLUMN "policy_version" TEXT;
ALTER TABLE "diagnosis_sessions" ADD COLUMN "campaign_id" TEXT;

DROP INDEX IF EXISTS "diagnosis_sessions_user_id_created_at_idx";
CREATE INDEX "diagnosis_sessions_user_id_updated_at_idx" ON "diagnosis_sessions"("user_id", "updated_at");

CREATE TABLE "resume_assets" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "storage_path" TEXT NOT NULL,
    "status" "ResumeAssetStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resume_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jd_inputs" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "jd_text" TEXT,
    "jd_url" TEXT,
    "target_role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "jd_inputs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analysis_runs" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "status" "AnalysisRunStatus" NOT NULL DEFAULT 'QUEUED',
    "stage" "AnalysisStage",
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "analysis_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gap_insights" (
    "id" TEXT NOT NULL,
    "analysis_run_id" TEXT NOT NULL,
    "readiness_score" INTEGER NOT NULL,
    "strengths" JSONB NOT NULL,
    "gaps" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gap_insights_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "analysis_run_id" TEXT NOT NULL,
    "primary_action" JSONB NOT NULL,
    "rationale" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "journey_states" (
    "id" TEXT NOT NULL,
    "subject_type" "JourneySubjectType" NOT NULL,
    "subject_id" TEXT NOT NULL,
    "session_id" TEXT,
    "current_flow" TEXT NOT NULL,
    "current_step" TEXT NOT NULL,
    "resume_payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "journey_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "jd_inputs_session_id_key" ON "jd_inputs"("session_id");
CREATE INDEX "resume_assets_session_id_idx" ON "resume_assets"("session_id");
CREATE INDEX "analysis_runs_session_id_created_at_idx" ON "analysis_runs"("session_id", "created_at");
CREATE UNIQUE INDEX "gap_insights_analysis_run_id_key" ON "gap_insights"("analysis_run_id");
CREATE UNIQUE INDEX "recommendations_analysis_run_id_key" ON "recommendations"("analysis_run_id");
CREATE UNIQUE INDEX "journey_states_subject_type_subject_id_key" ON "journey_states"("subject_type", "subject_id");
CREATE INDEX "journey_states_session_id_idx" ON "journey_states"("session_id");

ALTER TABLE "resume_assets" ADD CONSTRAINT "resume_assets_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnosis_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jd_inputs" ADD CONSTRAINT "jd_inputs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnosis_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnosis_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gap_insights" ADD CONSTRAINT "gap_insights_analysis_run_id_fkey" FOREIGN KEY ("analysis_run_id") REFERENCES "analysis_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_analysis_run_id_fkey" FOREIGN KEY ("analysis_run_id") REFERENCES "analysis_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "journey_states" ADD CONSTRAINT "journey_states_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnosis_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
