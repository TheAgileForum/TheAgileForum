import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetEnvCache } from "../config/env.js";

const { mockSentryInit, mockSentryCaptureException } = vi.hoisted(() => ({
  mockSentryInit: vi.fn(),
  mockSentryCaptureException: vi.fn(),
}));

vi.mock("@sentry/node", () => ({
  init: mockSentryInit,
  captureException: mockSentryCaptureException,
}));

describe("sentry wrapper", () => {
  beforeEach(async () => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mybmadproj";
    process.env.JWT_SECRET = "test-jwt-secret-must-be-32-chars-min!!";
    process.env.SENTRY_DSN = "";
    resetEnvCache();
    mockSentryInit.mockReset();
    mockSentryCaptureException.mockReset();
    const { resetSentryForTests } = await import("./sentry.js");
    resetSentryForTests();
  });

  it("skips initialization when DSN is missing", async () => {
    const { initSentry } = await import("./sentry.js");
    const enabled = initSentry("scheduler");
    expect(enabled).toBe(false);
    expect(mockSentryInit).not.toHaveBeenCalled();
  });

  it("no-ops capture when sentry is not initialized", async () => {
    const { captureException } = await import("./sentry.js");
    captureException(new Error("boom"), { role: "api" });
    expect(mockSentryCaptureException).not.toHaveBeenCalled();
  });
});
