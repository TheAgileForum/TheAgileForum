import { describe, expect, it } from "vitest";
import { baselineAlertPolicies } from "./alerts.js";

describe("baseline alert policies", () => {
  it("includes critical API error-rate policy", () => {
    const apiPolicy = baselineAlertPolicies.find((policy) => policy.metric === "api.error_rate_5m");
    expect(apiPolicy?.severity).toBe("critical");
  });

  it("includes queue and job failure protections", () => {
    const metrics = baselineAlertPolicies.map((policy) => policy.metric);
    expect(metrics).toContain("jobs.queue_lag_seconds");
    expect(metrics).toContain("jobs.failed_count_10m");
  });
});
