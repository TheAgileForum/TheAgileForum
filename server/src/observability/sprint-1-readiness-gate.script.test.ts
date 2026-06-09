import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSpawnSync, mockMkdirSync, mockWriteFileSync } = vi.hoisted(() => ({
  mockSpawnSync: vi.fn(),
  mockMkdirSync: vi.fn(),
  mockWriteFileSync: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  spawnSync: mockSpawnSync,
}));

vi.mock("node:fs", () => ({
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
}));

describe("sprint-1 readiness gate script", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    process.exitCode = 0;
    mockSpawnSync.mockReset();
    mockMkdirSync.mockReset();
    mockWriteFileSync.mockReset();
  });

  it("writes GO decision when all required checks pass", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    mockSpawnSync.mockImplementation(() => ({
      status: 0,
      stdout: "ok",
      stderr: "",
    }));

    await import("../../scripts/sprint-1-readiness-gate.ts");

    expect(mockSpawnSync).toHaveBeenCalledTimes(5);
    expect(mockMkdirSync).toHaveBeenCalledTimes(1);
    expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
    const writtenReport = String(mockWriteFileSync.mock.calls[0][1]);
    expect(writtenReport).toContain("Decision: **GO**");
    expect(writtenReport).toContain("| S0.2-env | Environment validation | yes | PASS | 0 |");
    expect(process.exitCode).toBe(0);

    expect(stdoutSpy).toHaveBeenCalled();
    expect(stderrSpy).not.toHaveBeenCalledWith(expect.stringContaining("FAIL"));
  });

  it("writes NO_GO and sets exit code when a required check fails", async () => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    mockSpawnSync
      .mockReturnValueOnce({ status: 1, stdout: "", stderr: "env failed" })
      .mockReturnValue({ status: 0, stdout: "ok", stderr: "" });

    await import("../../scripts/sprint-1-readiness-gate.ts");

    expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
    const writtenReport = String(mockWriteFileSync.mock.calls[0][1]);
    expect(writtenReport).toContain("Decision: **NO_GO**");
    expect(writtenReport).toContain("- S0.2-env: Environment validation (npm run env:check)");
    expect(process.exitCode).toBe(1);
  });

  it("keeps GO when only optional check fails and records non-blocking finding", async () => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    mockSpawnSync
      .mockReturnValueOnce({ status: 0, stdout: "ok", stderr: "" })
      .mockReturnValueOnce({ status: 0, stdout: "ok", stderr: "" })
      .mockReturnValueOnce({ status: 0, stdout: "ok", stderr: "" })
      .mockReturnValueOnce({ status: 0, stdout: "ok", stderr: "" })
      .mockReturnValueOnce({ status: 1, stdout: "", stderr: "integration db unavailable" });

    await import("../../scripts/sprint-1-readiness-gate.ts");

    expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
    const writtenReport = String(mockWriteFileSync.mock.calls[0][1]);
    expect(writtenReport).toContain("Decision: **GO**");
    const failRows = writtenReport
      .split("\n")
      .filter((line) => line.startsWith("| S0.") && line.includes("| FAIL |"));
    expect(failRows).toHaveLength(1);
    expect(failRows[0]).toContain("| S0.5-auth-integration |");
    expect(failRows[0]).toContain("| no | FAIL | 1 |");

    expect(writtenReport).toContain("| S0.2-env | Environment validation | yes | PASS | 0 |");
    expect(writtenReport).toContain("| S0.8-unit | Server unit test suite | yes | PASS | 0 |");
    expect(writtenReport).toContain("| S0.3-build | TypeScript build | yes | PASS | 0 |");
    expect(writtenReport).toContain(
      "| S0.8-observability | Synthetic observability flow | yes | PASS | 0 |",
    );

    expect(writtenReport).toContain(
      "- S0.5-auth-integration: Auth/RBAC integration tests (npm run test:integration)",
    );
    expect(writtenReport).toContain(
      "- S0.5-auth-integration: Optional in local runs if dedicated integration DB is unavailable.",
    );
    expect(process.exitCode).toBe(0);
  });
});
