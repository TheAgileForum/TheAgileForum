import * as Sentry from "@sentry/node";
import { getEnv } from "../config/env.js";
import { logInfo } from "../runtime/logger.js";

let sentryInitialized = false;

export function initSentry(role: "api" | "worker" | "scheduler"): boolean {
  if (sentryInitialized) {
    return true;
  }

  const env = getEnv();
  if (!env.SENTRY_DSN) {
    logInfo("Sentry disabled: missing DSN", { role, component: "observability", event: "sentry_skip" });
    return false;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    release: env.OBSERVABILITY_RELEASE,
  });

  sentryInitialized = true;
  logInfo("Sentry initialized", { role, component: "observability", event: "sentry_init" });
  return true;
}

export function captureException(error: unknown, context: Record<string, unknown>) {
  if (!sentryInitialized) {
    return;
  }
  Sentry.captureException(error, {
    extra: context,
  });
}

export function resetSentryForTests(): void {
  sentryInitialized = false;
}
