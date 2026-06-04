import { describe, expect, it, vi, beforeEach } from "vitest";

const mockEventLogUpsert = vi.fn();
const mockEventLogUpdate = vi.fn();
const mockJobRunCreate = vi.fn();

vi.mock("../db/client.js", () => ({
  prisma: {
    eventLog: {
      upsert: mockEventLogUpsert,
      update: mockEventLogUpdate,
    },
    jobRun: {
      create: mockJobRunCreate,
    },
  },
}));

describe("publisher idempotency behavior", () => {
  beforeEach(() => {
    mockEventLogUpsert.mockReset();
    mockEventLogUpdate.mockReset();
    mockJobRunCreate.mockReset();
  });

  it("uses idempotency key in upsert where clause", async () => {
    mockEventLogUpsert.mockResolvedValue({
      id: "evt-1",
      idempotencyKey: "idem-1",
    });
    mockJobRunCreate.mockResolvedValue({ id: "job-1" });
    mockEventLogUpdate.mockResolvedValue({ id: "evt-1" });

    const { publishEvent } = await import("./publisher.js");
    await publishEvent({
      eventName: "checkout.completed",
      source: "unit-test",
      idempotencyKey: "idem-key-1",
      payload: { a: 1 },
    });

    expect(mockEventLogUpsert).toHaveBeenCalledTimes(1);
    const arg = mockEventLogUpsert.mock.calls[0][0];
    expect(arg.where.idempotencyKey).toBe("idem-key-1");
  });

  it("publishes repeated calls with same idempotency key through same upsert key", async () => {
    mockEventLogUpsert
      .mockResolvedValueOnce({ id: "evt-1", idempotencyKey: "idem-repeat" })
      .mockResolvedValueOnce({ id: "evt-1", idempotencyKey: "idem-repeat" });
    mockJobRunCreate
      .mockResolvedValueOnce({ id: "job-1" })
      .mockResolvedValueOnce({ id: "job-2" });
    mockEventLogUpdate.mockResolvedValue({ id: "evt-1" });

    const { publishEvent } = await import("./publisher.js");
    await publishEvent({
      eventName: "checkout.completed",
      source: "unit-test",
      idempotencyKey: "idem-repeat",
      payload: { attempt: 1 },
    });
    await publishEvent({
      eventName: "checkout.completed",
      source: "unit-test",
      idempotencyKey: "idem-repeat",
      payload: { attempt: 2 },
    });

    expect(mockEventLogUpsert).toHaveBeenCalledTimes(2);
    expect(mockEventLogUpsert.mock.calls[0][0].where.idempotencyKey).toBe(
      "idem-repeat",
    );
    expect(mockEventLogUpsert.mock.calls[1][0].where.idempotencyKey).toBe(
      "idem-repeat",
    );
  });

  it("rejects payloads that violate event envelope schema", async () => {
    const { publishEvent } = await import("./publisher.js");

    await expect(
      publishEvent({
        eventName: "checkout.completed",
        source: "unit-test",
        idempotencyKey: "short",
        payload: { attempt: 1 },
      }),
    ).rejects.toThrow();

    expect(mockEventLogUpsert).not.toHaveBeenCalled();
    expect(mockJobRunCreate).not.toHaveBeenCalled();
    expect(mockEventLogUpdate).not.toHaveBeenCalled();
  });
});
