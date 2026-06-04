import { beforeEach, describe, expect, it } from "vitest";
import { resetEnvCache } from "../config/env.js";
import { captureProductEvent, resetPosthogClientForTests } from "./posthog.js";

describe("posthog wrapper", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mybmadproj";
    process.env.JWT_SECRET = "test-jwt-secret-must-be-32-chars-min!!";
    process.env.POSTHOG_API_KEY = "";
    resetEnvCache();
    resetPosthogClientForTests();
  });

  it("rejects malformed product events", async () => {
    const result = await captureProductEvent({
      distinctId: "",
      event: "",
      properties: {},
    });
    expect(result).toBe(false);
  });

  it("skips event emission when api key is missing", async () => {
    const result = await captureProductEvent({
      distinctId: "user_1",
      event: "synthetic_event",
      properties: { source: "test" },
    });
    expect(result).toBe(false);
  });
});
