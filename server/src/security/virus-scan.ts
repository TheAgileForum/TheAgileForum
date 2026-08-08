/**
 * Malware scan hook — deferred to a later phase.
 * Always returns clean for Phase 1; wire a real scanner here later.
 */
export type VirusScanResult = {
  clean: boolean;
  scanner: "stub";
  detail?: string;
};

export async function scanDocumentBuffer(_buffer: Buffer): Promise<VirusScanResult> {
  return { clean: true, scanner: "stub", detail: "virus scan deferred" };
}

/** @deprecated Prefer {@link scanDocumentBuffer}. */
export async function scanResumeBuffer(buffer: Buffer): Promise<VirusScanResult> {
  return scanDocumentBuffer(buffer);
}
