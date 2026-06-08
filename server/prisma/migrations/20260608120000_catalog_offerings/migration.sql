-- Catalog SSOT: offerings and schedules (FR-182, FR-161–163)

CREATE TYPE "OfferingKind" AS ENUM ('course', 'exam', 'certification_mock', 'service');
CREATE TYPE "OfferingCategory" AS ENUM ('training', 'certification', 'service');
CREATE TYPE "ExamAccessPolicy" AS ENUM ('free', 'paid', 'preview_only');
CREATE TYPE "DeliveryMode" AS ENUM ('live', 'self_paced');

CREATE TABLE "offerings" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "OfferingKind" NOT NULL,
    "category" "OfferingCategory" NOT NULL,
    "schedule_bound" BOOLEAN NOT NULL,
    "exam_access" "ExamAccessPolicy" NOT NULL,
    "safe_org_payment_eligible" BOOLEAN NOT NULL DEFAULT false,
    "default_unit_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "role_tags" JSONB NOT NULL,
    "cert_body" TEXT,
    "delivery_mode" "DeliveryMode" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offerings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "offerings_code_key" ON "offerings"("code");
CREATE INDEX "offerings_category_enabled_idx" ON "offerings"("category", "enabled");
CREATE INDEX "offerings_enabled_deleted_at_idx" ON "offerings"("enabled", "deleted_at");

CREATE TABLE "offering_schedules" (
    "id" TEXT NOT NULL,
    "offering_id" TEXT NOT NULL,
    "ref_code" TEXT NOT NULL,
    "label" TEXT,
    "starts_at" TIMESTAMP(3),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offering_schedules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "offering_schedules_offering_id_ref_code_key" ON "offering_schedules"("offering_id", "ref_code");
CREATE INDEX "offering_schedules_offering_id_enabled_idx" ON "offering_schedules"("offering_id", "enabled");

ALTER TABLE "offering_schedules" ADD CONSTRAINT "offering_schedules_offering_id_fkey"
    FOREIGN KEY ("offering_id") REFERENCES "offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
