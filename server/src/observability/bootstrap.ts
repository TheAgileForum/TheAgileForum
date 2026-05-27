import { captureException, initSentry } from "./sentry.js";
import { logError, logInfo } from "../runtime/logger.js";

export function initObservability(role: "api" | "worker" | "scheduler") {
  initSentry(role);

  process.on("uncaughtException", (error) => {
    captureException(error, { role, crashType: "uncaughtException" });
    logError("Uncaught exception", {
      role,
      component: "observability",
      event: "uncaught_exception",
      error: error.message,
    });
  });

  process.on("unhandledRejection", (reason) => {
    captureException(reason, { role, crashType: "unhandledRejection" });
    logError("Unhandled rejection", {
      role,
      component: "observability",
      event: "unhandled_rejection",
      reason: reason instanceof Error ? reason.message : String(reason),
    });
  });

  logInfo("Observability bootstrap complete", {
    role,
    component: "observability",
    event: "bootstrap_complete",
  });
}
