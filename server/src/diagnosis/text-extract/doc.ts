import WordExtractor from "word-extractor";

/**
 * Legacy binary .doc via pure-JS word-extractor (no antiword / LibreOffice).
 */
export async function extractDocText(buffer: Buffer): Promise<{ text: string; warnings: string[] }> {
  const extractor = new WordExtractor();
  const doc = await extractor.extract(buffer);
  const body = doc.getBody?.() ?? "";
  const headers = doc.getHeaders?.({ includeFooters: true }) ?? "";
  const text = [body, headers].filter(Boolean).join("\n").trim();
  return {
    text,
    warnings: text ? [] : ["No text found in legacy DOC"],
  };
}
