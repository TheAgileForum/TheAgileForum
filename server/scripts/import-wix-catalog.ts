/**
 * One-time Wix catalog import (FR-182).
 *
 * Reads a JSON export and upserts offerings via catalog repository patterns.
 * Schedule rows are created or updated by refCode per offering.
 *
 * Usage:
 *   cd server
 *   npx tsx scripts/import-wix-catalog.ts scripts/fixtures/wix-catalog-sample.json
 *
 * Requires DATABASE_URL and CATALOG_USE_DB=true (or non-test NODE_ENV).
 * Offerings are imported disabled by default unless `enabled: true` in JSON.
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  DeliveryMode,
  ExamAccessPolicy,
  OfferingCategory,
  OfferingKind,
} from "@prisma/client";
import {
  createScheduleForOffering,
  setScheduleEnabledInCatalog,
  updateScheduleInCatalog,
  upsertOfferingFromImport,
} from "../src/catalog/catalog-repository.js";
import { prisma } from "../src/db/client.js";

type WixScheduleRow = {
  refCode: string;
  label?: string | null;
  startsAt?: string | null;
  enabled?: boolean;
};

type WixOfferingRow = {
  code: string;
  title: string;
  kind: OfferingKind;
  category: OfferingCategory;
  scheduleBound: boolean;
  examAccess: ExamAccessPolicy;
  safeOrgPaymentEligible?: boolean;
  defaultUnitPrice: string;
  currency?: string;
  roleTags: string[];
  certBody?: string | null;
  deliveryMode: DeliveryMode;
  enabled?: boolean;
  upcomingBatchId?: string | null;
  schedules?: WixScheduleRow[];
};

type WixCatalogExport = {
  offerings: WixOfferingRow[];
};

async function upsertSchedules(
  offeringCode: string,
  schedules: WixScheduleRow[] | undefined,
  primaryRef: string | null | undefined,
) {
  const rows = schedules ?? [];
  if (rows.length === 0 && primaryRef) {
    rows.push({ refCode: primaryRef, enabled: true });
  }

  for (const row of rows) {
    const created = await createScheduleForOffering(offeringCode, {
      refCode: row.refCode,
      label: row.label ?? null,
      startsAt: row.startsAt ?? null,
      enabled: row.enabled ?? true,
    });

    if (created.ok) {
      continue;
    }

    if (created.error.code !== "SCHEDULE_REF_EXISTS") {
      throw new Error(
        `${offeringCode}/${row.refCode}: ${created.error.code} — ${created.error.message}`,
      );
    }

    const existing = await prisma.offeringSchedule.findFirst({
      where: {
        refCode: row.refCode,
        offering: { code: offeringCode, deletedAt: null },
        deletedAt: null,
      },
    });
    if (!existing) {
      throw new Error(`Schedule ref ${row.refCode} exists but could not be loaded`);
    }

    const updated = await updateScheduleInCatalog(existing.id, {
      label: row.label ?? null,
      startsAt: row.startsAt ?? null,
      enabled: row.enabled,
    });
    if (!updated.ok) {
      throw new Error(
        `${offeringCode}/${row.refCode}: ${updated.error.code} — ${updated.error.message}`,
      );
    }

    if (row.enabled === false) {
      const disabled = await setScheduleEnabledInCatalog(existing.id, false);
      if (!disabled.ok) {
        throw new Error(
          `${offeringCode}/${row.refCode}: ${disabled.error.code} — ${disabled.error.message}`,
        );
      }
    }
  }
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: npx tsx scripts/import-wix-catalog.ts <path-to-json>");
    process.exit(1);
  }

  const filePath = resolve(fileArg);
  const raw = readFileSync(filePath, "utf8");
  const payload = JSON.parse(raw) as WixCatalogExport;

  if (!Array.isArray(payload.offerings) || payload.offerings.length === 0) {
    console.error("JSON must contain a non-empty offerings array");
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (const row of payload.offerings) {
    const primaryRef =
      row.upcomingBatchId ?? row.schedules?.find((s) => s.enabled !== false)?.refCode ?? null;

    const result = await upsertOfferingFromImport({
      code: row.code,
      title: row.title,
      kind: row.kind,
      category: row.category,
      scheduleBound: row.scheduleBound,
      examAccess: row.examAccess,
      safeOrgPaymentEligible: row.safeOrgPaymentEligible ?? false,
      defaultUnitPrice: row.defaultUnitPrice,
      currency: row.currency ?? "USD",
      roleTags: row.roleTags,
      certBody: row.certBody ?? null,
      deliveryMode: row.deliveryMode,
      upcomingBatchId: primaryRef,
      enabled: row.enabled ?? false,
    });

    await upsertSchedules(row.code, row.schedules, primaryRef);

    if (result.created) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        file: filePath,
        total: payload.offerings.length,
        created,
        updated,
        codes: payload.offerings.map((o) => o.code),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
