import { extractDocText } from "./doc.js";
import { extractDocxText } from "./docx.js";
import { extractHtmlText } from "./html.js";
import { resolveExtractMimeType } from "./mime.js";
import { extractPlainText } from "./plain.js";
import { extractPdfText } from "./pdf.js";
import type { DocumentTextExtractResult, ExtractMethod } from "./types.js";

export type { DocumentTextExtractResult, ExtractMethod, ExtractableMimeType } from "./types.js";
export { EXTRACTABLE_MIME_TYPES } from "./types.js";
export { resolveExtractMimeType, isExtractableMimeType } from "./mime.js";

function wordCount(text: string): number {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  return parts.length;
}

function finalize(
  partial: Omit<DocumentTextExtractResult, "empty" | "text"> & { text: string },
): DocumentTextExtractResult {
  const text = partial.text.trim();
  const warnings = [...partial.warnings];
  if (!text && !warnings.some((w) => /empty|no text|unsupported|failed/i.test(w))) {
    warnings.push("Extracted text is empty");
  }
  return {
    ...partial,
    text,
    empty: text.length === 0,
    pageOrWordCount: partial.pageOrWordCount ?? (text ? wordCount(text) : 0),
  };
}

/**
 * Shared document → plain-text extractor for diagnosis resumes and the
 * public extract-text API. Prefer this over ad-hoc pdf-parse/mammoth calls.
 */
export async function extractDocumentText(input: {
  buffer: Buffer;
  mimeType?: string;
  fileName?: string;
}): Promise<DocumentTextExtractResult> {
  const mimeType = resolveExtractMimeType(input.mimeType, input.fileName);

  if (!input.buffer?.length) {
    return finalize({
      text: "",
      mimeType: mimeType ?? input.mimeType ?? "application/octet-stream",
      method: "empty",
      warnings: ["Empty file"],
      pageOrWordCount: 0,
    });
  }

  if (!mimeType) {
    return finalize({
      text: "",
      mimeType: input.mimeType ?? "application/octet-stream",
      method: "unsupported",
      warnings: [
        `Unsupported format${input.fileName ? ` (${input.fileName})` : ""}. ` +
          "Use PDF, DOC, DOCX, HTML, TXT, or Markdown.",
      ],
      pageOrWordCount: 0,
    });
  }

  try {
    if (mimeType === "application/pdf") {
      const pdf = await extractPdfText(input.buffer);
      return finalize({
        text: pdf.text,
        mimeType,
        method: pdf.method,
        pageOrWordCount: pdf.pageCount || undefined,
        warnings: pdf.warnings,
      });
    }

    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const docx = await extractDocxText(input.buffer);
      return finalize({
        text: docx.text,
        mimeType,
        method: "mammoth",
        warnings: docx.warnings,
      });
    }

    if (mimeType === "application/msword") {
      const doc = await extractDocText(input.buffer);
      return finalize({
        text: doc.text,
        mimeType,
        method: "word-extractor",
        warnings: doc.warnings,
      });
    }

    if (mimeType === "text/html") {
      const html = extractHtmlText(input.buffer);
      return finalize({
        text: html.text,
        mimeType,
        method: "cheerio",
        warnings: html.warnings,
      });
    }

    // text/plain | text/markdown
    const plain = extractPlainText(input.buffer);
    return finalize({
      text: plain.text,
      mimeType,
      method: "plain",
      warnings: plain.warnings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return finalize({
      text: "",
      mimeType,
      method: "empty",
      warnings: [`Extraction failed: ${message}`],
      pageOrWordCount: 0,
    });
  }
}
