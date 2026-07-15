import { describe, expect, it } from "vitest";
import { formatScheduleLabelForGeo } from "./schedule-timezone";

const BATCH_1 = "Batch 1 · 10:30 AM–12:00 PM IST / 10:00 PM–11:30 PM PST / 9:00–10:30 AM UAE";
const BATCH_2 =
  "Batch 2 · 7:30 PM–9:00 PM IST / 10:00 AM–11:30 AM EST / 3:00–4:30 PM BST / 6:00–7:30 PM UAE";

describe("formatScheduleLabelForGeo", () => {
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
  });

  it("shows the UK window for Great Britain", () => {
    expect(formatScheduleLabelForGeo(BATCH_2, "GB")).toBe("Batch 2 · 3:00–4:30 PM BST");
  });

  it("keeps the full label when the geo timezone is not represented", () => {
    // Nigeria has no matching segment in the label.
    expect(formatScheduleLabelForGeo(BATCH_1, "NG")).toBe(BATCH_1);
  });

  it("keeps the full label when geo is missing or unknown", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, undefined)).toBe(BATCH_1);
    expect(formatScheduleLabelForGeo(BATCH_1, "")).toBe(BATCH_1);
    expect(formatScheduleLabelForGeo(BATCH_1, "ZZ")).toBe(BATCH_1);
  });

  it("leaves labels without timezone segments untouched", () => {
    const plain = "Cohort 7 Jul – 27 Jul 2026 · 1.5 hr class weekdays (Mon–Fri)";
    expect(formatScheduleLabelForGeo(plain, "IN")).toBe(plain);
    expect(formatScheduleLabelForGeo("July 2026 cohort", "IN")).toBe("July 2026 cohort");
  });

  it("is case-insensitive on the geo code", () => {
    expect(formatScheduleLabelForGeo(BATCH_1, "in")).toBe("Batch 1 · 10:30 AM–12:00 PM IST");
  });
});
