import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { getEnv } from "../config/env.js";

const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

export function getResumeUploadRoot(): string {
  const configured = process.env.RESUME_UPLOAD_DIR?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_UPLOAD_DIR;
}

function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\-()+\s]/g, "_");
  return base.slice(0, 180) || "resume.bin";
}

export async function storeResumeFile(input: {
  sessionId: string;
  fileName: string;
  buffer: Buffer;
}): Promise<{ storagePath: string; checksum: string; absolutePath: string }> {
  const root = getResumeUploadRoot();
  const sessionDir = path.join(root, input.sessionId);
  await fs.mkdir(sessionDir, { recursive: true });

  const safeName = sanitizeFileName(input.fileName);
  const storedName = `${randomUUID()}-${safeName}`;
  const absolutePath = path.join(sessionDir, storedName);
  await fs.writeFile(absolutePath, input.buffer);

  const checksum = createHash("sha256").update(input.buffer).digest("hex");
  // Relative path from cwd for portability across restarts
  const storagePath = path.relative(process.cwd(), absolutePath).split(path.sep).join("/");

  return { storagePath, checksum, absolutePath };
}

export async function readResumeFile(storagePath: string): Promise<Buffer | null> {
  if (storagePath.startsWith("local-stub://")) {
    return null;
  }
  const absolute = path.isAbsolute(storagePath)
    ? storagePath
    : path.join(process.cwd(), storagePath);
  try {
    return await fs.readFile(absolute);
  } catch {
    return null;
  }
}

export function resumeMaxBytes(): number {
  return getEnv().RESUME_UPLOAD_MAX_MB * 1024 * 1024;
}
