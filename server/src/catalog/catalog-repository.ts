import { Decimal } from "@prisma/client/runtime/library";
import type {
  DeliveryMode,
  ExamAccessPolicy,
  Offering,
  OfferingCategory,
  OfferingKind,
  OfferingSchedule,
  Prisma,
} from "@prisma/client";
import { prisma } from "../db/client.js";
import {
  listStubOfferings,
  OFFERING_STUB_CATALOG,
  isPublicCatalogOffering,
  PUBLIC_CATALOG_HIDDEN_CODES,
  resolveOfferingCode,
} from "./catalog-seed-data.js";
import type { OfferingCategory as ApiOfferingCategory, OfferingMeta } from "./offerings.js";

type OfferingWithSchedules = Offering & {
  schedules: OfferingSchedule[];
};

export type CreateOfferingInput = {
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
  upcomingBatchId?: string | null;
  enabled?: boolean;
};

export type UpdateOfferingInput = Partial<
  Omit<CreateOfferingInput, "code">
>;

export type ScheduleMeta = {
  id: string;
  refCode: string;
  label: string | null;
  startsAt: string | null;
  enabled: boolean;
};

export type CreateScheduleInput = {
  refCode: string;
  label?: string | null;
  startsAt?: string | null;
  enabled?: boolean;
};

export type UpdateScheduleInput = {
  refCode?: string;
  label?: string | null;
  startsAt?: string | null;
  enabled?: boolean;
};

export type CatalogMutationError = {
  code:
    | "ACTIVE_SCHEDULE_REQUIRED"
    | "SCHEDULE_NOT_FOUND"
    | "OFFERING_NOT_FOUND"
    | "SCHEDULE_REF_EXISTS";
  message: string;
};

export type SetOfferingEnabledResult =
  | { ok: true; offering: OfferingMeta }
  | { ok: false; error: CatalogMutationError };

export type SetScheduleEnabledResult =
  | { ok: true; schedule: ScheduleMeta }
  | { ok: false; error: CatalogMutationError };

function mapScheduleToMeta(row: OfferingSchedule): ScheduleMeta {
  return {
    id: row.id,
    refCode: row.refCode,
    label: row.label,
    startsAt: row.startsAt?.toISOString() ?? null,
    enabled: row.enabled,
  };
}

function countActiveSchedules(schedules: OfferingSchedule[]): number {
  return schedules.filter((s) => s.enabled && !s.deletedAt).length;
}

async function assertOfferingCanEnable(
  offering: Offering,
  schedules: OfferingSchedule[],
): Promise<CatalogMutationError | null> {
  if (!offering.scheduleBound) return null;
  if (countActiveSchedules(schedules) > 0) return null;
  return {
    code: "ACTIVE_SCHEDULE_REQUIRED",
    message:
      "Schedule-bound offerings require at least one active schedule before they can be enabled",
  };
}

function parseRoleTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string");
}

function primaryScheduleRef(schedules: OfferingSchedule[]): string | undefined {
  const active = schedules.filter((s) => s.enabled && !s.deletedAt);
  return active[0]?.refCode;
}

export function mapOfferingToMeta(row: OfferingWithSchedules): OfferingMeta {
  return {
    code: row.code,
    title: row.title,
    kind: row.kind,
    category: row.category as ApiOfferingCategory,
    scheduleBound: row.scheduleBound,
    examAccess: row.examAccess,
    safeOrgPaymentEligible: row.safeOrgPaymentEligible,
    defaultUnitPrice: row.defaultUnitPrice.toFixed(2),
    currency: row.currency,
    roleTags: parseRoleTags(row.roleTags),
    certBody: row.certBody ?? undefined,
    deliveryMode: row.deliveryMode,
    upcomingBatchId: primaryScheduleRef(row.schedules),
  };
}

function stubFallback(): OfferingMeta[] {
  return listStubOfferings();
}

function usesCatalogDatabase(): boolean {
  if (process.env.CATALOG_USE_DB === "false") return false;
  if (process.env.CATALOG_USE_DB === "true") return true;
  return process.env.NODE_ENV !== "test";
}

const DEV_CATALOG_CACHE_MS = 30_000;
/** Fail open to stub catalog when Postgres/Prisma hangs (common on remote/dev DB stalls). */
const CATALOG_DB_TIMEOUT_MS = Number(process.env.CATALOG_DB_TIMEOUT_MS ?? 2_500);
let devCatalogCache: { at: number; rows: OfferingMeta[] } | null = null;

