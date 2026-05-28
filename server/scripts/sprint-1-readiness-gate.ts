/**
 * Sprint 0.10 / Sprint 1 readiness gate — runs enabler checks and writes a GO/NO_GO report.
 * Invoked via: npm run readiness:gate (from server/) or tsx scripts/sprint-1-readiness-gate.ts
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(scriptDir, "..");
const repoRoot = path.join(serverRoot, "..");
const reportPath = path.join(repoRoot, "docs", "reports", "sprint-1-readiness-gate-s0-10.md");

type GateCheck = {
  id: string;
  label: string;
  required: boolean;
  command: string;
  args: string[];
  findingTitle: string;
  optionalNote?: string;
};

const checks: GateCheck[] = [
  {
    id: "S0.2-env",
    label: "Environment validation",
    required: true,
    command: "npm",
    args: ["run", "env:check"],
    findingTitle: "Environment validation (npm run env:check)",
  },
  {
    id: "S0.8-unit",
    label: "Server unit test suite",
    required: true,
    command: "npm",
    args: ["test"],
    findingTitle: "Server unit test suite (npm test)",
  },
  {
    id: "S0.3-build",
    label: "TypeScript build",
    required: true,
    command: "npm",
    args: ["run", "build"],
    findingTitle: "TypeScript build (npm run build)",
  },
  {
    id: "S0.8-observability",
    label: "Synthetic observability flow",
    required: true,
    command: "npm",
    args: ["run", "observability:synthetic"],
    findingTitle: "Synthetic observability flow (npm run observability:synthetic)",
  },
  {
    id: "S0.5-auth-integration",
    label: "Auth/RBAC integration tests",
    required: false,
    command: "npm",
    args: ["run", "test:integration"],
    findingTitle: "Auth/RBAC integration tests (npm run test:integration)",
    optionalNote:
      "Optional in local runs if dedicated integration DB is unavailable.",
  },
];

type CheckResult = {
  check: GateCheck;
  status: "PASS" | "FAIL";
  exitCode: number;
};

function runCheck(check: GateCheck): CheckResult {
  const result = spawnSync(check.command, check.args, {
    cwd: serverRoot,
    encoding: "utf-8",
    shell: process.platform === "win32",
  });
  const exitCode = result.status ?? 1;
  return {
    check,
    status: exitCode === 0 ? "PASS" : "FAIL",
    exitCode,
  };
}

function buildReport(results: CheckResult[], decision: "GO" | "NO_GO"): string {
  const lines: string[] = [
    "# Sprint 1 readiness gate (S0.10)",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Decision: **${decision}**`,
    "",
    "## Check matrix",
    "",
    "| Check | Description | Blocking | Result | Exit |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const row of results) {
    const blocking = row.check.required ? "yes" : "no";
    lines.push(
      `| ${row.check.id} | ${row.check.label} | ${blocking} | ${row.status} | ${row.exitCode} |`,
    );
  }

  lines.push("", "## Findings", "");

  const blockingFailures = results.filter((r) => r.check.required && r.status === "FAIL");
  const nonBlockingFailures = results.filter((r) => !r.check.required && r.status === "FAIL");

  if (blockingFailures.length === 0 && nonBlockingFailures.length === 0) {
    lines.push("- All checks passed.");
  } else {
    for (const row of blockingFailures) {
      lines.push(`- ${row.check.id}: ${row.check.findingTitle}`);
    }
    for (const row of nonBlockingFailures) {
      lines.push(`- ${row.check.id}: ${row.check.findingTitle}`);
      if (row.check.optionalNote) {
        lines.push(`- ${row.check.id}: ${row.check.optionalNote}`);
      }
    }
  }

  lines.push("");
  return lines.join("\n");
}

const results = checks.map(runCheck);
const requiredFailed = results.some((r) => r.check.required && r.status === "FAIL");
const decision = requiredFailed ? "NO_GO" : "GO";
const report = buildReport(results, decision);

mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf-8");

process.stdout.write(`Sprint 1 readiness gate: ${decision}\n`);
process.stdout.write(`Report: ${reportPath}\n`);

for (const row of results) {
  if (row.status === "FAIL") {
    const prefix = row.check.required ? "FAIL" : "WARN";
    process.stderr.write(
      `${prefix} ${row.check.id}: ${row.check.findingTitle} (exit ${row.exitCode})\n`,
    );
  }
}

process.exitCode = decision === "GO" ? 0 : 1;
