import { spawn } from "node:child_process";
import { logError, logInfo } from "./logger.js";

type ProcSpec = {
  name: string;
  command: string;
  args: string[];
};

const procSpecs: ProcSpec[] = [
  { name: "api", command: "npm", args: ["run", "dev:api"] },
  { name: "worker", command: "npm", args: ["run", "dev:worker"] },
  { name: "scheduler", command: "npm", args: ["run", "dev:scheduler"] },
];

const children = procSpecs.map((spec) => {
  const child = spawn(spec.command, spec.args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  logInfo("Process started", { role: "orchestrator", process: spec.name, pid: child.pid });
  child.on("exit", (code) => {
    logInfo("Process exited", { role: "orchestrator", process: spec.name, code });
  });
  return child;
});

const shutdown = () => {
  logInfo("Orchestrator shutdown initiated", { role: "orchestrator" });
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(0), 500);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

for (const child of children) {
  child.on("error", (error) => {
    logError("Orchestrator child process failed", {
      role: "orchestrator",
      error: error.message,
    });
  });
}
