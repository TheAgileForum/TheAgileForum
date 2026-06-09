import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

type Check = {
  id: string;
  name: string;
  command: string;
  required: boolean;
  note?: string;
};

type CheckResult = {
  id: string;
  name: string;
  required: boolean;
  command: string;
  ok: boolean;
  exitCode: number;
  note?: string;
};

const checks: Check[] = [
  {
    id: "S0.2-env",
    name: "Environment validation",
    command: "npm run env:check",
    required: true,
  },
  {
    id: "S0.8-unit",
    name: "Server unit test suite",
    command: "npm test",
    required: true,
  },
  {
    id: "S0.3-build",
    name: "TypeScript build",
    command: "npm run build",
    required: true,
  },
  {
    id: "S0.8-observability",
    name: "Synthetic observability flow",
    command: "npm run observability:synthetic",
    required: true,
  },
  {
    id: "S0.5-auth-integration",
    name: "Auth/RBAC integration tests",
    command: "npm run test:integration",
    required: false,
    note: "Optional in local runs if dedicated integration DB is unavailable.",
  },
];

function runCheck(check: Check): CheckResult {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const serverRoot = path.join(scriptDir, "..");
  const result = spawnSync(check.command, {
    shell: true,
    encoding: "utf8",
    stdio: "pipe",
    cwd: serverRoot,
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? "test" },
  });

  const ok = (result.status ?? 1) === 0;
  const header = `\n===== ${check.id} :: ${check.name} =====\n$ ${check.command}\n`;
  process.stdout.write(header);
  if (result.stdout) {
    process.stdout.write(`${result.stdout}\n`);
  }
  if (result.stderr) {
    process.stderr.write(`${result.stderr}\n`);
  }
  process.stdout.write(`=> ${ok ? "PASS" : "FAIL"} (exit ${result.status ?? -1})\n`);

  return {
    id: check.id,
    name: check.name,
    required: check.required,
    command: check.command,
    ok,
    exitCode: result.status ?? -1,
    note: check.note,
  };
}

function renderReport(results: CheckResult[]): string {
  const now = new Date().toISOString();
  const blockers = results.filter((item) => item.required && !item.ok);
  const optionalFailures = results.filter((item) => !item.required && !item.ok);
  const decision = blockers.length === 0 ? "GO" : "NO_GO";

  const lines = [
    "# Sprint 1 Readiness Gate Report (S0.10)",
    "",
    `- Generated at: ${now}`,
    `- Decision: **${decision}**`,
    "",
    "## Check Results",
    "",
    "| ID | Check | Required | Status | Exit |",
    "|---|---|---|---|---|",
    ...results.map((item) => {
      const status = item.ok ? "PASS" : "FAIL";
      const required = item.required ? "yes" : "no";
      return `| ${item.id} | ${item.name} | ${required} | ${status} | ${item.exitCode} |`;
    }),
    "",
    "## Blocking Findings",
    "",
    ...(blockers.length === 0
      ? ["- None"]
      : blockers.map((item) => `- ${item.id}: ${item.name} (${item.command})`)),
    "",
    "## Non-Blocking Findings",
    "",
    ...(optionalFailures.length === 0
      ? ["- None"]
      : optionalFailures.map((item) => `- ${item.id}: ${item.name} (${item.command})`)),
    "",
    "## Notes",
    "",
    ...results
      .filter((item) => item.note)
      .map((item) => `- ${item.id}: ${item.note}`),
    "",
  ];

  return lines.join("\n");
}

function main() {
  const results = checks.map(runCheck);
  const report = renderReport(results);

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const reportDir = path.join(root, "docs", "reports");
  mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "sprint-1-readiness-gate-s0-10.md");
  writeFileSync(reportPath, report, "utf8");

  const blockers = results.filter((item) => item.required && !item.ok);
  process.stdout.write(`\nReadiness report written to: ${reportPath}\n`);
  if (blockers.length > 0) {
    process.exitCode = 1;
  }
}

main();
