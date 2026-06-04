-- Story 1.1: email verification and auth provider metadata
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_expires_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "auth_provider" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_verification_token_key"
  ON "users"("email_verification_token");
