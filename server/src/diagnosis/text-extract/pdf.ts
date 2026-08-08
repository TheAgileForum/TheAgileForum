import { PDFParse } from "pdf-parse";

export type PdfExtractOutcome = {
  text: string;
  pageCount: number;
  method: "pdf-parse" | "pdf-parse-fallback";
  warnings: string[];
};

/**
 * Extract text via pdf-parse v2 (PDF.js). Primary + fallback parse options
 * cover text-rich PDFs that previously returned empty with the v1-style call.
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractOutcome> {
  const warnings: string[] = [];
  const primary = await runPdfParse(buffer, {});
  if (primary.text.trim()) {
    return {
      text: primary.text,
      pageCount: primary.pageCount,
      method: "pdf-parse",
      warnings,
    };
  }

  warnings.push("Primary PDF text pass was empty; retrying with fallback options");
  const fallback = await runPdfParse(buffer, {
    // Include more layout noise rather than dropping content.
    lineThreshold: 1,
    cellThreshold: 1,
  });
  if (fallback.text.trim()) {
    return {
      text: fallback.text,
      pageCount: fallback.pageCount,
      method: "pdf-parse-fallback",
      warnings,
    };
  }

  return {
    text: "",
    pageCount: Math.max(primary.pageCount, fallback.pageCount),
    method: "pdf-parse",
    warnings: [...warnings, "No extractable text found in PDF (may be scanned/image-only)"],
  };
}

async function runPdfParse(
  buffer: Buffer,
  parseParams: { lineThreshold?: number; cellThreshold?: number },
): Promise<{ text: string; pageCount: number }> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText({
      ...parseParams,
      // Avoid "-- 1 of 1 --" page markers in AI/diagnosis input.
      pageJoiner: "\n",
    });
    return {
      text: result.text ?? "",
      pageCount: result.total ?? result.pages?.length ?? 0,
    };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
