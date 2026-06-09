import { z } from "zod";

export const createSessionBody = z.object({
  roleIntent: z.string().optional(),
  campaignId: z.string().optional(),
});

export const intentBody = z.object({
  targetRole: z.string().min(1),
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

export const jdBody = z
  .object({
    jdText: z.string().optional(),
    jdUrl: z.string().url().optional(),
    targetRole: z.string().min(1),
  })
  .refine((value) => Boolean(value.jdText?.trim() || value.jdUrl), {
    message: "Provide jdText or jdUrl",
    path: ["jdText"],
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
