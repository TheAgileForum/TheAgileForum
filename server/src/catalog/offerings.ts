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
  roleTags: string[];
  certBody?: string;
  deliveryMode: "live" | "self_paced";
  upcomingBatchId?: string;
};

export {
  OFFERING_STUB_CATALOG as OFFERING_CATALOG,
  listStubOfferings,
} from "./catalog-seed-data.js";

import { OFFERING_STUB_CATALOG } from "./catalog-seed-data.js";

/** Sync lookup against stub catalog (unit tests and checkout-policy). */
export function getOffering(code: string): OfferingMeta | undefined {
  return OFFERING_STUB_CATALOG[code];
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
