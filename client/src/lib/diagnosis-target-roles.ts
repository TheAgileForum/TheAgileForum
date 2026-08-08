/** Founder-approved Target role options for diagnosis step 1 (exact wording). */
export const DIAGNOSIS_TARGET_ROLES = [
  "Scrum Master/Agile Project Manager",
  "Product Owner/Product Manager",
  "Senior Project Manager(Technical)/Senior Agilist",
  "Delivery Lead /Senior Delivery Manager",
  "Program Manager/RTE",
  "Agile Coach/ Agile Transformation Lead",
] as const;

export type DiagnosisTargetRole = (typeof DIAGNOSIS_TARGET_ROLES)[number];

export const DEFAULT_DIAGNOSIS_TARGET_ROLE: DiagnosisTargetRole =
  DIAGNOSIS_TARGET_ROLES[0];

export function isDiagnosisTargetRole(value: string): value is DiagnosisTargetRole {
  return (DIAGNOSIS_TARGET_ROLES as readonly string[]).includes(value);
}

/**
 * Homepage “Choose your path” cards — one direction per Assessment target role.
 * `targetRole` must match DIAGNOSIS_TARGET_ROLES exactly for Step 1 prefill.
 */
export const ASSESSMENT_PATHWAYS = [
  {
    icon: "S",
    title: "Scrum Master / Agile PM",
    detail:
      "Interview-ready facilitation, ceremonies, and stakeholder confidence — built from your current baseline.",
    link: "Assessment for SM / APM →",
    targetRole: "Scrum Master/Agile Project Manager",
  },
  {
    icon: "P",
    title: "Product Owner / PM",
    detail:
      "Backlog mastery, discovery habits, and delivery partnership for people pivoting into PO/PM.",
    link: "Assessment for PO / PM →",
    targetRole: "Product Owner/Product Manager",
  },
  {
    icon: "T",
    title: "Senior PM / Senior Agilist",
    detail:
      "Technical project leadership and senior Agilist depth for complex delivery environments.",
    link: "Assessment for Senior PM →",
    targetRole: "Senior Project Manager(Technical)/Senior Agilist",
  },
  {
    icon: "D",
    title: "Delivery Lead / SDM",
    detail:
      "Cross-team delivery ownership, flow, and stakeholder alignment for Delivery Lead paths.",
    link: "Assessment for Delivery Lead →",
    targetRole: "Delivery Lead /Senior Delivery Manager",
  },
  {
    icon: "R",
    title: "Program Manager / RTE",
    detail:
      "ART facilitation, PI planning readiness, and program-scale leadership for RTE tracks.",
    link: "Assessment for RTE / Program →",
    targetRole: "Program Manager/RTE",
  },
  {
    icon: "C",
    title: "Agile Coach / Transformation",
    detail:
      "Coaching stances, org change, and transformation leadership beyond a single team.",
    link: "Assessment for Agile Coach →",
    targetRole: "Agile Coach/ Agile Transformation Lead",
  },
] as const satisfies ReadonlyArray<{
  icon: string;
  title: string;
  detail: string;
  link: string;
  targetRole: DiagnosisTargetRole;
}>;
