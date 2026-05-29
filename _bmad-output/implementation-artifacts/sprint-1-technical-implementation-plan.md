# Sprint 1 Technical Implementation Plan

**Project:** The Agile Forum  
**Date:** 2026-05-27  
**Sprint Goal:** Deliver core conversion architecture and first working slice of diagnosis -> recommendation -> checkout.  
**Scope:** EPIC-UX-01, EPIC-UX-02, EPIC-UX-03 (MVP subset)

---

## 1. Sprint 1 Outcomes

By end of Sprint 1, the team should have:

1. Working diagnosis flow (Step 1-4) with resumable state.
2. Recommendation result contract with one primary CTA.
3. Checkout path with auth gate, schedule validation, and standard payment confirmation.
4. Event instrumentation for core funnel milestones.
5. DB schema and migrations for all Sprint 1 entities.

Out of scope for Sprint 1:
- Dashboard and micro-exam full implementation (Sprint 2).
- Paid mentor booking payment flow (Sprint 2; architecture ready).
- AI coach production behavior (Sprint 3 baseline).

---

## 2. Team Allocation (Suggested)

| Track | Owner | Focus |
|---|---|---|
| Backend Core | BE Lead | Domain services, migrations, API contracts |
| Frontend Web | FE Lead | Home, diagnosis UI, offer/checkout UI |
| QA | QA Lead | Contract, journey, payment, accessibility tests |
| Analytics | Data/Platform | Event schema + PostHog validation |
| DevOps | Platform | Redis/worker, env config, observability hooks |

---

## 3. Sprint 1 Work Breakdown (By Week)

## Week 1: Foundation + Contracts
- Finalize API schemas (OpenAPI draft).
- Create DB migrations for Sprint 1 tables.
- Implement auth/session middleware and error envelope.
- Implement journey-state persistence service.
- FE shell + routing skeleton for Sprint 1 screens.

## Week 2: Diagnosis Pipeline
- Implement diagnosis session/intent/resume/JD endpoints.
- Implement analysis job orchestration + status polling.
- Build diagnosis Step 1-3 UI.
- Integration tests for interrupted diagnosis flow.

## Week 3: Results + Recommendation + Checkout
- Implement analysis result payload contract.
- Implement recommendation service (primary action + rationale).
- Implement offer detail + schedule validation + checkout create/confirm.
- Build diagnosis result and checkout UI.
- End-to-end conversion smoke test.

---

## 4. Endpoint-by-Endpoint Implementation Plan

## 4.1 Home and Journey Bootstrap

| Item | Endpoint | Owner | Deliverable |
|---|---|---|---|
| API-01 | `POST /v1/diagnosis/session` | BE | Session creation + analytics event |
| API-02 | `GET /v1/journey-state/{id}` | BE/FE | Resume support for return users |
| FE-01 | Home screen | FE | Hero CTA, pathways, webinar teaser, trust footer |

**Done when**
- Anonymous and logged-in home render correctly.
- `diagnosis_started` event emitted on CTA click.

---

## 4.2 Diagnosis Step 1 (Intent + Consent)

| Item | Endpoint | Owner | Deliverable |
|---|---|---|---|
| API-03 | `PUT /v1/diagnosis/session/{id}/intent` | BE | Validation + persistence |
| FE-02 | Diagnosis Step 1 UI | FE | Required fields + consent gate |

**Done when**
- Cannot continue without role + consent.
- Consent timestamp stored and auditable.

---

## 4.3 Diagnosis Step 2 (Resume + JD)

| Item | Endpoint | Owner | Deliverable |
|---|---|---|---|
| API-04 | `POST /v1/diagnosis/session/{id}/resume` | BE | Upload validation + storage integration |
| API-05 | `PUT /v1/diagnosis/session/{id}/jd` | BE | JD text/url persistence |
| FE-03 | Diagnosis Step 2 UI | FE | Upload/paste tabs, validation states, draft autosave |
| SEC-01 | Upload policy enforcement | BE/Sec | MIME/size checks + scan hook stub |

**Done when**
- Invalid file types rejected with actionable errors.
- Draft restored on refresh/re-entry.

---

## 4.4 Diagnosis Step 3 (Processing)

| Item | Endpoint | Owner | Deliverable |
|---|---|---|---|
| API-06 | `POST /v1/diagnosis/session/{id}/analyze` | BE | Queue analysis job |
| API-07 | `GET /v1/diagnosis/runs/{run_id}` | BE | Stage/progress contract |
| JOB-01 | `diagnosis.analyze` worker | BE | Async processing + status updates |
| FE-04 | Processing UI | FE | Stage labels, retry, AI support link |

**Done when**
- Analyze blocked without consent.
- Timeout path returns retryable error.
- Successful run transitions to results screen.

---

## 4.5 Diagnosis Step 4 (Results + Primary Action)

