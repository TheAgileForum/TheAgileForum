export function extractPlainText(buffer: Buffer): { text: string; warnings: string[] } {
  const text = buffer.toString("utf8").replace(/^\uFEFF/, "").trim();
  return {
    text,
    warnings: text ? [] : ["Empty plain-text file"],
  };
}
