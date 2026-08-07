export type ExtractMethod =
  | "pdf-parse"
  | "pdf-parse-fallback"
  | "mammoth"
  | "word-extractor"
  | "cheerio"
  | "plain"
  | "unsupported"
  | "empty";

export type DocumentTextExtractResult = {
  text: string;
  mimeType: string;
  method: ExtractMethod;
  /** PDF page count or approximate word count for other formats. */
  pageOrWordCount?: number;
  warnings: string[];
  empty: boolean;
};

export const EXTRACTABLE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/html",
  "text/plain",
  "text/markdown",
] as const;

export type ExtractableMimeType = (typeof EXTRACTABLE_MIME_TYPES)[number];
