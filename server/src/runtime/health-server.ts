import http from "node:http";
import { logInfo } from "./logger.js";

type RuntimeHealth = {
  status: "ok";
  role: string;
  uptimeSec: number;
};

export function startRuntimeHealthServer(role: string, port: number) {
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      const payload: RuntimeHealth = {
        status: "ok",
        role,
        uptimeSec: Math.floor(process.uptime()),
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "not_found", role }));
  });

  server.listen(port, () => {
    logInfo("Runtime health server started", { role, port });
  });

  return server;
}
