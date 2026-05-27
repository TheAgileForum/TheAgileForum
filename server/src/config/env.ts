import { z } from "zod";

const optionalString = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
}, z.string().optional());

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  AUTH_COOKIE_NAME: z.string().default("access_token"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  WORKER_PORT: z.coerce.number().int().positive().default(3101),
  SCHEDULER_PORT: z.coerce.number().int().positive().default(3102),
  INTEGRATION_PROVIDER_MODE: z.enum(["stub", "live"]).default("stub"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_stub"),
  INTEGRATION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  INTEGRATION_MAX_RETRIES: z.coerce.number().int().min(0).default(2),
  SENTRY_DSN: optionalString,
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  POSTHOG_API_KEY: optionalString,
  POSTHOG_HOST: z.string().url().default("https://us.i.posthog.com"),
  OBSERVABILITY_RELEASE: z.string().default("local-dev"),
  ALERT_WEBHOOK_URL: optionalString,
  CLARITY_PROJECT_ID: optionalString,
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),
  RESUME_UPLOAD_MAX_MB: z.coerce.number().positive().default(5),
});

export type AppEnv = z.infer<typeof schema>;

let cached: AppEnv | null = null;

function formatEnvError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const key = issue.path.join(".") || "unknown";
    return `- ${key}: ${issue.message}`;
  });
  return ["Invalid environment configuration.", ...issues].join("\n");
}

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }
  cached = parsed.data;
  return cached;
}

export function validateEnvOrThrow(): AppEnv {
  return getEnv();
}

export function resetEnvCache(): void {
  cached = null;
}
