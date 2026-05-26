import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "vitest/config";

const dir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(dir, ".env.test") });

/** Requires PostgreSQL (see repo `docker-compose.yml`). Story 1.1 auth. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    globalSetup: ["./src/test-global-setup.ts"],
  },
});
