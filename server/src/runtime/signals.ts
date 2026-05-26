import type { Server } from "node:http";
import { logError, logInfo } from "./logger.js";

export function wireGracefulShutdown(role: string, onShutdown: () => void, server?: Server) {
  const shutdown = (signal: NodeJS.Signals) => {
    logInfo("Shutdown signal received", { role, signal });
    try {
      onShutdown();
      if (server) {
        server.close(() => {
          logInfo("Runtime server closed", { role });
          process.exit(0);
        });
        return;
      }
      process.exit(0);
    } catch (error) {
      logError("Runtime shutdown failed", {
        role,
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
