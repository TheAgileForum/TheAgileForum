import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export default async function globalSetup(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL missing — set server/.env.test or env before test:integration",
    );
  }
  execSync("npm run db:deploy", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? "test",
      CATALOG_USE_DB: "true",
    },
    shell: true,
  });
}
