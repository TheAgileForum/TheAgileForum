import { z } from "zod";

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

export const createSessionBody = z.object({
  roleIntent: z.string().optional(),
  campaignId: z.string().optional(),
});

export const intentBody = z.object({
  targetRole: z.enum(DIAGNOSIS_TARGET_ROLES),
  timeline: z.string().min(1),
  currentStatus: z.string().min(1),
  consentAck: z.literal(true),
  policyVersion: z.string().min(1).default("diagnosis-v1"),
  roleIntent: z.string().optional(),
});

export const resumeBody = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  checksum: z.string().optional(),
});

export const jdBody = z.object({
  jdText: z.string().optional(),
  jdUrl: z.string().url().optional(),
  targetRole: z.string().min(1),
});

export const analyzeBody = z.object({
  runReason: z.string().optional(),
});

export type PrimaryAction = {
  type: "offer" | "assessment" | "webinar" | "mentor";
  label: string;
  href: string;
  offeringCode?: string;
};

export type RationaleChip = {
  label: string;
  detail: string;
};
