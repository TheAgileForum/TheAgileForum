import { z } from "zod";

export const commerceJourneyOrigins = [
  "guided",
  "catalog_trainings",
  "catalog_certifications",
  "catalog_services",
  "campaign_deep_link",
] as const;

export type CommerceJourneyOrigin = (typeof commerceJourneyOrigins)[number];

export const commerceJourneyOriginSchema = z
  .enum(commerceJourneyOrigins)
  .optional();
