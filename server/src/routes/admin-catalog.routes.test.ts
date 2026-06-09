import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockSetEnabled = vi.fn();
const mockGetAdmin = vi.fn();
const mockListSchedules = vi.fn();
const mockCreateSchedule = vi.fn();
const mockUpdateSchedule = vi.fn();
const mockSetScheduleEnabled = vi.fn();

vi.mock("../middleware/auth.js", () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.auth = {
      userId: "admin-user",
      role: "OPS_ADMIN",
      tenantId: "00000000-0000-4000-8000-000000000001",
      tenantIds: ["00000000-0000-4000-8000-000000000001"],
    };
    next();
  },
  requireRoles: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
    next(),
}));

vi.mock("../catalog/catalog-repository.js", () => ({
  createOfferingInCatalog: (...args: unknown[]) => mockCreate(...args),
  updateOfferingInCatalog: (...args: unknown[]) => mockUpdate(...args),
  setOfferingEnabledInCatalog: (...args: unknown[]) => mockSetEnabled(...args),
  getOfferingByCodeAdmin: (...args: unknown[]) => mockGetAdmin(...args),
  listSchedulesForOfferingAdmin: (...args: unknown[]) => mockListSchedules(...args),
  createScheduleForOffering: (...args: unknown[]) => mockCreateSchedule(...args),
  updateScheduleInCatalog: (...args: unknown[]) => mockUpdateSchedule(...args),
  setScheduleEnabledInCatalog: (...args: unknown[]) => mockSetScheduleEnabled(...args),
}));

import { adminCatalogRouter } from "./admin-catalog.routes.js";

function app() {
  const a = express();
  a.use(express.json());
  a.use((req, _res, next) => {
    req.requestId = "test-req";
    next();
  });
  a.use("/api/v1/admin/catalog", adminCatalogRouter);
  return a;
}

const sampleOffering = {
  code: "new-offering",
  title: "New Offering",
  kind: "course" as const,
  category: "training" as const,
  scheduleBound: true,
  examAccess: "preview_only" as const,
  safeOrgPaymentEligible: false,
  defaultUnitPrice: "199.00",
  currency: "USD",
  roleTags: ["learner"],
  deliveryMode: "live" as const,
  upcomingBatchId: "batch-1",
};

const sampleSchedule = {
  id: "sched-1",
  refCode: "batch-1",
  label: "Batch 1",
  startsAt: "2026-09-01T09:00:00.000Z",
  enabled: true,
};

