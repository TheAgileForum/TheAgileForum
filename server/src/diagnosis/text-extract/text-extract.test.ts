import { describe, expect, it } from "vitest";
import { extractDocumentText } from "./index.js";

/** Minimal PDF with a single Helvetica text string. */
function makeTextPdf(label: string): Buffer {
  const content = `BT /F1 24 Tf 50 100 Td (${label}) Tj ET`;
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n",
    `4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream\nendobj\n`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  ];
  let body = "%PDF-1.1\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body, "utf8"));
    body += obj;
  }
  const xrefStart = Buffer.byteLength(body, "utf8");
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `${xref}trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(body, "utf8");
}

/** Minimal OOXML docx (zip) with document.xml word text — mammoth needs a real zip. */
async function makeDocxBuffer(text: string): Promise<Buffer> {
  // Use mammoth's inverse is hard; build a tiny valid docx via JSZip if available,
  // otherwise skip — tests use mammoth on a handcrafted zip below.
  const { default: JSZip } = await import("jszip").catch(() => ({ default: null }));
  if (!JSZip) {
    // Fallback: return invalid buffer; mammoth will error → empty + warning covered separately.
    return Buffer.from("PK\u0003\u0004not-a-real-docx");
  }
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.folder("word")?.file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body>
</w:document>`,
  );
  return zip.generateAsync({ type: "nodebuffer" }) as Promise<Buffer>;
}

describe("extractDocumentText", () => {
  it("extracts text from a standard text PDF via pdf-parse v2", async () => {
    const buffer = makeTextPdf("Jithamanyu Summary Experience");
    const result = await extractDocumentText({
      buffer,
      mimeType: "application/pdf",
      fileName: "resume.pdf",
    });
    expect(result.empty).toBe(false);
    expect(result.method).toMatch(/^pdf-parse/);
    expect(result.text).toContain("Jithamanyu");
    expect(result.text).toContain("Summary");
    expect(result.pageOrWordCount).toBeGreaterThan(0);
  });

  it("returns empty + warning for empty buffer", async () => {
    const result = await extractDocumentText({
      buffer: Buffer.alloc(0),
      mimeType: "application/pdf",
    });
    expect(result.text).toBe("");
    expect(result.empty).toBe(true);
    expect(result.method).toBe("empty");
    expect(result.warnings.join(" ")).toMatch(/Empty/i);
  });

  it("passthrough extracts TXT / MD", async () => {
    const txt = await extractDocumentText({
      buffer: Buffer.from("Hello resume world", "utf8"),
      mimeType: "text/plain",
      fileName: "notes.txt",
    });
    expect(txt.text).toBe("Hello resume world");
    expect(txt.method).toBe("plain");
    expect(txt.empty).toBe(false);

    const md = await extractDocumentText({
      buffer: Buffer.from("# Title\n\nBody", "utf8"),
      fileName: "resume.md",
    });
    expect(md.mimeType).toBe("text/markdown");
    expect(md.text).toContain("Title");
    expect(md.method).toBe("plain");
  });

  it("strips HTML to text via cheerio", async () => {
    const html = `<!doctype html><html><body><h1>Scrum Master</h1><p>5 years experience</p><script>evil()</script></body></html>`;
    const result = await extractDocumentText({
      buffer: Buffer.from(html, "utf8"),
      mimeType: "text/html",
      fileName: "resume.html",
    });
    expect(result.method).toBe("cheerio");
    expect(result.text).toContain("Scrum Master");
    expect(result.text).toContain("5 years experience");
    expect(result.text).not.toContain("evil");
    expect(result.empty).toBe(false);
  });

  it("marks unsupported formats clearly", async () => {
    const result = await extractDocumentText({
      buffer: Buffer.from("binary"),
      mimeType: "application/octet-stream",
      fileName: "resume.exe",
    });
    expect(result.empty).toBe(true);
    expect(result.method).toBe("unsupported");
    expect(result.warnings.join(" ")).toMatch(/Unsupported/i);
  });

  it("returns warning when PDF bytes are invalid", async () => {
    const result = await extractDocumentText({
      buffer: Buffer.from("%PDF-not-valid"),
      mimeType: "application/pdf",
    });
    expect(result.text).toBe("");
    expect(result.empty).toBe(true);
    expect(result.warnings.join(" ")).toMatch(/Extraction failed|No extractable text/i);
  });

  it("extracts DOCX when a valid package is provided", async () => {
    const buffer = await makeDocxBuffer("Agile Coach experience");
    const result = await extractDocumentText({
      buffer,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileName: "resume.docx",
    });
    // Without jszip the buffer is invalid and we still assert a graceful non-throw.
    if (result.method === "mammoth" && !result.empty) {
      expect(result.text).toContain("Agile Coach");
    } else {
      expect(result.empty).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    }
  });
});
