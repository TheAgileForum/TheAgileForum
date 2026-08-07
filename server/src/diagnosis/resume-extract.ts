import mammoth from "mammoth";

const PDF_MIME = "application/pdf";
const DOC_MIME = "application/msword";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type ResumeExtractResult = {
  text: string;
  method: "pdf-parse" | "mammoth" | "unsupported" | "empty";
  warning?: string;
};

async function extractPdf(buffer: Buffer): Promise<string> {
  // pdf-parse CJS default export
  const mod = await import("pdf-parse");
  const pdfParse = (mod as unknown as { default?: (buf: Buffer) => Promise<{ text: string }> })
    .default;
  if (typeof pdfParse !== "function") {
    // Some bundlers expose the function as the module itself
    const fn = mod as unknown as (buf: Buffer) => Promise<{ text: string }>;
    const result = await fn(buffer);
    return result.text ?? "";
  }
  const result = await pdfParse(buffer);
  return result.text ?? "";
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

/**
 * Extract plain text from a resume buffer for diagnosis AI input.
 * PDF → pdf-parse; DOCX → mammoth; legacy DOC → unsupported (file still stored).
 */
export async function extractResumeText(
  buffer: Buffer,
  mimeType: string,
): Promise<ResumeExtractResult> {
  if (!buffer.length) {
    return { text: "", method: "empty", warning: "Empty file" };
  }

  try {
    if (mimeType === PDF_MIME) {
      const text = (await extractPdf(buffer)).trim();
      return { text, method: "pdf-parse", ...(text ? {} : { warning: "No text found in PDF" }) };
    }
    if (mimeType === DOCX_MIME) {
      const text = (await extractDocx(buffer)).trim();
      return { text, method: "mammoth", ...(text ? {} : { warning: "No text found in DOCX" }) };
    }
    if (mimeType === DOC_MIME) {
      return {
        text: "",
        method: "unsupported",
        warning: "Legacy .doc text extraction is not supported; upload PDF or DOCX for AI analysis",
      };
    }
    return { text: "", method: "unsupported", warning: `Unsupported mime type: ${mimeType}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { text: "", method: "empty", warning: `Extraction failed: ${message}` };
  }
}
