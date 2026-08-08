import { describe, expect, it } from "vitest";
import { formatScheduleLabelForGeo } from "./schedule-timezone";

const BATCH_1 = "Batch 1 · 10:30 AM–12:00 PM IST / 10:00 PM–11:30 PM PST / 9:00–10:30 AM UAE";
const BATCH_2 =
  "Batch 2 · 7:30 PM–9:00 PM IST / 10:00 AM–11:30 AM EST / 3:00–4:30 PM BST / 6:00–7:30 PM UAE";

describe("formatScheduleLabelForGeo — authored timezone match", () => {
  it("shows only the IST window for India", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "IN")).toBe("Batch 1 · 10:30 AM–12:00 PM IST");
    expect(formatScheduleLabelForGeo(BATCH_2, "IN")).toBe("Batch 2 · 7:30 PM–9:00 PM IST");
  });

  it("shows the US window for the United States", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "US")).toBe("Batch 1 · 10:00 PM–11:30 PM PST");
    expect(formatScheduleLabelForGeo(BATCH_2, "US")).toBe("Batch 2 · 10:00 AM–11:30 AM EST");
  });

  it("shows the UAE window for the Emirates", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "AE")).toBe("Batch 1 · 9:00–10:30 AM UAE");
    expect(formatScheduleLabelForGeo(BATCH_2, "AE")).toBe("Batch 2 · 6:00–7:30 PM UAE");
  });

  it("uses the authored BST window when present (UK, batch 2)", () => {
    expect(formatScheduleLabelForGeo(BATCH_2, "GB")).toBe("Batch 2 · 3:00–4:30 PM BST");
  });
});

describe("formatScheduleLabelForGeo — converted from IST anchor", () => {
  it("converts to BST for the UK when no BST segment is authored (batch 1)", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "GB")).toBe("Batch 1 · 6:00 AM–7:30 AM BST");
  });

  it("converts to CET for Europe on both batches", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "NL")).toBe("Batch 1 · 7:00 AM–8:30 AM CET");
    expect(formatScheduleLabelForGeo(BATCH_2, "NL")).toBe("Batch 2 · 4:00 PM–5:30 PM CET");
  });

  it("converts to WAT for Nigeria", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "NG")).toBe("Batch 1 · 6:00 AM–7:30 AM WAT");
  });

  it("converts to AEST for Australia", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "AU")).toBe("Batch 1 · 3:00 PM–4:30 PM AEST");
  });

  it("converts to WIB for Indonesia", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "ID")).toBe("Batch 1 · 12:00 PM–1:30 PM WIB");
  });

  it("converts to SGT for Singapore", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "SG")).toBe("Batch 1 · 1:00 PM–2:30 PM SGT");
  });

  it("converts to BRT for Brazil", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "BR")).toBe("Batch 1 · 2:00 AM–3:30 AM BRT");
  });
});

describe("formatScheduleLabelForGeo — fallbacks", () => {
  it("keeps the full label when geo is missing or unknown", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, undefined)).toBe(BATCH_1);
    expect(formatScheduleLabelForGeo(BATCH_1, "")).toBe(BATCH_1);
    expect(formatScheduleLabelForGeo(BATCH_1, "ZZ")).toBe(BATCH_1);
  });

  it("leaves labels without timezone segments untouched", () => {
    const plain = "Cohort 7 Jul – 27 Jul 2026 · 1.5 hr class weekdays (Mon–Fri)";
    expect(formatScheduleLabelForGeo(plain, "IN")).toBe(plain);
    expect(formatScheduleLabelForGeo("July 2026 cohort", "GB")).toBe("July 2026 cohort");
  });

  it("is case-insensitive on the geo code", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "gb")).toBe("Batch 1 · 6:00 AM–7:30 AM BST");
  });
});
