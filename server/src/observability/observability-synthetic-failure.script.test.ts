import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockInitObservability,
  mockCaptureProductEvent,
  mockLogInfo,
  mockLogError,
} = vi.hoisted(() => ({
  mockInitObservability: vi.fn(),
  mockCaptureProductEvent: vi.fn(),
  mockLogInfo: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock("./bootstrap.js", () => ({
  initObservability: mockInitObservability,
}));

vi.mock("./posthog.js", () => ({
  captureProductEvent: mockCaptureProductEvent,
}));

vi.mock("../runtime/logger.js", () => ({
  logInfo: mockLogInfo,
  logError: mockLogError,
}));

describe("observability synthetic failure script", () => {
  beforeEach(() => {
    mockInitObservability.mockReset();
    mockCaptureProductEvent.mockReset();
    mockLogInfo.mockReset();
    mockLogError.mockReset();
    mockCaptureProductEvent.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("boots observability, emits synthetic event, and logs expected checkpoints", async () => {
    vi.resetModules();

    await import("../../scripts/observability-synthetic-failure.ts");
    await Promise.resolve();

    expect(mockInitObservability).toHaveBeenCalledWith("api");
    expect(mockCaptureProductEvent).toHaveBeenCalledWith({
      distinctId: "synthetic-observability-run",
      event: "synthetic_observability_check",
      properties: { alertPolicies: 3 },
    });

    expect(mockLogInfo).toHaveBeenCalledWith("Synthetic observability test started", {
      component: "observability",
      event: "synthetic_start",
    });
    expect(mockLogInfo).toHaveBeenCalledWith("Synthetic observability test finished", {
      component: "observability",
      event: "synthetic_complete",
    });
    expect(mockLogError).toHaveBeenCalledWith("Synthetic failure captured", {
      component: "observability",
      event: "synthetic_failure",
      error: "Synthetic failure injection for alert-route validation",
    });
  });
});
