export type ExamAccessPolicy = "free" | "paid" | "preview_only";

export type OfferingMeta = {
  code: string;
  title: string;
  kind: "course" | "exam" | "certification_mock";
  scheduleBound: boolean;
  examAccess: ExamAccessPolicy;
  safeOrgPaymentEligible: boolean;
  defaultUnitPrice: string;
  currency: string;
  roleTags: string[];
};

export const OFFERING_CATALOG: Record<string, OfferingMeta> = {
  "agile-readiness": {
    code: "agile-readiness",
    title: "Agile Readiness Program",
    kind: "course",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "299.00",
    currency: "USD",
    roleTags: ["learner", "scrum_master", "product_owner"],
  },
  "course-agile-fundamentals": {
    code: "course-agile-fundamentals",
    title: "Agile Fundamentals (Cohort)",
    kind: "course",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "299.00",
    currency: "USD",
    roleTags: ["learner", "scrum_master"],
  },
  "exam-practice-free": {
    code: "exam-practice-free",
    title: "Free Practice Exam",
    kind: "exam",
    scheduleBound: false,
    examAccess: "free",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "0.00",
    currency: "USD",
    roleTags: ["learner"],
  },
  "exam-mock-certification": {
    code: "exam-mock-certification",
    title: "Mock Certification Exam",
    kind: "certification_mock",
    scheduleBound: false,
    examAccess: "paid",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "49.00",
    currency: "USD",
    roleTags: ["learner"],
  },
  "safe-leading-safe": {
    code: "safe-leading-safe",
    title: "SAFe Leading SAFe",
    kind: "course",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: true,
    defaultUnitPrice: "999.00",
    currency: "USD",
    roleTags: ["learner", "safe_program_consultant"],
  },
};

export function getOffering(code: string): OfferingMeta | undefined {
  return OFFERING_CATALOG[code];
}

export function listOfferings(): OfferingMeta[] {
  return Object.values(OFFERING_CATALOG);
}
