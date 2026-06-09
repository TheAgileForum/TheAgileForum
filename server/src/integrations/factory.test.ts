import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetEnvCache } from "../config/env.js";
import { createIntegrationAdapters } from "./factory.js";

describe("integration adapter factory", () => {
  beforeEach(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/mybmadproj";
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ?? "test-jwt-secret-must-be-32-chars-min!!";
    resetEnvCache();
  });

  afterEach(() => {
    delete process.env.INTEGRATION_PROVIDER_MODE;
    resetEnvCache();
  });

  it("returns stub adapters by default", async () => {
    delete process.env.INTEGRATION_PROVIDER_MODE;
    const adapters = createIntegrationAdapters();
    expect(adapters.stripe.provider).toBe("stub");
    expect(adapters.email.provider).toBe("stub");
    expect(adapters.telegram.provider).toBe("stub");
    expect(adapters.webinar.provider).toBe("stub");
  });

  it("returns live adapters when mode is live", async () => {
    process.env.INTEGRATION_PROVIDER_MODE = "live";
    const adapters = createIntegrationAdapters();
    expect(adapters.stripe.provider).toBe("live");
    expect(adapters.email.provider).toBe("live");
    expect(adapters.telegram.provider).toBe("live");
    expect(adapters.webinar.provider).toBe("live");
  });
});
