# API Contract Matrix (UX-Aligned)

**Project:** The Agile Forum  
**Date:** 2026-05-27  
**Purpose:** Map each UX screen action to API contracts for FE/BE implementation.

---

## 1. Conventions

- Auth required: `Y/N`
- Idempotent: whether repeated requests must safely dedupe
- Events: minimum analytics/ops events emitted

---

## 2. Screen-to-API Matrix

| Screen / Action | Endpoint | Method | Auth | Request (key fields) | Response (key fields) | Idempotent | Events |
|---|---|---|---|---|---|---|---|
| Home -> Start Diagnosis | `/v1/diagnosis/session` | POST | N | `role_intent?`, `campaign_id?` | `diagnosis_session_id`, `next_step` | Y | `diagnosis_started` |
| Diagnosis Step 1 Save | `/v1/diagnosis/session/{id}/intent` | PUT | N/Y | `target_role`, `timeline`, `current_status`, `consent_ack` | `saved=true`, `next_step` | Y | `diagnosis_intent_saved` |
| Diagnosis Step 2 Upload Resume | `/v1/diagnosis/session/{id}/resume` | POST | N/Y | file + metadata | `resume_asset_id`, `validation_status` | Y | `resume_upload_attempted`, `resume_upload_succeeded/failed` |
| Diagnosis Step 2 Save JD | `/v1/diagnosis/session/{id}/jd` | PUT | N/Y | `jd_text|jd_url`, `target_role` | `saved=true` | Y | `jd_saved` |
| Diagnosis Step 2 Run Analysis | `/v1/diagnosis/session/{id}/analyze` | POST | N/Y | `run_reason` | `analysis_run_id`, `status=queued` | Y | `analysis_requested` |
| Diagnosis Step 3 Poll Status | `/v1/diagnosis/runs/{run_id}` | GET | N/Y | - | `status`, `stage`, `progress_pct`, `eta_s?` | N | `analysis_status_viewed` |
| Diagnosis Step 4 Fetch Results | `/v1/diagnosis/runs/{run_id}/result` | GET | N/Y | - | `readiness_score`, `insights`, `recommendation`, `rationale`, `primary_action` | N | `analysis_completed_viewed` |
| Save/Resume Journey | `/v1/journey-state/{session_or_user}` | GET | Y | - | `current_flow`, `current_step`, `resume_payload` | N | `journey_resumed` |
| Dashboard Aggregate | `/v1/dashboard` | GET | Y | `view_mode?` | `skill_cards`, `roadmap_tasks`, `saved_items`, `next_action` | N | `dashboard_viewed` |
| Update Roadmap Task | `/v1/roadmap/tasks/{task_id}` | PATCH | Y | `status`, `notes?` | `updated_task`, `progress_summary` | Y | `roadmap_task_updated` |
| Micro Exam Start | `/v1/assessments/{assessment_id}/attempts` | POST | Y | `mode`, `time_limit_override?` | `attempt_id`, `expires_at`, `first_question` | Y | `assessment_started` |
| Micro Exam Submit Answer | `/v1/assessment-attempts/{attempt_id}/answers` | POST | Y | `question_id`, `answer` | `accepted=true`, `next_question` | Y | `assessment_answer_submitted` |
| Micro Exam Complete | `/v1/assessment-attempts/{attempt_id}/complete` | POST | Y | `complete_reason` | `score`, `strengths`, `gaps`, `updated_recommendation` | Y | `assessment_completed` |
| Offer Detail Load | `/v1/offers/{offer_id}` | GET | N/Y | `country?`, `currency_override?` | `offer`, `schedule_required`, `price_quote`, `trust_block` | N | `offer_viewed` |
| Validate Schedule | `/v1/cart/validate-schedule` | POST | Y | `offer_id`, `schedule_id` | `valid=true/false`, `errors[]` | Y | `schedule_validation` |
| Checkout Create | `/v1/checkout/sessions` | POST | Y | `cart_id`, `geo`, `currency`, `org_checkout?` | `checkout_session_id`, `payment_intent_ref` | Y | `checkout_started` |
| Checkout Confirm (Standard) | `/v1/checkout/sessions/{id}/confirm` | POST | Y | `payment_method_ref` | `order_id`, `status` | Y | `checkout_confirmed` |
| Org Checkout Submit | `/v1/checkout/sessions/{id}/org-request` | POST | Y | `company_name`, `billing_contact`, `reference_details` | `org_request_id`, `status` | Y | `org_checkout_submitted` |
| Mentor Slots | `/v1/mentor/slots` | GET | Y | `timezone`, `date_range` | `slots[]` | N | `mentor_slots_viewed` |
| Mentor Quote (Geo) | `/v1/mentor/quote` | POST | Y | `country_detected`, `country_override?` | `amount`, `currency`, `pricing_rule_id` | Y | `mentor_quote_generated` |
| Mentor Booking Create (Paid) | `/v1/mentor/bookings` | POST | Y | `slot_id`, `goal_text`, `focus_area`, `quote_id` | `booking_id`, `payment_required=true`, `amount`, `currency` | Y | `mentor_booking_started` |
| Mentor Booking Pay+Confirm | `/v1/mentor/bookings/{id}/confirm-payment` | POST | Y | `payment_method_ref` | `booking_status=confirmed`, `invite_details` | Y | `mentor_booking_completed` |
| Webinar List | `/v1/webinars` | GET | N/Y | `role?`, `topic?`, `date?` | `webinars[]` | N | `webinar_list_viewed` |
| Webinar Register | `/v1/webinars/{id}/registrations` | POST | Y | `reminder_opt_in` | `registration_id`, `confirmation_status` | Y | `webinar_registered` |
| Attendance Verify | `/v1/webinars/{id}/attendance/verify` | POST | Y | `attendance_code` | `verified`, `certificate_eligibility` | Y | `attendance_verified` |
| AI Coach Chat | `/v1/ai/chat` | POST | N/Y | `context_screen`, `context_payload`, `message` | `reply`, `confidence`, `next_action`, `escalation_available` | N | `ai_chat_asked`, `ai_chat_replied` |
| AI Feedback | `/v1/ai/messages/{id}/feedback` | POST | Y | `helpful`, `correct`, `comment?` | `captured=true` | Y | `ai_feedback_submitted` |
| Profile/Prefs Update | `/v1/profile/preferences` | PUT | Y | `role_goal`, `interests[]`, `channels[]`, `consent_flags` | `saved=true`, `effective_from` | Y | `preferences_updated` |

---

## 3. Required Validation Rules

1. **Diagnosis consent gate:** `consent_ack=true` required before analyze call.
2. **Schedule gate:** cannot proceed checkout on schedule-bound offering without `schedule_id`.
3. **Mentor geo pricing gate:** quote amount must resolve from pricing rules:
   - `US -> USD 9`
   - `IN -> INR 49`
   server-side enforcement mandatory (UI display is advisory only).
4. **Auth continuation:** checkout and paid booking APIs require authenticated session.
5. **Primary action payload:** result/recommendation APIs always return one explicit `primary_action`.

---

## 4. Error Contract Standard (All APIs)

```json
{
  "error_code": "string",
  "message": "human-readable",
  "field_errors": [{ "field": "string", "message": "string" }],
  "retryable": true,
  "trace_id": "uuid"
}
```

---

## 5. Versioning and Compatibility

- Use `/v1` prefix for all production contracts.
- Breaking change requires:
  - deprecation notice,
  - dual-read/write or adapter period,
  - frontend rollout flag.
