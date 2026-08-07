import {
  POWER_RESUME_LEGACY_ROUTE_SEGMENTS,
  POWER_RESUME_OFFER_CODE,
  POWER_RESUME_PUBLIC_SLUG,
} from "./offer-routes";

/** Default / non-India catalog title for the resume service. */
export const POWER_RESUME_TITLE_INTERNATIONAL =
  "New Resume With Cover Letter & Linkedin Upgrade";

/** India (INR / geo IN) catalog title — Naukri + LinkedIn positioning. */
export const POWER_RESUME_TITLE_INDIA = "New Resume & Naukri + Linkedin Upgrade";

const POWER_RESUME_CODES = new Set([
  POWER_RESUME_OFFER_CODE,
  POWER_RESUME_PUBLIC_SLUG,
  ...POWER_RESUME_LEGACY_ROUTE_SEGMENTS,
]);

export function isIndiaCatalogRegion(opts: {
  currency?: string | null;
  geo?: string | null;
} = {}): boolean {
  const currency = (opts.currency ?? "").trim().toUpperCase();
  const geo = (opts.geo ?? "").trim().toUpperCase();
  return currency === "INR" || geo === "IN";
}

export function isPowerResumeOffering(code: string): boolean {
  return POWER_RESUME_CODES.has(code);
}

/**
 * Geo/currency-aware display title. Keeps stable commerce codes unchanged;
 * only overrides the resume service for India (INR/IN).
 */
export function displayOfferingTitle(
  code: string,
  fallbackTitle: string,
  opts: { currency?: string | null; geo?: string | null } = {},
): string {
  if (!isPowerResumeOffering(code)) return fallbackTitle;
  return isIndiaCatalogRegion(opts)
    ? POWER_RESUME_TITLE_INDIA
    : POWER_RESUME_TITLE_INTERNATIONAL;
}

/** India listing copy: Naukri stands in for cover-letter positioning. */
export function displayOfferingIncludes(
  code: string,
  includes: string[] | undefined,
  opts: { currency?: string | null; geo?: string | null } = {},
): string[] | undefined {
  if (!includes?.length || !isPowerResumeOffering(code) || !isIndiaCatalogRegion(opts)) {
    return includes;
  }
  return includes.map((line) =>
    /cover letter/i.test(line)
      ? "Naukri profile upgrade to maximize job opportunities with skills"
      : line,
  );
}

export function displayOfferingSummary(
  code: string,
  summary: string | undefined,
  opts: { currency?: string | null; geo?: string | null } = {},
): string | undefined {
  if (!summary || !isPowerResumeOffering(code) || !isIndiaCatalogRegion(opts)) {
    return summary;
  }
  return (
    "Get a personalized new resume with the right keywords, achievements, and skills for Scrum, Agile PM, and product roles — plus Naukri and LinkedIn upgrades to maximize job opportunities with skills. Choose from multiple professional formats."
  );
}
