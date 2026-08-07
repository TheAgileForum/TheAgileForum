/** Founder-approved Target role options for diagnosis step 1 (exact wording). */
export const DIAGNOSIS_TARGET_ROLES = [
  "Scrum Master/Agile Project Manager",
  "Senior Project Manager(Technical)/Senior Agilist",
  "Delivery Lead /Senior Delivery Manager",
  "Program Manager/RTE",
  "Agile Coach/ Agile Transformation Lead",
] as const;

export type DiagnosisTargetRole = (typeof DIAGNOSIS_TARGET_ROLES)[number];

export const DEFAULT_DIAGNOSIS_TARGET_ROLE: DiagnosisTargetRole =
  DIAGNOSIS_TARGET_ROLES[0];
