import { z } from "zod";
import { commerceJourneyOrigins } from "../commerce/journey-origin.js";

const commerceJourneyOriginProperty = z.enum(commerceJourneyOrigins).nullable().optional();

export const cartUpdatedEventSchema = z.object({
  cart_id: z.string().uuid(),
  line_count: z.number().int().min(0),
  commerce_journey_origin: commerceJourneyOriginProperty,
  guest: z.boolean(),
});

export const checkoutStartedEventSchema = z.object({
  order_id: z.string().uuid(),
  order_number: z.string().min(1),
  variant: z.enum(["standard", "org_reimbursement"]),
  commerce_journey_origin: commerceJourneyOriginProperty,
  currency: z.string().length(3),
  total_amount: z.string(),
});

export const checkoutConfirmedEventSchema = z.object({
  order_id: z.string().uuid(),
  order_number: z.string().min(1),
  commerce_journey_origin: commerceJourneyOriginProperty,
  currency: z.string().length(3),
  payment_mode: z.enum(["full_pay", "installment"]).default("full_pay"),
});

export const globalCartViewedEventSchema = z.object({
  line_count: z.number().int().min(0),
  guest: z.boolean(),
  surface: z.string().min(1).optional(),
});

export const globalCartClickedEventSchema = z.object({
  line_count: z.number().int().min(0),
  guest: z.boolean().optional(),
});

export const installmentOptionImpressionEventSchema = z.object({
  offer_id: z.string().min(1),
  currency: z.string().length(3),
  provider: z.string().min(1).optional(),
  geo: z.string().min(1).optional(),
});

export const installmentCheckoutStartedEventSchema = z.object({
  order_id: z.string().uuid(),
  provider: z.string().min(1),
  currency: z.string().length(3),
  commerce_journey_origin: commerceJourneyOriginProperty,
});

export const installmentCheckoutCompletedEventSchema = z.object({
  order_id: z.string().uuid(),
  provider: z.string().min(1),
  currency: z.string().length(3),
});

export const productEventSchemas = {
  cart_updated: cartUpdatedEventSchema,
  checkout_started: checkoutStartedEventSchema,
  checkout_confirmed: checkoutConfirmedEventSchema,
  global_cart_viewed: globalCartViewedEventSchema,
  global_cart_clicked: globalCartClickedEventSchema,
  installment_option_impression: installmentOptionImpressionEventSchema,
  installment_checkout_started: installmentCheckoutStartedEventSchema,
  installment_checkout_completed: installmentCheckoutCompletedEventSchema,
} as const;

export type ProductEventName = keyof typeof productEventSchemas;

export function validateProductEventProperties(
  event: string,
  properties: Record<string, unknown>,
): { ok: true } | { ok: false; issues: string[] } {
  const schema = productEventSchemas[event as ProductEventName];
  if (!schema) {
    return { ok: true };
  }

  const parsed = schema.safeParse(properties);
  if (parsed.success) {
    return { ok: true };
  }

  return {
    ok: false,
    issues: parsed.error.issues.map(
      (issue) => `${issue.path.join(".") || "root"}:${issue.message}`,
    ),
  };
}
