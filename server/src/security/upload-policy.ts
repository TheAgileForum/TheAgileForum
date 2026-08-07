import { getEnv } from "../config/env.js";
import {
  EXTRACTABLE_MIME_TYPES,
  resolveExtractMimeType,
} from "../diagnosis/text-extract/index.js";

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
  fileName?: string;
}): UploadValidationResult {
  const env = getEnv();
  const maxBytes = env.RESUME_UPLOAD_MAX_MB * 1024 * 1024;
  const resolved =
    resolveExtractMimeType(input.mimeType, input.fileName) ?? input.mimeType;

  if (!allowedResumeMimeTypes.has(resolved)) {
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

/** MIME/size checks for the standalone document text-extract endpoint. */
export function validateExtractUpload(input: {
  mimeType: string;
  sizeBytes: number;
  fileName?: string;
}): UploadValidationResult & { resolvedMimeType?: string } {
  const env = getEnv();
  const maxBytes = env.RESUME_UPLOAD_MAX_MB * 1024 * 1024;
  const resolved = resolveExtractMimeType(input.mimeType, input.fileName);

  if (!resolved || !(EXTRACTABLE_MIME_TYPES as readonly string[]).includes(resolved)) {
    return {
      ok: false,
      code: "UNSUPPORTED_MIME",
      message: "Supported formats: PDF, DOC, DOCX, HTML, TXT, Markdown",
    };
  }

  if (input.sizeBytes > maxBytes) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: `File exceeds max size of ${env.RESUME_UPLOAD_MAX_MB}MB`,
    };
  }

  return { ok: true, resolvedMimeType: resolved };
}
