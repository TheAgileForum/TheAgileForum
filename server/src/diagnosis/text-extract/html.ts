import * as cheerio from "cheerio";

export function extractHtmlText(buffer: Buffer): { text: string; warnings: string[] } {
  const html = buffer.toString("utf8");
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, svg, template").remove();
  const text = $("body").length ? $("body").text() : $.root().text();
  const normalized = normalizeWhitespace(text);
  return {
    text: normalized,
    warnings: normalized ? [] : ["No text found in HTML"],
  };
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
