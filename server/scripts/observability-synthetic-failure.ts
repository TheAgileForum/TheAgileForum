import "dotenv/config";
import { initObservability } from "../src/observability/bootstrap.js";
import { captureProductEvent } from "../src/observability/posthog.js";
import { baselineAlertPolicies } from "../src/observability/alerts.js";
import { logError, logInfo } from "../src/runtime/logger.js";

async function main() {
  initObservability("api");
  logInfo("Synthetic observability test started", {
    component: "observability",
    event: "synthetic_start",
  });

  await captureProductEvent({
    distinctId: "synthetic-observability-run",
    event: "synthetic_observability_check",
    properties: {
      alertPolicies: baselineAlertPolicies.length,
    },
  });

  try {
    throw new Error("Synthetic failure injection for alert-route validation");
  } catch (error) {
    logError("Synthetic failure captured", {
      component: "observability",
      event: "synthetic_failure",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  logInfo("Synthetic observability test finished", {
    component: "observability",
    event: "synthetic_complete",
  });
}

main().catch((error) => {
  logError("Synthetic observability script failed", {
    component: "observability",
    event: "synthetic_script_failed",
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
