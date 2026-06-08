import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { withBodyValidation } from "../middleware/validation.js";
import {
  createOfferingInCatalog,
  createScheduleForOffering,
  getOfferingByCodeAdmin,
  listOfferingsFromCatalog,
  listSchedulesForOfferingAdmin,
  setOfferingEnabledInCatalog,
  setScheduleEnabledInCatalog,
  updateOfferingInCatalog,
  updateScheduleInCatalog,
} from "../catalog/catalog-repository.js";
import { logPrivilegedAction } from "../security/audit.js";

const offeringBodyBase = z.object({
  code: z.string().min(1).optional(),
  title: z.string().min(1),
  kind: z.enum(["course", "exam", "certification_mock", "service"]),
  category: z.enum(["training", "certification", "service"]),
  scheduleBound: z.boolean(),
  examAccess: z.enum(["free", "paid", "preview_only"]),
  safeOrgPaymentEligible: z.boolean().optional(),
  defaultUnitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3).optional(),
  roleTags: z.array(z.string().min(1)).min(1),
  certBody: z.string().min(1).nullable().optional(),
  deliveryMode: z.enum(["live", "self_paced"]),
  upcomingBatchId: z.string().min(1).nullable().optional(),
  enabled: z.boolean().optional(),
});

const inlineScheduleBody = z.object({
  refCode: z.string().min(1),
  label: z.string().min(1).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  enabled: z.boolean().optional(),
});

const createOfferingBody = offeringBodyBase.extend({
  code: z.string().min(1),
  schedules: z.array(inlineScheduleBody).optional(),
});

function hasScheduleForPublish(body: {
  enabled?: boolean;
  scheduleBound: boolean;
  upcomingBatchId?: string | null;
  schedules?: Array<{ refCode: string }>;
}): boolean {
  if (body.enabled === false) return true;
  if (!body.scheduleBound) return true;
  if (body.upcomingBatchId?.trim()) return true;
  if (body.schedules && body.schedules.length > 0) return true;
  return false;
}

const updateOfferingBody = offeringBodyBase.partial().refine(
  (body) => Object.keys(body).length > 0,
  { message: "At least one field is required" },
);

const statusBody = z.object({
  enabled: z.boolean(),
});

const createScheduleBody = z.object({
  refCode: z.string().min(1),
  label: z.string().min(1).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  enabled: z.boolean().optional(),
});

const updateScheduleBody = z
  .object({
    refCode: z.string().min(1).optional(),
    label: z.string().min(1).nullable().optional(),
    startsAt: z.string().datetime().nullable().optional(),
    enabled: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  });

function serializeSchedule(
  schedule: {
    id: string;
    refCode: string;
    label: string | null;
    startsAt: string | null;
    enabled: boolean;
  },
) {
  return {
    id: schedule.id,
    refCode: schedule.refCode,
    label: schedule.label,
    startsAt: schedule.startsAt,
    enabled: schedule.enabled,
  };
}

function serializeAdminOffering(
  offering: NonNullable<Awaited<ReturnType<typeof getOfferingByCodeAdmin>>>,
) {
  return {
    code: offering.code,
    title: offering.title,
    kind: offering.kind,
    category: offering.category,
    scheduleBound: offering.scheduleBound,
    examAccess: offering.examAccess,
    safeOrgPaymentEligible: offering.safeOrgPaymentEligible,
    defaultUnitPrice: offering.defaultUnitPrice,
    currency: offering.currency,
    roleTags: offering.roleTags,
    certBody: offering.certBody,
    deliveryMode: offering.deliveryMode,
    upcomingBatchId: offering.upcomingBatchId,
  };
}

export const adminCatalogRouter = Router();

adminCatalogRouter.use(requireAuth, requireRoles(["OPS_ADMIN"]));

adminCatalogRouter.get("/offerings", async (_req, res) => {
  const offerings = (await listOfferingsFromCatalog()).map(serializeAdminOffering);
  return res.json({ offerings });
});

adminCatalogRouter.post(
  "/offerings",
  withBodyValidation(createOfferingBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof createOfferingBody>;

    const existing = await getOfferingByCodeAdmin(body.code);
    if (existing) {
      return res.status(409).json({
        error: {
          code: "OFFERING_CODE_EXISTS",
          message: `Offering code ${body.code} already exists`,
        },
      });
    }

    if (!hasScheduleForPublish(body)) {
      return res.status(422).json({
        error: {
          code: "ACTIVE_SCHEDULE_REQUIRED",
          message:
            "Schedule-bound offerings require at least one active schedule before they can be enabled",
        },
      });
    }

    const { schedules: inlineSchedules, ...offeringInput } = body;
    const offering = await createOfferingInCatalog(offeringInput);

    if (inlineSchedules?.length) {
      const primaryRef = body.upcomingBatchId?.trim();
      for (const schedule of inlineSchedules) {
        if (primaryRef && schedule.refCode.trim() === primaryRef) {
          continue;
        }
        await createScheduleForOffering(offering.code, schedule);
      }
    }

    logPrivilegedAction({
      action: "admin_catalog_create_offering",
      actorUserId: req.auth!.userId,
      actorRole: req.auth!.role,
      tenantId: req.auth!.tenantId,
      requestId: req.requestId ?? null,
      metadata: { offeringCode: offering.code },
    });

    return res.status(201).json({ offering: serializeAdminOffering(offering) });
  },
);

