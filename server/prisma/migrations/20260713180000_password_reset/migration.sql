-- Password reset tokens for forgot-password flow
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "users_password_reset_token_key"
  ON "users"("password_reset_token");
