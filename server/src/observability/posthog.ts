import { PostHog } from "posthog-node";
import { z } from "zod";
import { getEnv } from "../config/env.js";
import { logInfo, logWarn } from "../runtime/logger.js";

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

export async function captureProductEvent(input: PosthogEventInput): Promise<boolean> {
  const parsed = posthogEventSchema.safeParse(input);
  if (!parsed.success) {
    logWarn("PostHog event rejected by schema", {
      component: "observability",
      event: "posthog_schema_reject",
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`),
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

  posthog.capture(parsed.data);
  await posthog.flush();
  return true;
}
