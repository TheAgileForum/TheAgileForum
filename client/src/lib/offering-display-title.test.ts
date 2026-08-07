import { describe, expect, it } from "vitest";
import {
  POWER_RESUME_TITLE_INDIA,
  POWER_RESUME_TITLE_INTERNATIONAL,
  displayOfferingIncludes,
  displayOfferingTitle,
  isIndiaCatalogRegion,
} from "./offering-display-title";

describe("offering display title", () => {
  it("detects India via INR or geo IN", () => {
    expect(isIndiaCatalogRegion({ currency: "INR" })).toBe(true);
    expect(isIndiaCatalogRegion({ geo: "IN" })).toBe(true);
    expect(isIndiaCatalogRegion({ currency: "USD", geo: "US" })).toBe(false);
  });

  it("uses Naukri title for India resume offer", () => {
    expect(
      displayOfferingTitle(
        "service-power-resume-cover-letter",
        "ignored",
        { currency: "INR", geo: "IN" },
      ),
    ).toBe(POWER_RESUME_TITLE_INDIA);
  });

  it("uses Cover Letter title for non-India resume offer", () => {
    expect(
      displayOfferingTitle(
        "service-power-resume-cover-letter",
        "ignored",
        { currency: "USD", geo: "US" },
      ),
    ).toBe(POWER_RESUME_TITLE_INTERNATIONAL);
    expect(
      displayOfferingTitle("power-resume-cover-letter", "ignored", {
        currency: "EUR",
      }),
    ).toBe(POWER_RESUME_TITLE_INTERNATIONAL);
  });

  it("leaves other offerings unchanged", () => {
    expect(
      displayOfferingTitle("course-agile-fundamentals", "Mentorship", {
        currency: "INR",
      }),
    ).toBe("Mentorship");
  });

  it("maps cover-letter include to Naukri for India", () => {
    expect(
      displayOfferingIncludes(
        "service-power-resume-cover-letter",
        ["Cover letter with role-specific keywords"],
        { currency: "INR" },
      ),
    ).toEqual([
      "Naukri profile upgrade to maximize job opportunities with skills",
    ]);
  });
});
