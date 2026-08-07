-- Diagnosis AI Phase 1: resume extracted text + analysis audit metadata

ALTER TABLE "resume_assets" ADD COLUMN IF NOT EXISTS "extracted_text" TEXT;
ALTER TABLE "analysis_runs" ADD COLUMN IF NOT EXISTS "audit_meta" JSONB;
