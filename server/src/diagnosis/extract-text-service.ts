import { ApiError } from "../errors/api-error.js";
import { validateExtractUpload } from "../security/upload-policy.js";
import { scanDocumentBuffer } from "../security/virus-scan.js";
import { extractDocumentText } from "./text-extract/index.js";

const PREVIEW_MAX_CHARS = 500;

/**
 * Session-optional document text extraction for FE preview / tooling.
 * Does not persist a ResumeAsset — diagnosis resume upload still does that.
 */
export async function extractUploadedDocumentText(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  /** Optional — accepted for correlation/logging only. */
  sessionId?: string;
}) {
  const validation = validateExtractUpload({
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    fileName: input.fileName,
  });
  if (!validation.ok) {
    throw new ApiError({
      status: 400,
      code: validation.code ?? "UNSUPPORTED_MIME",
      message: validation.message ?? "Unsupported document type",
      retryable: true,
    });
  }

  const scan = await scanDocumentBuffer(input.buffer);
  if (!scan.clean) {
    throw new ApiError({
      status: 400,
      code: "DOCUMENT_SCAN_FAILED",
      message: "Document failed security scan",
      retryable: false,
    });
  }

  const mimeType = validation.resolvedMimeType ?? input.mimeType;
  const extracted = await extractDocumentText({
    buffer: input.buffer,
    mimeType,
    fileName: input.fileName,
  });

  const preview = extracted.text.slice(0, PREVIEW_MAX_CHARS);

  return {
    mimeType: extracted.mimeType,
    method: extracted.method,
    text: extracted.text,
    textPreview: preview,
    textChars: extracted.text.length,
    pageOrWordCount: extracted.pageOrWordCount ?? null,
    empty: extracted.empty,
    warnings: extracted.warnings,
    ...(input.sessionId ? { sessionId: input.sessionId } : {}),
  };
}
