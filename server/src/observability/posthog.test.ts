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

  it("accepts commerce events that match product contracts", async () => {
    const result = await captureProductEvent({
      distinctId: "guest-session-1",
      event: "cart_updated",
      properties: {
        cart_id: "00000000-0000-4000-8000-000000000010",
        line_count: 1,
        guest: true,
        commerce_journey_origin: "catalog_services",
      },
    });
    expect(result).toBe(false);
  });

  it("rejects checkout_started with invalid properties", async () => {
    const result = await captureProductEvent({
      distinctId: "user_1",
      event: "checkout_started",
      properties: {
        variant: "standard",
        currency: "USD",
      },
    });
    expect(result).toBe(false);
  });
});
