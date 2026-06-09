/** Lightweight client analytics — Clarity + PostHog when configured; dev console otherwise. */

import { capturePosthogEvent } from "./posthog.ts";

export type AnalyticsEvent =
  | "home_hero_cta_click"
  | "home_continue_journey_click"
  | "home_pathway_card_click"
  | "home_webinar_register_click"
  | "diagnosis_resume_upload_success"
  | "diagnosis_resume_upload_failure"
  | "diagnosis_analysis_timeout"
  | "offer_view"
  | "offer_proceed_checkout"
  | "checkout_org_submitted"
  | "diagnosis_results_viewed"
  | "diagnosis_primary_cta_click"
  | "diagnosis_secondary_action_click"
  | "diagnosis_mentor_escalation_click"
  | "catalog_list_viewed"
  | "catalog_filter_applied"
  | "catalog_add_to_cart"
  | "global_cart_viewed"
  | "global_cart_clicked"
  | "checkout_started"
  | "coupon_applied"
  | "installment_checkout_started"
  | "installment_option_impression"
  | "cart_line_removed"
  | "upsell_impression"
  | "upsell_click";

export function trackEvent(name: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
  if (import.meta.env.DEV) {
    console.debug("[analytics]", name, props ?? {});
  }
  capturePosthogEvent(name, props);
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("event", name);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        window.clarity("set", `af_${key}`, String(value));
      }
    }
  }
}
