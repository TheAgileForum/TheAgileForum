import {
  EXTRACTABLE_MIME_TYPES,
  type ExtractableMimeType,
} from "./types.js";

const EXT_TO_MIME: Record<string, ExtractableMimeType> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".html": "text/html",
  ".htm": "text/html",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
};

const allowed = new Set<string>(EXTRACTABLE_MIME_TYPES);

/** Normalize browser/OS mime quirks (e.g. empty type, octet-stream). */
export function resolveExtractMimeType(
  mimeType: string | undefined,
  fileName?: string,
): ExtractableMimeType | null {
  const trimmed = (mimeType ?? "").trim().toLowerCase();
  if (trimmed && allowed.has(trimmed)) {
    return trimmed as ExtractableMimeType;
  }

  // Some browsers send DOC/DOCX as octet-stream or empty.
  if (fileName) {
    const lower = fileName.toLowerCase();
    const dot = lower.lastIndexOf(".");
    if (dot >= 0) {
      const ext = lower.slice(dot);
      const fromExt = EXT_TO_MIME[ext];
      if (fromExt) return fromExt;
    }
  }

  // text/x-markdown and similar
  if (trimmed === "text/x-markdown" || trimmed === "text/x-web-markdown") {
    return "text/markdown";
  }

  return null;
}

export function isExtractableMimeType(mimeType: string): boolean {
  return allowed.has(mimeType);
}
