import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockPublishEvent,
  mockEventFindUniqueOrThrow,
  mockJobFindUniqueOrThrow,
  mockPrismaDisconnect,
} = vi.hoisted(() => ({
  mockPublishEvent: vi.fn(),
  mockEventFindUniqueOrThrow: vi.fn(),
  mockJobFindUniqueOrThrow: vi.fn(),
  mockPrismaDisconnect: vi.fn(),
}));

vi.mock("./publisher.js", () => ({
  publishEvent: mockPublishEvent,
}));

vi.mock("../db/client.js", () => ({
  prisma: {
    eventLog: {
      findUniqueOrThrow: mockEventFindUniqueOrThrow,
    },
    jobRun: {
      findUniqueOrThrow: mockJobFindUniqueOrThrow,
    },
    $disconnect: mockPrismaDisconnect,
  },
}));

describe("synthetic event flow script", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    process.exitCode = 0;
    mockPublishEvent.mockReset();
    mockEventFindUniqueOrThrow.mockReset();
    mockJobFindUniqueOrThrow.mockReset();
    mockPrismaDisconnect.mockReset();
  });

  it("publishes synthetic checkout event, reads persisted records, and disconnects prisma", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    mockPublishEvent.mockResolvedValue({
      eventId: "evt-1",
      jobId: "job-1",
      queue: "q_critical",
      eventName: "checkout.completed",
      idempotencyKey: "synthetic-checkout-1700000000000",
    });
    mockEventFindUniqueOrThrow.mockResolvedValue({
      id: "evt-1",
      eventName: "checkout.completed",
      status: "dispatched",
    });
    mockJobFindUniqueOrThrow.mockResolvedValue({
      id: "job-1",
      queue: "q_critical",
      status: "queued",
      runAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    mockPrismaDisconnect.mockResolvedValue(undefined);

    await import("../../scripts/synthetic-event-flow.ts");
    await vi.waitFor(() => expect(mockPublishEvent).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(mockPrismaDisconnect).toHaveBeenCalledTimes(1));

    expect(mockPublishEvent).toHaveBeenCalledWith({
      eventName: "checkout.completed",
      source: "synthetic-flow",
      idempotencyKey: "synthetic-checkout-1700000000000",
      payload: {
        orderNumber: "SYN-1700000000000",
        currency: "USD",
        totalAmount: 100,
      },
    });
    expect(mockEventFindUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: "evt-1" },
    });
    expect(mockJobFindUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: "job-1" },
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
  });

  it("sets process exit code on publish failure and still disconnects prisma", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);

    mockPublishEvent.mockRejectedValue(new Error("publish failed"));
    mockPrismaDisconnect.mockResolvedValue(undefined);

    await import("../../scripts/synthetic-event-flow.ts");
    await vi.waitFor(() => expect(errorSpy).toHaveBeenCalled());
    await vi.waitFor(() => expect(mockPrismaDisconnect).toHaveBeenCalledTimes(1));

    expect(process.exitCode).toBe(1);
    expect(mockEventFindUniqueOrThrow).not.toHaveBeenCalled();
    expect(mockJobFindUniqueOrThrow).not.toHaveBeenCalled();
  });
});
