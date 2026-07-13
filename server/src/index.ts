import "dotenv/config";
import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";
import { initObservability } from "./observability/bootstrap.js";
import { warnResendSandboxMisconfiguration } from "./services/email-delivery-errors.js";
import { logInfo } from "./runtime/logger.js";

const env = getEnv();
warnResendSandboxMisconfiguration();
initObservability("api");
const app = createApp();

app.listen(env.PORT, () => {
  logInfo("API listening", { role: "api", port: env.PORT });
});
