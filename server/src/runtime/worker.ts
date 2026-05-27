import "dotenv/config";
import { getEnv } from "../config/env.js";
import { initObservability } from "../observability/bootstrap.js";
import { startRuntimeHealthServer } from "./health-server.js";
import { logInfo } from "./logger.js";
import { wireGracefulShutdown } from "./signals.js";

const env = getEnv();
const role = "worker";
const heartbeatMs = 15000;
initObservability(role);

logInfo("Worker booting", {
  role,
  redisUrl: env.REDIS_URL,
  port: env.WORKER_PORT,
});

const server = startRuntimeHealthServer(role, env.WORKER_PORT);

const timer = setInterval(() => {
  logInfo("Worker heartbeat", { role });
}, heartbeatMs);

wireGracefulShutdown(
  role,
  () => {
    clearInterval(timer);
    logInfo("Worker stopped", { role });
  },
  server,
);
