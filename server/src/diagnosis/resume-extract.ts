import { extractDocumentText } from "./text-extract/index.js";

export type ResumeExtractResult = {
  text: string;
  method:
    | "pdf-parse"
    | "pdf-parse-fallback"
    | "mammoth"
    | "word-extractor"
    | "unsupported"
    | "empty";
  warning?: string;
  warnings?: string[];
  pageOrWordCount?: number;
};

/**
 * Extract plain text from a resume buffer for diagnosis AI input.
 * Delegates to the shared document text extractor (PDF/DOCX/DOC + more).
 */
export async function extractResumeText(
  buffer: Buffer,
  mimeType: string,
  fileName?: string,
): Promise<ResumeExtractResult> {
  const result = await extractDocumentText({ buffer, mimeType, fileName });
  const method =
    result.method === "cheerio" || result.method === "plain"
      ? ("unsupported" as const)
      : result.method;

  const warning = result.warnings[0];
  return {
    text: result.text,
    method,
    ...(warning ? { warning } : {}),
    warnings: result.warnings,
    ...(result.pageOrWordCount != null ? { pageOrWordCount: result.pageOrWordCount } : {}),
  };
}
