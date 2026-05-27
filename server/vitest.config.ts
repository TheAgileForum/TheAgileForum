import { defineConfig } from "vitest/config";

/** Fast suite: no DB. Story 1.0 health regression. */
export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["src/test-setup.ts"],
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts"],
  },
});
