export type ExamAccessPolicy = "free" | "paid" | "preview_only";

export type OfferingCategory = "training" | "certification" | "service";

export type OfferingMeta = {
  code: string;
  title: string;
  kind: "course" | "exam" | "certification_mock" | "service";
  category: OfferingCategory;
  scheduleBound: boolean;
  examAccess: ExamAccessPolicy;
  safeOrgPaymentEligible: boolean;
  defaultUnitPrice: string;
  currency: string;
  /**
   * Fixed list prices by session currency (skip FX from USD base).
   * Example: SAFe certs in India → INR 33999.
   */
  regionalUnitPrices?: Partial<Record<string, string>>;
  roleTags: string[];
  certBody?: string;
  deliveryMode: "live" | "self_paced";
  upcomingBatchId?: string;
  /** Public site path slug (theagileforum.com/courses/...). */
  slug?: string;
  certificationName?: string;
  summary?: string;
  durationHours?: number;
  /** Human-readable duration when hours are not appropriate (e.g. "3 weeks"). */
  durationLabel?: string;
  scheduleLabel?: string;
  cohortSchedules?: Array<{ id: string; label: string }>;
  includes?: string[];
  learningOutcomes?: string[];
};

export {
  OFFERING_STUB_CATALOG as OFFERING_CATALOG,
  listStubOfferings,
  listCertificationCourses,
  listTrainingCourses,
  resolveOfferingCode,
  OFFERING_CODE_ALIASES,
} from "./catalog-seed-data.js";

import {
  OFFERING_STUB_CATALOG,
  resolveOfferingCode,
} from "./catalog-seed-data.js";

/** Sync lookup against stub catalog (unit tests and checkout-policy). */
export function getOffering(code: string): OfferingMeta | undefined {
  return OFFERING_STUB_CATALOG[resolveOfferingCode(code)];
}

/** Sync list against stub catalog (unit tests and filter tests). */
export function listOfferings(): OfferingMeta[] {
  return Object.values(OFFERING_STUB_CATALOG);
}

export function listOfferingsByCategory(
  category: OfferingCategory,
): OfferingMeta[] {
  return listOfferings().filter((o) => o.category === category);
}
