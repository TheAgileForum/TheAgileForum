-- AlterTable
ALTER TABLE "users" ADD COLUMN "display_name" TEXT,
ADD COLUMN "picture_url" TEXT,
ADD COLUMN "oauth_subject" TEXT,
ADD COLUMN "oauth_profile_url" TEXT;
