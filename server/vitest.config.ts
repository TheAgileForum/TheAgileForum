import { defineConfig } from "vitest/config";

/** Fast suite: no DB. Story 1.0 health regression. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/app.test.ts"],
  },
});
