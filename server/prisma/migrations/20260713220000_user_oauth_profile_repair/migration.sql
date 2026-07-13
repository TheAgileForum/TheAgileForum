-- Repair: ensure OAuth profile columns exist (idempotent for staging DBs that missed 20260713120000)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "picture_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "oauth_subject" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "oauth_profile_url" TEXT;
