# Solution Architecture Aligned to UX Specification

**Project:** The Agile Forum  
**Date:** 2026-05-27  
**Inputs:** `ux-design-specification.md`, `wireframe-screen-specs.md`, `prd-agile-forum.md`, `final-technical-architecture-design-agile-forum.md`

---

## 1. Architecture Objective

Translate the approved UX journeys into an implementation-ready technical architecture that preserves:

- clarity-first diagnosis experience,
- trust-first recommendation and purchase flow,
- retention loop (dashboard + micro-exams),
- governed AI assistance,
- reliable event-driven operations.

---

## 2. System Context (Runtime Topology)

## 2.1 Channels

- **Public Experience (Wix):** SEO pages, trust surfaces, campaign landings.
- **Product UX App (Web):** Diagnosis, dashboard, mentor booking, checkout, AI coach, profile.

## 2.2 Core Backend

- **API Gateway / BFF (FastAPI):** session-aware APIs for frontend.
- **Domain Services:**
  - Identity/Consent
  - Diagnosis/Pathway
  - Recommendation/Pricing
  - Mentor Booking
  - Checkout/Orders
  - Webinar Lifecycle
  - Dashboard/Assessments
  - AI Orchestration
  - Notification/Automation
- **Async Runtime:** Redis + worker + scheduler.

## 2.3 Platform

- **Supabase Postgres:** source of truth.
- **Supabase Auth:** user identity/session primitives.
- **Supabase Storage:** resumes, certificates, downloadable artifacts.
- **pgvector (if needed):** retrieval context for AI grounding.

## 2.4 Integrations

- Stripe (payments)
- OpenRouter (LLM gateway)
- MS Teams/webinar provider
- Email + Telegram (ops and lifecycle notifications)
- PostHog + Clarity (product + behavior analytics)
- Sentry (error/incident telemetry)

---

## 3. UX Journey -> Service Boundary Mapping

## J1: Discovery -> Diagnose

- Screens: Home, Diagnosis Step 1-3.
- Services:
  - `identity-consent-service` (consent capture, session gate)
  - `diagnosis-service` (resume/JD intake, processing orchestration)
  - `ai-coach-service` (support fallback during long-running steps)
- Key pattern: draft persistence + resumability.

## J2: Results -> Recommendation -> Action

- Screens: Diagnosis Step 4, Recommendation Detail.
- Services:
  - `diagnosis-service` (gap output)
  - `recommendation-service` (fit ranking, rationale)
  - `pricing-service` (geo-aware display, consistent price contract)
- Key pattern: one dominant CTA + explainability.

## J3: Offer -> Checkout -> Enrollment

- Screens: Checkout + success.
- Services:
  - `checkout-service` (cart/session continuity)
  - `payment-service` (Stripe intent/webhook lifecycle)
  - `order-service` (order confirmation artifacts)
- Key pattern: auth gate and branch-safe flow.

## J4: Retention Loop

- Screens: Dashboard, Micro-exam.
- Services:
  - `dashboard-service` (aggregate learner state)
  - `assessment-service` (exam lifecycle + scoring)
  - `recommendation-service` (post-score recalculation)
- Key pattern: continuity rail + post-action next-best-action refresh.

## J5: Support and Re-entry

- Screens: Webinar Hub, Paid Mentor Call Booking, AI Coach.
- Services:
  - `webinar-service`
  - `mentor-booking-service`
  - `ai-coach-service`
  - `notification-service`
- Key pattern: alternate support channels always route back to paid/learning next action.

---

## 4. Domain Data Model (High-Level)

- `users`, `profiles`, `consents`, `sessions`
- `diagnosis_runs`, `resume_assets`, `jd_inputs`, `gap_insights`
- `role_pathways`, `roadmap_tasks`, `task_progress`
- `recommendations`, `recommendation_rationales`, `pricing_quotes`
- `mentor_slots`, `mentor_bookings`, `mentor_booking_payments`
- `carts`, `cart_items`, `orders`, `payments`
- `webinars`, `registrations`, `attendance_codes`, `feedback`, `certificates`
- `assessment_definitions`, `assessment_attempts`, `assessment_scores`
- `bookmarks`, `saved_views`
- `ai_sessions`, `ai_messages`, `ai_feedback`, `escalations`
- `events`, `jobs`, `delivery_logs`, `audit_logs`

---

## 5. Critical Architecture Rules from UX

1. **Single Next Action Rule:** Backend returns one `primary_action` + optional alternatives.
2. **Resumability Rule:** Any interrupted flow can be resumed via a persisted `journey_state`.
3. **Pricing Consistency Rule:** Any surface asking for payment reads from the same pricing resolver.
4. **Explainability Rule:** Recommendation payload always includes short rationale and confidence.
5. **Geo-Pricing Rule (Mentor Booking):** Mentor call fee must resolve to `$9` (US) or `INR 49` (India), with user override and server-side validation.

---

## 6. Reliability and Security Guardrails

- Idempotency keys for payment, booking, and enrollment events.
- Retry + DLQ for notification/automation jobs.
- PII-safe logging (no raw resume payload in logs).
- Consent enforcement before outreach actions.
- Role-based access for admin controls.
- Signed webhook validation for payment and external callbacks.

---

## 7. Implementation Phasing (Architecture-Centric)

## Phase A (Sprint 1): Core conversion architecture

- Identity/consent + diagnosis pipeline + recommendation payload contract.
- Pricing resolver + checkout service baseline.
- Event schema v1 and telemetry wrappers.

## Phase B (Sprint 2): Retention/support architecture

- Dashboard aggregation + assessments.
- Webinar + mentor booking services.
- Notification orchestration and booking/payment reconciliation.

## Phase C (Sprint 3): Intelligence/hardening

- AI orchestration and escalation governance.
- Cross-service observability and SLA dashboards.
- Accessibility + consistency compliance gate across all endpoints/states.

---

## 8. Open Architecture Decisions

1. **BFF shape:** single API gateway vs route-level domain APIs to frontend.
2. **Vector strategy:** Postgres/pgvector only vs external retrieval store later.
3. **Mentor geo source precedence:** IP, user profile country, payment country.
4. **Checkout currency policy:** when user override conflicts with geo recommendation.
5. **Event bus evolution:** Redis-only in MVP vs managed event backbone after scale.

---

## 9. Architecture Readiness Exit Criteria

- All UX-critical journeys mapped to concrete service boundaries.
- API contract matrix completed for each screen transition.
- Event contracts defined for funnel, operations, and QA verification.
- Data model and state transitions validated for resumability.
- Security, consent, and reliability gates explicitly defined.

