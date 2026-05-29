# UX to Service Traceability Matrix

**Project:** The Agile Forum  
**Date:** 2026-05-27  
**Purpose:** Ensure every UX screen and interaction has explicit backend ownership.

---

## 1. Screen-Level Traceability


| UX Screen             | Primary Service              | Supporting Services                                          | Core Entities                                      | Critical Events                                      |
| --------------------- | ---------------------------- | ------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- |
| Home                  | `content-experience-service` | `recommendation-service`, `webinar-service`                  | `landing_modules`, `pathway_cards`                 | `home_viewed`, `hero_cta_clicked`                    |
| Diagnosis Step 1      | `identity-consent-service`   | `diagnosis-service`                                          | `diagnosis_sessions`, `consents`                   | `diagnosis_intent_saved`                             |
| Diagnosis Step 2      | `diagnosis-service`          | `file-intake-service`                                        | `resume_assets`, `jd_inputs`                       | `resume_upload_`*, `analysis_requested`              |
| Diagnosis Step 3      | `diagnosis-service`          | `job-orchestrator-service`                                   | `analysis_runs`, `job_status`                      | `analysis_stage_updated`                             |
| Diagnosis Step 4      | `diagnosis-service`          | `recommendation-service`, `pricing-service`                  | `gap_insights`, `recommendations`                  | `analysis_completed_viewed`                          |
| Dashboard             | `dashboard-service`          | `roadmap-service`, `recommendation-service`                  | `skill_scores`, `roadmap_tasks`, `bookmarks`       | `dashboard_viewed`, `roadmap_task_updated`           |
| Micro-Exam            | `assessment-service`         | `dashboard-service`, `recommendation-service`                | `assessment_attempts`, `assessment_scores`         | `assessment_started`, `assessment_completed`         |
| Offer Detail          | `catalog-offer-service`      | `pricing-service`, `trust-compliance-service`                | `offers`, `price_quotes`, `proof_assets`           | `offer_viewed`                                       |
| Checkout              | `checkout-service`           | `payment-service`, `order-service`, `auth-service`           | `carts`, `orders`, `payments`                      | `checkout_started`, `checkout_confirmed`             |
| Checkout Success      | `order-service`              | `notification-service`, `community-link-service`             | `order_confirmations`                              | `order_confirmed`                                    |
| Webinar Hub           | `webinar-service`            | `notification-service`                                       | `webinars`, `registrations`                        | `webinar_registered`                                 |
| Mentor Booking (Paid) | `mentor-booking-service`     | `pricing-service`, `payment-service`, `notification-service` | `mentor_slots`, `mentor_quotes`, `mentor_bookings` | `mentor_booking_started`, `mentor_booking_completed` |
| AI Coach              | `ai-coach-service`           | `knowledge-service`, `escalation-service`                    | `ai_sessions`, `ai_messages`, `ai_feedback`        | `ai_chat_*`, `ai_feedback_submitted`                 |
| Profile/Preferences   | `profile-service`            | `consent-service`, `campaign-preference-service`             | `profiles`, `preferences`, `consent_flags`         | `preferences_updated`                                |


---

## 2. Interaction-Level Ownership


| UX Interaction                  | Service Owner                                | Notes                                                         |
| ------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| Start diagnosis CTA             | `diagnosis-service`                          | Creates/loads diagnosis session                               |
| Resume upload validation        | `file-intake-service`                        | Security and type/size validation                             |
| Run analysis                    | `diagnosis-service`                          | Async pipeline and status transitions                         |
| Show one primary action         | `recommendation-service`                     | Must always return deterministic `primary_action`             |
| Schedule-required checkout rule | `checkout-service`                           | Server-side enforcement                                       |
| Geo-based mentor call price     | `pricing-service` + `mentor-booking-service` | US `$9`; India `INR 49`; override supported; server validates |
| AI low-confidence escalation    | `ai-coach-service`                           | Escalation to support/mentor                                  |
| Continue where left off         | `journey-state-service`                      | Cross-screen state persistence                                |


---

## 3. FR/NFR to Service Coverage


| Requirement Cluster                               | Service Coverage                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| Diagnosis and roadmap (FR-4..7, FR-158..160)      | `diagnosis-service`, `roadmap-service`, `recommendation-service`                  |
| Dashboard and assessments (FR-8..11, FR-131..132) | `dashboard-service`, `assessment-service`                                         |
| Offer/checkout (FR-12..16, FR-151..157)           | `catalog-offer-service`, `pricing-service`, `checkout-service`, `payment-service` |
| Discovery call paid booking (FR-39 updated)       | `mentor-booking-service`, `pricing-service`, `payment-service`                    |
| AI guidance (FR-20..22, FR-126..129)              | `ai-coach-service`, `knowledge-service`                                           |
| Webinar lifecycle (FR-30..34, FR-79..84)          | `webinar-service`, `notification-service`                                         |
| Accessibility/compliance (NFR-C*)                 | all frontend-facing services + `trust-compliance-service`                         |


---

## 4. Traceability Gaps to Resolve

1. Final ownership for `journey-state-service` (standalone vs dashboard module).
2. Pricing rule administration UI ownership (admin service vs pricing service).
3. Event schema governance owner (platform team vs analytics team).
4. Escalation routing target system (ticketing/CRM integration boundary).

---

## 5. Acceptance Rule for Traceability

No UX story may enter development unless:

- it maps to a primary service owner,
- dependent services are identified,
- API contract row exists in `api-contract-matrix.md`,
- analytics events are listed.