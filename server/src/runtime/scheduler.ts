import "dotenv/config";
import { getEnv } from "../config/env.js";
import { startRuntimeHealthServer } from "./health-server.js";
import { logInfo } from "./logger.js";
import { wireGracefulShutdown } from "./signals.js";

const env = getEnv();
const role = "scheduler";
const heartbeatMs = 20000;

logInfo("Scheduler booting", {
  role,
  redisUrl: env.REDIS_URL,
  port: env.SCHEDULER_PORT,
});

const server = startRuntimeHealthServer(role, env.SCHEDULER_PORT);

const timer = setInterval(() => {
  logInfo("Scheduler heartbeat", { role });
}, heartbeatMs);

wireGracefulShutdown(
  role,
  () => {
    clearInterval(timer);
    logInfo("Scheduler stopped", { role });
  },
  server,
);
