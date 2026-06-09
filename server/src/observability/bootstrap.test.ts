import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockInitSentry, mockCaptureException, mockLogInfo, mockLogError } = vi.hoisted(() => ({
  mockInitSentry: vi.fn(),
  mockCaptureException: vi.fn(),
  mockLogInfo: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock("./sentry.js", () => ({
  initSentry: mockInitSentry,
  captureException: mockCaptureException,
}));

vi.mock("../runtime/logger.js", () => ({
  logInfo: mockLogInfo,
  logError: mockLogError,
}));

describe("observability bootstrap", () => {
  beforeEach(() => {
    mockInitSentry.mockReset();
    mockCaptureException.mockReset();
    mockLogInfo.mockReset();
    mockLogError.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers handlers and logs non-Error unhandled rejections safely", async () => {
    const onSpy = vi.spyOn(process, "on").mockImplementation(() => process);
    const { initObservability } = await import("./bootstrap.js");
    initObservability("api");

    expect(mockInitSentry).toHaveBeenCalledWith("api");
    const rejectionRegistration = onSpy.mock.calls.find(
      (call) => call[0] === "unhandledRejection",
    );
    expect(rejectionRegistration).toBeDefined();

    const rejectionHandler = rejectionRegistration?.[1] as (reason: unknown) => void;
    rejectionHandler("network-hiccup");

    expect(mockCaptureException).toHaveBeenCalledWith("network-hiccup", {
      role: "api",
      crashType: "unhandledRejection",
    });
    expect(mockLogError).toHaveBeenCalledWith("Unhandled rejection", {
      role: "api",
      component: "observability",
      event: "unhandled_rejection",
      reason: "network-hiccup",
    });
    expect(mockLogInfo).toHaveBeenCalledWith("Observability bootstrap complete", {
      role: "api",
      component: "observability",
      event: "bootstrap_complete",
    });
  });

  it("captures uncaught exceptions with structured crash metadata", async () => {
    const onSpy = vi.spyOn(process, "on").mockImplementation(() => process);
    const { initObservability } = await import("./bootstrap.js");
    initObservability("worker");

    const uncaughtRegistration = onSpy.mock.calls.find((call) => call[0] === "uncaughtException");
    expect(uncaughtRegistration).toBeDefined();

    const uncaughtHandler = uncaughtRegistration?.[1] as (error: Error) => void;
    uncaughtHandler(new Error("worker boom"));

    expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error), {
      role: "worker",
      crashType: "uncaughtException",
    });
    expect(mockLogError).toHaveBeenCalledWith("Uncaught exception", {
      role: "worker",
      component: "observability",
      event: "uncaught_exception",
      error: "worker boom",
    });
  });
});