| Item | Endpoint | Owner | Deliverable |
|---|---|---|---|
| API-08 | `GET /v1/diagnosis/runs/{run_id}/result` | BE | Result payload with rationale + primary_action |
| SVC-01 | Recommendation ranking service | BE | Deterministic primary action selection |
| FE-05 | Results screen | FE | Summary-first layout + secondary actions |

**Done when**
- Exactly one primary CTA returned.
- Rationale and confidence included.
- Secondary actions route correctly.

---

## 4.6 Offer + Checkout (MVP subset)

| Item | Endpoint | Owner | Deliverable |
|---|---|---|---|
| API-09 | `GET /v1/offers/{offer_id}` | BE | Offer + pricing quote + trust block |
| API-10 | `POST /v1/cart/validate-schedule` | BE | Schedule-required enforcement |
| API-11 | `POST /v1/checkout/sessions` | BE | Checkout session creation |
| API-12 | `POST /v1/checkout/sessions/{id}/confirm` | BE | Payment confirmation + order creation |
| FE-06 | Offer detail UI | FE | Schedule selector + pricing display |
| FE-07 | Checkout UI + success state | FE | Auth gate, payment handoff, confirmation view |
| INT-01 | Stripe webhook handler | BE | Idempotent payment event processing |

**Done when**
- Checkout requires auth.
- Schedule-bound offer blocked without schedule.
- Successful payment creates order and emits `checkout_confirmed`.

Out of Sprint 1 (prepared for Sprint 2):
- Org reimbursement branch endpoint/UI (`/org-request`) can be feature-flagged.

---

## 5. Database Schema Tasks (Sprint 1)

## 5.1 Core Identity and Consent
- [ ] `users` (link to auth provider id)
- [ ] `profiles`
- [ ] `consents` (type, version, accepted_at, user_id)
- [ ] `user_sessions` / journey state table

## 5.2 Diagnosis Domain
- [ ] `diagnosis_sessions`
- [ ] `resume_assets` (storage path, checksum, mime, status)
- [ ] `jd_inputs`
- [ ] `analysis_runs` (status, stage, progress_pct, started_at, completed_at)
- [ ] `gap_insights` (strengths, gaps, readiness_score, confidence)

## 5.3 Recommendation and Commerce
- [ ] `recommendations`
- [ ] `recommendation_rationales`
- [ ] `pricing_rules` (country_code, currency, amount_minor, product_code)
- [ ] `pricing_quotes`
- [ ] `offers` (base metadata, schedule_required flag)
- [ ] `offer_schedules`
- [ ] `carts`, `cart_items`
- [ ] `orders`, `payments`

## 5.4 Events and Jobs
- [ ] `events` (event_name, payload_json, occurred_at, idempotency_key)
- [ ] `jobs` (type, status, attempts, payload, run_at)
- [ ] `delivery_logs` (for future notifications; schema now)

**Migration policy**
- One migration per domain module.
- Backward-compatible nullable columns for non-breaking deploys.

---

## 6. Service Implementation Tasks (Backend)

## SVC-01 Identity/Consent Service
- Create consent capture API and persistence.
- Add middleware to enforce consent before analyze.
- Add audit fields for consent version and timestamp.

## SVC-02 Diagnosis Service
- Implement session lifecycle (create/update).
- Implement resume upload metadata persistence.
- Implement analyze trigger and run state transitions.
- Implement result assembly from analysis output.

## SVC-03 Recommendation Service
- Implement ranking logic for primary action.
- Return structured rationale chips and confidence score.
- Ensure deterministic output for same input profile.

## SVC-04 Pricing Service
- Implement geo pricing resolver:
  - US -> USD 9 (mentor call rule prepared for Sprint 2 usage)
  - INR 49 (mentor call rule prepared for Sprint 2 usage)
- Implement offer/checkout quote generation from catalog pricing source.

## SVC-05 Checkout Service
- Create checkout session from cart.
- Enforce schedule-required validation endpoint.
- Integrate auth-required guard for confirm endpoint.

## SVC-06 Payment Service
- Stripe payment intent creation (standard path only in Sprint 1).
- Webhook signature validation + idempotency.
- Payment status reconciliation job.

## SVC-07 Order Service
- Create order record on successful payment.
- Generate confirmation payload for FE success screen.
- Emit admin notification event (email/Telegram in Sprint 2 if not fully wired).

## SVC-08 Journey State Service
- Persist current flow/step/payload by user/session.
- Resume endpoint used by all Sprint 1 screens.

---

## 7. Frontend Implementation Tasks

## FE-01 App Shell and Routing
- Route groups: `/`, `/diagnosis/*`, `/offers/*`, `/checkout/*`.
- Shared components: stepper, trust block, next-action panel, loading/error states.

## FE-02 Home
- Implement hero, proof strip, pathways, webinar teaser, footer.
- Wire CTA events.

## FE-03 Diagnosis Flow
- Stepper with validation summary.
- Resume upload with client-side pre-check + server error mapping.
- Processing screen with polling and timeout UX.

