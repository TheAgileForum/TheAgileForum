import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  AUTH_COOKIE_NAME: z.string().default("access_token"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  WORKER_PORT: z.coerce.number().int().positive().default(3101),
  SCHEDULER_PORT: z.coerce.number().int().positive().default(3102),
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
