import mammoth from "mammoth";

export async function extractDocxText(buffer: Buffer): Promise<{ text: string; warnings: string[] }> {
  const result = await mammoth.extractRawText({ buffer });
  const warnings = (result.messages ?? [])
    .filter((m) => m.type === "warning" || m.type === "error")
    .map((m) => m.message)
    .slice(0, 5);
  return { text: result.value ?? "", warnings };
}