describe("admin catalog routes (T10.7)", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockSetEnabled.mockReset();
    mockGetAdmin.mockReset();
    mockListSchedules.mockReset();
    mockCreateSchedule.mockReset();
    mockUpdateSchedule.mockReset();
    mockSetScheduleEnabled.mockReset();
  });

  it("creates offering via POST /offerings", async () => {
    mockGetAdmin.mockResolvedValue(null);
    mockCreate.mockResolvedValue(sampleOffering);

    const res = await request(app())
      .post("/api/v1/admin/catalog/offerings")
      .send({
        code: "new-offering",
        title: "New Offering",
        kind: "course",
        category: "training",
        scheduleBound: true,
        examAccess: "preview_only",
        defaultUnitPrice: "199.00",
        roleTags: ["learner"],
        deliveryMode: "live",
        upcomingBatchId: "batch-1",
      });

    expect(res.status).toBe(201);
    expect(res.body.offering.code).toBe("new-offering");
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("returns 422 when creating enabled schedule-bound offering without schedules (FR-182 POST)", async () => {
    mockGetAdmin.mockResolvedValue(null);

    const res = await request(app())
      .post("/api/v1/admin/catalog/offerings")
      .send({
        code: "new-offering",
        title: "New Offering",
        kind: "course",
        category: "training",
        scheduleBound: true,
        enabled: true,
        examAccess: "preview_only",
        defaultUnitPrice: "199.00",
        roleTags: ["learner"],
        deliveryMode: "live",
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("ACTIVE_SCHEDULE_REQUIRED");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 409 when offering code already exists", async () => {
    mockGetAdmin.mockResolvedValue(sampleOffering);

    const res = await request(app())
      .post("/api/v1/admin/catalog/offerings")
      .send({
        code: "new-offering",
        title: "New Offering",
        kind: "course",
        category: "training",
        scheduleBound: true,
        examAccess: "preview_only",
        defaultUnitPrice: "199.00",
        roleTags: ["learner"],
        deliveryMode: "live",
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("OFFERING_CODE_EXISTS");
  });

  it("returns 422 when POST publishes schedule-bound offering without schedules (FR-182)", async () => {
    mockGetAdmin.mockResolvedValue(null);

    const res = await request(app())
      .post("/api/v1/admin/catalog/offerings")
      .send({
        code: "publish-without-schedule",
        title: "Missing Schedule",
        kind: "course",
        category: "training",
        scheduleBound: true,
        examAccess: "preview_only",
        defaultUnitPrice: "199.00",
        roleTags: ["learner"],
        deliveryMode: "live",
        enabled: true,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("ACTIVE_SCHEDULE_REQUIRED");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("allows POST with inline schedule via upcomingBatchId (FR-182)", async () => {
    mockGetAdmin.mockResolvedValue(null);
    mockCreate.mockResolvedValue(sampleOffering);

    const res = await request(app())
      .post("/api/v1/admin/catalog/offerings")
      .send({
        code: "new-offering",
        title: "New Offering",
        kind: "course",
        category: "training",
        scheduleBound: true,
        examAccess: "preview_only",
        defaultUnitPrice: "199.00",
        roleTags: ["learner"],
        deliveryMode: "live",
        enabled: true,
        upcomingBatchId: "batch-1",
      });

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("updates offering via PATCH /offerings/:code", async () => {
    mockUpdate.mockResolvedValue({ ...sampleOffering, title: "Updated Title" });

    const res = await request(app())
      .patch("/api/v1/admin/catalog/offerings/new-offering")
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.offering.title).toBe("Updated Title");
    expect(mockUpdate).toHaveBeenCalledWith("new-offering", { title: "Updated Title" });
  });

  it("returns 404 when updating missing offering", async () => {
    mockUpdate.mockResolvedValue(null);

    const res = await request(app())
      .patch("/api/v1/admin/catalog/offerings/missing")
      .send({ title: "Nope" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("OFFERING_NOT_FOUND");
  });

  it("enables and disables offering via PATCH /offerings/:code/status", async () => {
    mockSetEnabled.mockResolvedValueOnce({
      ok: true,
      offering: { ...sampleOffering, enabled: false },
    });

    const disableRes = await request(app())
      .patch("/api/v1/admin/catalog/offerings/new-offering/status")
      .send({ enabled: false });

    expect(disableRes.status).toBe(200);
    expect(mockSetEnabled).toHaveBeenCalledWith("new-offering", false);

    mockSetEnabled.mockResolvedValueOnce({ ok: true, offering: sampleOffering });

    const enableRes = await request(app())
      .patch("/api/v1/admin/catalog/offerings/new-offering/status")
      .send({ enabled: true });

    expect(enableRes.status).toBe(200);
    expect(mockSetEnabled).toHaveBeenLastCalledWith("new-offering", true);
  });

  it("returns 422 when enabling schedule-bound offering without active schedule (FR-182)", async () => {
    mockSetEnabled.mockResolvedValue({
      ok: false,
      error: {
        code: "ACTIVE_SCHEDULE_REQUIRED",
        message:
          "Schedule-bound offerings require at least one active schedule before they can be enabled",
      },
    });

    const res = await request(app())
      .patch("/api/v1/admin/catalog/offerings/new-offering/status")
      .send({ enabled: true });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("ACTIVE_SCHEDULE_REQUIRED");
  });

  it("lists schedules via GET /offerings/:code/schedules", async () => {
    mockListSchedules.mockResolvedValue({ schedules: [sampleSchedule] });

    const res = await request(app()).get(
      "/api/v1/admin/catalog/offerings/new-offering/schedules",
    );

    expect(res.status).toBe(200);
    expect(res.body.schedules).toHaveLength(1);
    expect(res.body.schedules[0].refCode).toBe("batch-1");
    expect(mockListSchedules).toHaveBeenCalledWith("new-offering");
  });

  it("creates schedule via POST /offerings/:code/schedules", async () => {
    mockCreateSchedule.mockResolvedValue({ ok: true, schedule: sampleSchedule });

    const res = await request(app())
      .post("/api/v1/admin/catalog/offerings/new-offering/schedules")
      .send({
        refCode: "batch-1",
        label: "Batch 1",
        startsAt: "2026-09-01T09:00:00.000Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.schedule.refCode).toBe("batch-1");
    expect(mockCreateSchedule).toHaveBeenCalledWith("new-offering", {
      refCode: "batch-1",
      label: "Batch 1",
      startsAt: "2026-09-01T09:00:00.000Z",
    });
  });

  it("returns 409 when schedule ref already exists", async () => {
    mockCreateSchedule.mockResolvedValue({
      ok: false,
      error: {
        code: "SCHEDULE_REF_EXISTS",
        message: "Schedule ref batch-1 already exists for offering new-offering",
      },
    });

    const res = await request(app())
      .post("/api/v1/admin/catalog/offerings/new-offering/schedules")
      .send({ refCode: "batch-1" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("SCHEDULE_REF_EXISTS");
  });

  it("updates schedule via PATCH /schedules/:id", async () => {
    mockUpdateSchedule.mockResolvedValue({
      ok: true,
      schedule: { ...sampleSchedule, label: "Updated Batch" },
    });

    const res = await request(app())
      .patch("/api/v1/admin/catalog/schedules/sched-1")
      .send({ label: "Updated Batch" });

    expect(res.status).toBe(200);
    expect(res.body.schedule.label).toBe("Updated Batch");
    expect(mockUpdateSchedule).toHaveBeenCalledWith("sched-1", { label: "Updated Batch" });
  });

  it("enables and disables schedule via PATCH /schedules/:id/status", async () => {
    mockSetScheduleEnabled.mockResolvedValueOnce({
      ok: true,
      schedule: { ...sampleSchedule, enabled: false },
    });

    const disableRes = await request(app())
      .patch("/api/v1/admin/catalog/schedules/sched-1/status")
      .send({ enabled: false });

    expect(disableRes.status).toBe(200);
    expect(mockSetScheduleEnabled).toHaveBeenCalledWith("sched-1", false);

    mockSetScheduleEnabled.mockResolvedValueOnce({ ok: true, schedule: sampleSchedule });

    const enableRes = await request(app())
      .patch("/api/v1/admin/catalog/schedules/sched-1/status")
      .send({ enabled: true });

    expect(enableRes.status).toBe(200);
    expect(mockSetScheduleEnabled).toHaveBeenLastCalledWith("sched-1", true);
  });

  it("returns 422 when disabling last active schedule on enabled offering", async () => {
    mockSetScheduleEnabled.mockResolvedValue({
      ok: false,
      error: {
        code: "ACTIVE_SCHEDULE_REQUIRED",
        message:
          "Cannot disable the last active schedule on an enabled schedule-bound offering",
      },
    });

    const res = await request(app())
      .patch("/api/v1/admin/catalog/schedules/sched-1/status")
      .send({ enabled: false });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("ACTIVE_SCHEDULE_REQUIRED");
  });
});
