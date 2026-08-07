import { describe, expect, it } from "vitest";
import { extractPdfText } from "./pdf.js";
import { extractResumeText } from "../resume-extract.js";

/** Minimal single-page PDF with Helvetica text (hardcoded xref offsets). */
function makeHelloPdf(): Buffer {
  return Buffer.from(
    "%PDF-1.1\n" +
      "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n" +
      "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n" +
      "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n" +
      "4 0 obj<< /Length 44 >>stream\n" +
      "BT /F1 24 Tf 100 100 Td (Hello Resume) Tj ET\n" +
      "endstream\nendobj\n" +
      "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n" +
      "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \n0000000360 00000 n \n" +
      "trailer<< /Size 6 /Root 1 0 R >>\nstartxref\n429\n%%EOF\n",
  );
}

describe("text-extract PDF (pdf-parse v2)", () => {
  it("extracts text from a standard text PDF", async () => {
    const result = await extractPdfText(makeHelloPdf());
    expect(result.text).toContain("Hello Resume");
    expect(result.method).toMatch(/^pdf-parse/);
  });

  it("extractResumeText returns usable text for diagnosis", async () => {
    const result = await extractResumeText(makeHelloPdf(), "application/pdf", "resume.pdf");
    expect(result.text).toContain("Hello Resume");
    expect(result.warning).toBeUndefined();
  });
});
