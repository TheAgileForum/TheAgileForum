/**
 * Staging PostHog live-capture verification.
 * Requires POSTHOG_API_KEY in server/.env or environment.
 *
 * Run: npm run observability:posthog-verify
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { getEnv, resetEnvCache } from "../src/config/env.js";
import {
  trackCartUpdated,
  trackCheckoutConfirmed,
  trackCheckoutStarted,
  trackGlobalCartViewed,
} from "../src/observability/commerce-analytics.js";
import {
  captureProductEvent,
  shutdownPosthogClient,
} from "../src/observability/posthog.js";
import { logError, logInfo } from "../src/runtime/logger.js";

type VerifyStep = {
  label: string;
  run: () => Promise<boolean>;
};

async function main() {
  resetEnvCache();
  const env = getEnv();

  if (!env.POSTHOG_API_KEY) {
    logError("POSTHOG_API_KEY is not set — live capture disabled", {
      component: "observability",
      event: "posthog_verify_skipped",
    });
    console.error(
      [
        "PostHog staging verify: SKIPPED (no POSTHOG_API_KEY)",
        "",
        "Add to server/.env for staging:",
        "  POSTHOG_API_KEY=phc_your_project_api_key",
        "  POSTHOG_HOST=https://us.i.posthog.com",
        "  OBSERVABILITY_RELEASE=staging",
        "  NODE_ENV=production",
        "",
        "Get the key: PostHog → Project Settings → Project API Key",
      ].join("\n"),
    );
    process.exit(1);
  }

  const distinctId = `staging-verify-${randomUUID()}`;
  const cartId = randomUUID();
  const orderId = randomUUID();

  logInfo("PostHog staging verify started", {
    component: "observability",
    event: "posthog_verify_start",
    host: env.POSTHOG_HOST,
    release: env.OBSERVABILITY_RELEASE,
  });

  const steps: VerifyStep[] = [
    {
      label: "global_cart_viewed",
      run: () =>
        trackGlobalCartViewed({
          distinctId,
          lineCount: 0,
          guest: true,
          surface: "staging_verify",
        }),
    },
    {
      label: "cart_updated",
      run: () =>
        trackCartUpdated({
          distinctId,
          cartId,
          cart: { items: [{ quantity: 1 }], lineCount: 1 },
          guest: true,
          commerceJourneyOrigin: "catalog_certifications",
        }),
    },
    {
      label: "checkout_started",
      run: () =>
        trackCheckoutStarted({
          distinctId,
          orderId,
          orderNumber: "ORD-STAGING-VERIFY",
          variant: "standard",
          currency: "USD",
          totalAmount: "49.00",
          commerceJourneyOrigin: "guided",
        }),
    },
    {
      label: "checkout_confirmed",
      run: () =>
        trackCheckoutConfirmed({
          distinctId,
          orderId,
          orderNumber: "ORD-STAGING-VERIFY",
          currency: "USD",
          paymentMode: "full_pay",
        }),
    },
    {
      label: "staging_posthog_verify (marker)",
      run: () =>
        captureProductEvent({
          distinctId,
          event: "staging_posthog_verify",
          properties: {
            verify_run: true,
            contract_events_sent: 4,
          },
        }),
    },
  ];

  const failures: string[] = [];

  for (const step of steps) {
    const ok = await step.run();
    if (!ok) {
      failures.push(step.label);
      logError(`PostHog verify step failed: ${step.label}`, {
        component: "observability",
        event: "posthog_verify_step_failed",
        step: step.label,
      });
    } else {
      logInfo(`PostHog verify step ok: ${step.label}`, {
        component: "observability",
        event: "posthog_verify_step_ok",
        step: step.label,
      });
    }
  }

  await shutdownPosthogClient();

  if (failures.length > 0) {
    console.error(`PostHog staging verify: FAILED (${failures.join(", ")})`);
    process.exit(1);
  }

  console.log(
    [
      "PostHog staging verify: OK",
      `  distinctId: ${distinctId}`,
      `  host: ${env.POSTHOG_HOST}`,
      `  release: ${env.OBSERVABILITY_RELEASE}`,
      "",
      "In PostHog → Activity → filter event = staging_posthog_verify (last 5 min)",
    ].join("\n"),
  );
}

main().catch(async (error) => {
  logError("PostHog staging verify script failed", {
    component: "observability",
    event: "posthog_verify_script_failed",
    error: error instanceof Error ? error.message : String(error),
  });
  await shutdownPosthogClient();
  process.exit(1);
});