async function withCatalogDbTimeout<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Catalog DB timeout after ${CATALOG_DB_TIMEOUT_MS}ms`)),
          CATALOG_DB_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function queryPublishedOfferings(): Promise<OfferingMeta[] | null> {
  if (!usesCatalogDatabase()) {
    return null;
  }
  if (
    process.env.NODE_ENV === "development" &&
    devCatalogCache &&
    Date.now() - devCatalogCache.at < DEV_CATALOG_CACHE_MS
  ) {
    return devCatalogCache.rows;
  }
  try {
    const rows = await withCatalogDbTimeout(
      prisma.offering.findMany({
        where: { enabled: true, deletedAt: null },
        include: {
          schedules: {
            where: { enabled: true, deletedAt: null },
            orderBy: { startsAt: "asc" },
          },
        },
        orderBy: { title: "asc" },
      }),
    );
    if (rows.length === 0) return null;
    const mapped = rows.map(mapOfferingToMeta);
    if (process.env.NODE_ENV === "development") {
      devCatalogCache = { at: Date.now(), rows: mapped };
    }
    return mapped;
  } catch {
    return null;
  }
}

function enrichOfferingFromStub(meta: OfferingMeta): OfferingMeta {
  const stub = OFFERING_STUB_CATALOG[meta.code];
  if (!stub?.summary) return meta;
  return {
    ...meta,
    title: stub.title,
    defaultUnitPrice: stub.defaultUnitPrice,
    regionalUnitPrices: stub.regionalUnitPrices,
    roleTags: stub.roleTags,
    slug: stub.slug,
    certificationName: stub.certificationName,
    summary: stub.summary,
    durationHours: stub.durationHours,
    durationLabel: stub.durationLabel,
    scheduleLabel: stub.scheduleLabel,
    cohortSchedules: stub.cohortSchedules,
    includes: stub.includes,
    learningOutcomes: stub.learningOutcomes,
    upcomingBatchId: stub.upcomingBatchId ?? meta.upcomingBatchId,
  };
}

export async function listOfferingsFromCatalog(): Promise<OfferingMeta[]> {
  const fromDb = await queryPublishedOfferings();
  const base = fromDb ?? stubFallback();
  return base
    .map(enrichOfferingFromStub)
    .filter((o) => isPublicCatalogOffering(o.code));
}

export async function listOfferingsByCategoryFromCatalog(
  category: ApiOfferingCategory,
): Promise<OfferingMeta[]> {
  const all = await listOfferingsFromCatalog();
  return all.filter((o) => o.category === category);
}

export async function getOfferingFromCatalog(
  code: string,
): Promise<OfferingMeta | undefined> {
  const resolved = resolveOfferingCode(code);
  if (!isPublicCatalogOffering(resolved)) {
    return undefined;
  }
  const stub = OFFERING_STUB_CATALOG[resolved];
  // Prefer stub when it carries live-site enrichment (avoids stale DB titles/prices).
  if (stub?.summary) {
    return stub;
  }
  if (usesCatalogDatabase()) {
    try {
      const row = await withCatalogDbTimeout(
        prisma.offering.findFirst({
          where: { code: resolved, enabled: true, deletedAt: null },
          include: {
            schedules: {
              where: { enabled: true, deletedAt: null },
              orderBy: { startsAt: "asc" },
            },
          },
        }),
      );
      if (row) return mapOfferingToMeta(row);
    } catch {
      /* fall through to stub */
    }
  }
  return stub;
}

export async function getOfferingByCodeAdmin(
  code: string,
): Promise<OfferingMeta | null> {
  const resolved = resolveOfferingCode(code);
  if (!usesCatalogDatabase()) {
    return OFFERING_STUB_CATALOG[resolved] ?? null;
  }
  try {
    const row = await prisma.offering.findFirst({
      where: { code: resolved, deletedAt: null },
      include: {
        schedules: {
          where: { deletedAt: null },
          orderBy: { startsAt: "asc" },
        },
      },
    });
    return row ? mapOfferingToMeta(row) : null;
  } catch {
    return null;
  }
}

async function upsertSchedule(
  offeringId: string,
  refCode: string | null | undefined,
  tx: Prisma.TransactionClient,
) {
  if (!refCode?.trim()) return;

  await tx.offeringSchedule.upsert({
    where: {
      offeringId_refCode: { offeringId, refCode: refCode.trim() },
    },
    update: { enabled: true, deletedAt: null },
    create: {
      offeringId,
      refCode: refCode.trim(),
      enabled: true,
    },
  });
}

export async function createOfferingInCatalog(
  input: CreateOfferingInput,
): Promise<OfferingMeta> {
  const row = await prisma.$transaction(async (tx) => {
    const offering = await tx.offering.create({
      data: {
        code: input.code,
        title: input.title,
        kind: input.kind,
        category: input.category,
        scheduleBound: input.scheduleBound,
        examAccess: input.examAccess,
        safeOrgPaymentEligible: input.safeOrgPaymentEligible ?? false,
        defaultUnitPrice: new Decimal(input.defaultUnitPrice),
        currency: input.currency ?? "USD",
        roleTags: input.roleTags,
        certBody: input.certBody ?? null,
        deliveryMode: input.deliveryMode,
        enabled: input.enabled ?? true,
      },
      include: { schedules: true },
    });

    await upsertSchedule(offering.id, input.upcomingBatchId, tx);

    return tx.offering.findUniqueOrThrow({
      where: { id: offering.id },
      include: {
        schedules: {
          where: { deletedAt: null },
          orderBy: { startsAt: "asc" },
        },
      },
    });
  });

  return mapOfferingToMeta(row);
}

export async function updateOfferingInCatalog(
  code: string,
  input: UpdateOfferingInput,
): Promise<OfferingMeta | null> {
  const existing = await prisma.offering.findFirst({
    where: { code, deletedAt: null },
  });
  if (!existing) return null;

  const row = await prisma.$transaction(async (tx) => {
    await tx.offering.update({
      where: { id: existing.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.kind !== undefined ? { kind: input.kind } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.scheduleBound !== undefined
          ? { scheduleBound: input.scheduleBound }
          : {}),
        ...(input.examAccess !== undefined ? { examAccess: input.examAccess } : {}),
        ...(input.safeOrgPaymentEligible !== undefined
          ? { safeOrgPaymentEligible: input.safeOrgPaymentEligible }
          : {}),
        ...(input.defaultUnitPrice !== undefined
          ? { defaultUnitPrice: new Decimal(input.defaultUnitPrice) }
          : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.roleTags !== undefined ? { roleTags: input.roleTags } : {}),
        ...(input.certBody !== undefined ? { certBody: input.certBody } : {}),
        ...(input.deliveryMode !== undefined
          ? { deliveryMode: input.deliveryMode }
          : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      },
    });

    if (input.upcomingBatchId !== undefined) {
      await upsertSchedule(existing.id, input.upcomingBatchId, tx);
    }

    return tx.offering.findUniqueOrThrow({
      where: { id: existing.id },
      include: {
        schedules: {
          where: { deletedAt: null },
          orderBy: { startsAt: "asc" },
        },
      },
    });
  });

  return mapOfferingToMeta(row);
}

export async function setOfferingEnabledInCatalog(
  code: string,
  enabled: boolean,
): Promise<SetOfferingEnabledResult> {
  const existing = await prisma.offering.findFirst({
    where: { code, deletedAt: null },
    include: {
      schedules: {
        where: { deletedAt: null },
        orderBy: { startsAt: "asc" },
      },
    },
  });
  if (!existing) {
    return {
      ok: false,
      error: {
        code: "OFFERING_NOT_FOUND",
        message: `Offering ${code} not found`,
      },
    };
  }

  if (enabled) {
    const gateError = await assertOfferingCanEnable(existing, existing.schedules);
    if (gateError) {
      return { ok: false, error: gateError };
    }
  }

  const row = await prisma.offering.update({
    where: { id: existing.id },
    data: { enabled },
    include: {
      schedules: {
        where: { deletedAt: null },
        orderBy: { startsAt: "asc" },
      },
    },
  });

  return { ok: true, offering: mapOfferingToMeta(row) };
}

export async function listSchedulesForOfferingAdmin(
  code: string,
): Promise<{ schedules: ScheduleMeta[] } | CatalogMutationError> {
  const offering = await prisma.offering.findFirst({
    where: { code, deletedAt: null },
    include: {
      schedules: {
        where: { deletedAt: null },
        orderBy: { startsAt: "asc" },
      },
    },
  });
  if (!offering) {
    return {
      code: "OFFERING_NOT_FOUND",
      message: `Offering ${code} not found`,
    };
  }
  return { schedules: offering.schedules.map(mapScheduleToMeta) };
}

export async function createScheduleForOffering(
  code: string,
  input: CreateScheduleInput,
): Promise<
  | { ok: true; schedule: ScheduleMeta }
  | { ok: false; error: CatalogMutationError }
> {
  const offering = await prisma.offering.findFirst({
    where: { code, deletedAt: null },
  });
  if (!offering) {
    return {
      ok: false,
      error: {
        code: "OFFERING_NOT_FOUND",
        message: `Offering ${code} not found`,
      },
    };
  }

  const refCode = input.refCode.trim();
  const existingRef = await prisma.offeringSchedule.findFirst({
    where: { offeringId: offering.id, refCode, deletedAt: null },
  });
  if (existingRef) {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_REF_EXISTS",
        message: `Schedule ref ${refCode} already exists for offering ${code}`,
      },
    };
  }

  const row = await prisma.offeringSchedule.create({
    data: {
      offeringId: offering.id,
      refCode,
      label: input.label ?? null,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      enabled: input.enabled ?? true,
    },
  });

  return { ok: true, schedule: mapScheduleToMeta(row) };
}

export async function updateScheduleInCatalog(
  id: string,
  input: UpdateScheduleInput,
): Promise<
  | { ok: true; schedule: ScheduleMeta }
  | { ok: false; error: CatalogMutationError }
> {
  const existing = await prisma.offeringSchedule.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_NOT_FOUND",
        message: `Schedule ${id} not found`,
      },
    };
  }

  const row = await prisma.offeringSchedule.update({
    where: { id },
    data: {
      ...(input.refCode !== undefined ? { refCode: input.refCode.trim() } : {}),
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.startsAt !== undefined
        ? { startsAt: input.startsAt ? new Date(input.startsAt) : null }
        : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
    },
  });

  return { ok: true, schedule: mapScheduleToMeta(row) };
}

export async function setScheduleEnabledInCatalog(
  id: string,
  enabled: boolean,
): Promise<SetScheduleEnabledResult> {
  const existing = await prisma.offeringSchedule.findFirst({
    where: { id, deletedAt: null },
    include: {
      offering: {
        include: {
          schedules: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });
  if (!existing) {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_NOT_FOUND",
        message: `Schedule ${id} not found`,
      },
    };
  }

  if (!enabled && existing.enabled) {
    const remainingActive = existing.offering.schedules.filter(
      (s) => s.id !== id && s.enabled && !s.deletedAt,
    );
    if (
      existing.offering.enabled &&
      existing.offering.scheduleBound &&
      remainingActive.length === 0
    ) {
      return {
        ok: false,
        error: {
          code: "ACTIVE_SCHEDULE_REQUIRED",
          message:
            "Cannot disable the last active schedule on an enabled schedule-bound offering",
        },
      };
    }
  }

  const row = await prisma.offeringSchedule.update({
    where: { id },
    data: { enabled },
  });

  return { ok: true, schedule: mapScheduleToMeta(row) };
}

export async function upsertOfferingFromImport(
  input: CreateOfferingInput,
): Promise<{ created: boolean; offering: OfferingMeta }> {
  const existing = await prisma.offering.findFirst({
    where: { code: input.code, deletedAt: null },
  });

  if (existing) {
    const updated = await updateOfferingInCatalog(input.code, {
      title: input.title,
      kind: input.kind,
      category: input.category,
      scheduleBound: input.scheduleBound,
      examAccess: input.examAccess,
      safeOrgPaymentEligible: input.safeOrgPaymentEligible,
      defaultUnitPrice: input.defaultUnitPrice,
      currency: input.currency,
      roleTags: input.roleTags,
      certBody: input.certBody,
      deliveryMode: input.deliveryMode,
      upcomingBatchId: input.upcomingBatchId,
    });
    if (!updated) {
      throw new Error(`Failed to update offering ${input.code}`);
    }
    return { created: false, offering: updated };
  }

  const created = await createOfferingInCatalog(input);
  return { created: true, offering: created };
}

export async function seedCatalogOfferingsIfEmpty(): Promise<number> {
  // Soft-hide retired SKUs still present from prior seeds (no migration required).
  if (PUBLIC_CATALOG_HIDDEN_CODES.size > 0) {
    await prisma.offering.updateMany({
      where: {
        code: { in: [...PUBLIC_CATALOG_HIDDEN_CODES] },
        deletedAt: null,
        enabled: true,
      },
      data: { enabled: false },
    });
  }

  let seeded = 0;
  for (const stub of listStubOfferings()) {
    try {
      const existing = await prisma.offering.findFirst({
        where: { code: stub.code, deletedAt: null },
      });
      if (existing) {
        if (existing.title !== stub.title) {
          await prisma.offering.update({
            where: { id: existing.id },
            data: { title: stub.title },
          });
        }
        continue;
      }

      await createOfferingInCatalog({
        code: stub.code,
        title: stub.title,
        kind: stub.kind as OfferingKind,
        category: stub.category as OfferingCategory,
        scheduleBound: stub.scheduleBound,
        examAccess: stub.examAccess as ExamAccessPolicy,
        safeOrgPaymentEligible: stub.safeOrgPaymentEligible,
        defaultUnitPrice: stub.defaultUnitPrice,
        currency: stub.currency,
        roleTags: stub.roleTags,
        certBody: stub.certBody ?? null,
        deliveryMode: stub.deliveryMode as DeliveryMode,
        upcomingBatchId: stub.upcomingBatchId ?? null,
        enabled: true,
      });
      seeded += 1;
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }
  return seeded;
}