adminCatalogRouter.patch(
  "/offerings/:code",
  withBodyValidation(updateOfferingBody),
  async (req, res) => {
    const code = req.params.code;
    const body = req.body as z.infer<typeof updateOfferingBody>;

    const offering = await updateOfferingInCatalog(code, body);
    if (!offering) {
      return res.status(404).json({
        error: {
          code: "OFFERING_NOT_FOUND",
          message: `Offering ${code} not found`,
        },
      });
    }

    logPrivilegedAction({
      action: "admin_catalog_update_offering",
      actorUserId: req.auth!.userId,
      actorRole: req.auth!.role,
      tenantId: req.auth!.tenantId,
      requestId: req.requestId ?? null,
      metadata: { offeringCode: offering.code },
    });

    return res.json({ offering: serializeAdminOffering(offering) });
  },
);

adminCatalogRouter.patch(
  "/offerings/:code/status",
  withBodyValidation(statusBody),
  async (req, res) => {
    const code = req.params.code;
    const { enabled } = req.body as z.infer<typeof statusBody>;

    const result = await setOfferingEnabledInCatalog(code, enabled);
    if (!result.ok) {
      const status =
        result.error.code === "ACTIVE_SCHEDULE_REQUIRED" ? 422 : 404;
      return res.status(status).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
    }

    logPrivilegedAction({
      action: enabled
        ? "admin_catalog_enable_offering"
        : "admin_catalog_disable_offering",
      actorUserId: req.auth!.userId,
      actorRole: req.auth!.role,
      tenantId: req.auth!.tenantId,
      requestId: req.requestId ?? null,
      metadata: { offeringCode: result.offering.code, enabled },
    });

    return res.json({ offering: serializeAdminOffering(result.offering) });
  },
);

adminCatalogRouter.get("/offerings/:code/schedules", async (req, res) => {
  const code = req.params.code;
  const result = await listSchedulesForOfferingAdmin(code);
  if ("code" in result) {
    return res.status(404).json({
      error: {
        code: result.code,
        message: result.message,
      },
    });
  }

  return res.json({
    schedules: result.schedules.map(serializeSchedule),
  });
});

adminCatalogRouter.post(
  "/offerings/:code/schedules",
  withBodyValidation(createScheduleBody),
  async (req, res) => {
    const code = req.params.code;
    const body = req.body as z.infer<typeof createScheduleBody>;

    const result = await createScheduleForOffering(code, body);
    if (!result.ok) {
      const status =
        result.error.code === "SCHEDULE_REF_EXISTS"
          ? 409
          : result.error.code === "OFFERING_NOT_FOUND"
            ? 404
            : 400;
      return res.status(status).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
    }

    logPrivilegedAction({
      action: "admin_catalog_create_schedule",
      actorUserId: req.auth!.userId,
      actorRole: req.auth!.role,
      tenantId: req.auth!.tenantId,
      requestId: req.requestId ?? null,
      metadata: { offeringCode: code, scheduleRef: result.schedule.refCode },
    });

    return res
      .status(201)
      .json({ schedule: serializeSchedule(result.schedule) });
  },
);

adminCatalogRouter.patch(
  "/schedules/:id",
  withBodyValidation(updateScheduleBody),
  async (req, res) => {
    const id = req.params.id;
    const body = req.body as z.infer<typeof updateScheduleBody>;

    const result = await updateScheduleInCatalog(id, body);
    if (!result.ok) {
      return res.status(404).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
    }

    logPrivilegedAction({
      action: "admin_catalog_update_schedule",
      actorUserId: req.auth!.userId,
      actorRole: req.auth!.role,
      tenantId: req.auth!.tenantId,
      requestId: req.requestId ?? null,
      metadata: { scheduleId: id, scheduleRef: result.schedule.refCode },
    });

    return res.json({ schedule: serializeSchedule(result.schedule) });
  },
);

adminCatalogRouter.patch(
  "/schedules/:id/status",
  withBodyValidation(statusBody),
  async (req, res) => {
    const id = req.params.id;
    const { enabled } = req.body as z.infer<typeof statusBody>;

    const result = await setScheduleEnabledInCatalog(id, enabled);
    if (!result.ok) {
      const status =
        result.error.code === "ACTIVE_SCHEDULE_REQUIRED" ? 422 : 404;
      return res.status(status).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
    }

    logPrivilegedAction({
      action: enabled
        ? "admin_catalog_enable_schedule"
        : "admin_catalog_disable_schedule",
      actorUserId: req.auth!.userId,
      actorRole: req.auth!.role,
      tenantId: req.auth!.tenantId,
      requestId: req.requestId ?? null,
      metadata: { scheduleId: id, enabled },
    });

    return res.json({ schedule: serializeSchedule(result.schedule) });
  },
);
