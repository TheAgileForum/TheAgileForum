/**
 * Malware scan hook — deferred to a later phase.
 * Always returns clean for Phase 1; wire a real scanner here later.
 */
export type VirusScanResult = {
  clean: boolean;
  scanner: "stub";
  detail?: string;
};

export async function scanResumeBuffer(_buffer: Buffer): Promise<VirusScanResult> {
  return { clean: true, scanner: "stub", detail: "virus scan deferred" };
}
