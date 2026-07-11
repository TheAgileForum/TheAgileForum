import { PostHog } from "posthog-node";
import { z } from "zod";
import { getEnv } from "../config/env.js";
import { logInfo, logWarn } from "../runtime/logger.js";
import { validateProductEventProperties } from "./product-events.js";

const posthogEventSchema = z.object({
  distinctId: z.string().min(1),
  event: z.string().min(1),
  properties: z.record(z.unknown()).default({}),
});

type PosthogEventInput = z.infer<typeof posthogEventSchema>;

let client: PostHog | null = null;

function getPosthogClient(): PostHog | null {
  if (client) {
    return client;
  }
  const env = getEnv();
  if (!env.POSTHOG_API_KEY) {
    return null;
  }

  client = new PostHog(env.POSTHOG_API_KEY, {
    host: env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });

  return client;
}

function enrichEventProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const env = getEnv();
  return {
    ...properties,
    app_env: env.NODE_ENV,
    release: env.OBSERVABILITY_RELEASE,
    service: "mybmadproj-server",
  };
}

export async function captureProductEvent(input: PosthogEventInput): Promise<boolean> {
  const parsed = posthogEventSchema.safeParse({
    ...input,
    properties: enrichEventProperties(input.properties ?? {}),
  });
  if (!parsed.success) {
    logWarn("PostHog event rejected by schema", {
      component: "observability",
      event: "posthog_schema_reject",
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`),
    });
    return false;
  }

  const contract = validateProductEventProperties(
    parsed.data.event,
    parsed.data.properties as Record<string, unknown>,
  );
  if (!contract.ok) {
    logWarn("PostHog event rejected by product contract", {
      component: "observability",
      event: "posthog_contract_reject",
      posthogEvent: parsed.data.event,
      issues: contract.issues,
    });
    return false;
  }

  const posthog = getPosthogClient();
  if (!posthog) {
    logInfo("PostHog disabled: missing API key", {
      component: "observability",
      event: "posthog_skip",
      posthogEvent: parsed.data.event,
    });
    return false;
  }

  try {
    posthog.capture(parsed.data);
    await posthog.flush();
    return true;
  } catch (err) {
    logWarn("PostHog flush failed", {
      component: "observability",
      event: "posthog_flush_error",
      posthogEvent: parsed.data.event,
      reason: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export async function shutdownPosthogClient(): Promise<void> {
  if (client) {
    await client.shutdown();
    client = null;
  }
}

export function resetPosthogClientForTests(): void {
  client = null;
}