## FE-04 Results + Offer/Checkout
- Results cards (strengths/gaps/readiness).
- Recommendation rationale module.
- Offer page with schedule selector and trust block.
- Checkout with auth redirect and payment confirmation state.

---

## 8. Integration Test Matrix (Sprint 1)

| ID | Scenario | Steps | Expected |
|---|---|---|
| IT-01 | Anonymous diagnosis happy path | Home -> Step1 -> Step2 upload -> analyze -> results | Completed analysis with primary CTA |
| IT-02 | Consent gate enforcement | Step1 without consent -> analyze | 400 with consent required error |
| IT-03 | Resume interrupted diagnosis | Stop at Step2, reload | Journey resumes at Step2 with saved draft |
| IT-04 | Invalid resume upload | Upload unsupported file type | Validation error + retry path |
| IT-05 | Analysis timeout | Force long-running/timeout job | Retry UI + support CTA |
| IT-06 | Offer schedule enforcement | Offer requires schedule, proceed without selection | Blocked with schedule validation error |
| IT-07 | Checkout auth gate | Start checkout logged out | Redirect/login then resume checkout session |
| IT-08 | Checkout payment success | Stripe test payment success webhook | Order created + success screen shown |
| IT-09 | Primary action uniqueness | Multiple recommendation candidates | Exactly one primary CTA in API/UI |
| IT-10 | Event emission sanity | Run core funnel | Required events present in analytics test environment |

---

## 9. Non-Functional Gates for Sprint 1

- API p95 for diagnosis start->result under nominal load.
- Checkout error handling with retry-safe behavior.
- WCAG checks on diagnosis and checkout forms (keyboard, focus, labels, contrast).
- Security checks: webhook signature, PII-safe logs, consent enforcement.
- Observability: Sentry error capture + trace IDs on all APIs.

---

## 10. Definition of Done (Sprint 1)

Sprint 1 is done when:

- All Sprint 1 endpoints in section 4 are implemented and contract-tested.
- DB migrations applied in dev/staging.
- IT-01 to IT-08 pass in staging.
- Core analytics events validated.
- No Sev-1/Sev-2 open defects on conversion path.
- Architecture docs and API matrix remain in sync with implemented behavior.

---

## 11. Sprint 2 Handoff Checklist (Prepared Now)

Prepared for next sprint without blocking Sprint 1:
- Mentor paid booking endpoints (`/v1/mentor/quote`, `/v1/mentor/bookings`, confirm-payment).
- Dashboard and assessment endpoints.
- Webinar registration/attendance endpoints.
- AI coach production endpoints with guardrails.

---

## 12. Recommended Execution Order (Day-by-Day)

1. DB migrations + service skeletons  
2. Journey state + auth/error envelope  
3. Diagnosis APIs + worker stub  
4. Diagnosis UI (Step 1-3)  
5. Results/recommendation APIs + UI  
6. Offer/checkout APIs + UI  
7. Integration tests + analytics validation  
8. Sprint review + release checklist

---

## 13. Brownfield Alignment (Current Repo)

Sprint 0 enablers already exist in `server/`. Reuse and extend rather than duplicate:

| Plan entity | Existing model | Sprint 1 action |
|---|---|---|
| `users` | `User` | Extend with profile fields or add `Profile` 1:1 |
| `consents` | `ConsentEvent` | Reuse; enforce `policy_version` + `accepted` before analyze |
| `events` | `EventLog` | Reuse for analytics/ops idempotent emission |
| `jobs` | `JobRun` | Reuse for `diagnosis.analyze` worker queue |
| `carts`, `cart_items` | `Cart`, `CartItem` | Extend `offering_code` + `schedule_ref` semantics for offers |
| `orders`, `payments` | `Order`, `OrderItem` | Extend with checkout session + `payment_ref` reconciliation |
| Diagnosis domain | — | **New** migrations: `diagnosis_sessions`, `resume_assets`, `jd_inputs`, `analysis_runs`, `gap_insights` |
| Recommendation | — | **New**: `recommendations`, `recommendation_rationales` |
| Pricing | — | **New**: `pricing_rules`, `pricing_quotes` |
| Journey state | — | **New**: `journey_states` (or JSON blob on session until profile exists) |

**RBAC note:** Current `Role` enum is delivery-domain (`CUSTOMER`, `RESTAURANT_MANAGER`, etc.). Sprint 1 should either map learner roles via `RoleDefinition`/`Permission` tables or introduce Agile Forum roles in a dedicated migration before feature APIs ship.

**Related artifacts**
- API contracts: `_bmad-output/planning-artifacts/api-contract-matrix.md`
- UX stories/tasks: `_bmad-output/implementation-artifacts/s1-3-ux-implementation-epics-stories-tasks.md`
- Architecture: `_bmad-output/planning-artifacts/solution-architecture-aligned-to-ux.md`
- ADRs: `_bmad-output/planning-artifacts/architecture-decision-records.md`
- Sprint 0 gate: `server/src/observability/sprint-1-readiness-gate.script.test.ts`
