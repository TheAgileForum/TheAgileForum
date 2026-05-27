import { getEnv } from "../config/env.js";

const allowedResumeMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type UploadValidationResult = {
  ok: boolean;
  code?: "UNSUPPORTED_MIME" | "FILE_TOO_LARGE";
  message?: string;
};

export function validateResumeUpload(input: {
  mimeType: string;
  sizeBytes: number;
}): UploadValidationResult {
  const env = getEnv();
  const maxBytes = env.RESUME_UPLOAD_MAX_MB * 1024 * 1024;

  if (!allowedResumeMimeTypes.has(input.mimeType)) {
    return {
      ok: false,
      code: "UNSUPPORTED_MIME",
      message: "Only PDF/DOC/DOCX resume uploads are supported",
    };
  }

  if (input.sizeBytes > maxBytes) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: `Resume exceeds max size of ${env.RESUME_UPLOAD_MAX_MB}MB`,
    };
  }

  return { ok: true };
}
