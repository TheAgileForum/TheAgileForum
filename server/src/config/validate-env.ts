import "dotenv/config";
import { validateEnvOrThrow } from "./env.js";

function main() {
  const env = validateEnvOrThrow();
  const safeSummary = {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    DATABASE_URL: "<set>",
    JWT_SECRET: "<set>",
    AUTH_COOKIE_NAME: env.AUTH_COOKIE_NAME,
  };
  console.log("Environment validation passed.");
  console.log(JSON.stringify(safeSummary, null, 2));
}

main();
