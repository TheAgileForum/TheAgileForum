# Agile Forum MVP - Prioritized Sprint Build Order (0/1/2/3)

## Purpose

Define a practical 3-sprint MVP execution order from `epics-agile-forum.md` that:

- prioritizes revenue-critical user journeys first
- respects platform dependencies (auth, data, events, observability)
- reduces delivery risk through thin vertical slices

## Planning Assumptions

- Sprint length: fixed team sprint cadence (use your current sprint duration).
- MVP target: Tier A launch scope from PRD with essential reliability/compliance controls.
- Dependencies are expressed as **must-have predecessors**.

## Priority Principles Used

1. Build shared foundations first (identity, consent, checkout gating, event tracking).
2. Deliver first monetizable path early (`diagnosis -> recommendation -> checkout -> confirmation`).
3. Add retention, trust, and growth loops after the revenue path is stable.
4. Gate high-risk AI and campaign automation behind governance and observability.

## Sprint 0 - Setup + Architecture Enablers

## Sprint Goal

Establish deployable engineering foundations so Sprint 1 stories can execute without environment, architecture, or tooling blockers.

## In Scope (Enabler/Technical Story Focus)

- Epic 1 technical baseline: `A1.1`, `E1.1`, `T1.1..T1.6`
- Epic 2 foundational data + ingestion contracts: `A2.1`, `E2.1`, `T2.1`, `T2.2`
- Epic 4 checkout architecture baseline: `A4.1`, `E4.1`, `T4.1`
- Epic 9 event-driven orchestration baseline: `A9.1`, `E9.1`, `T9.1`
- Epic 12 reliability/compliance setup baselines: `T12.2`, `T12.3`, `T12.4`, `T12.5`

## Mandatory Platform Setup

- Repository standards, branching strategy, environment variable templates.
- Dev/stage environments and secrets management.
- Supabase project baseline (schema migration path, seed strategy, storage buckets).
- FastAPI service skeleton + worker + scheduler process skeleton.
- Redis queue baseline and dead-letter queue conventions.
- CI baseline for lint/test/build checks.
- Sentry + PostHog + Clarity instrumentation scaffolds.

## Key Dependencies (Critical Path)

- Environment + secrets + CI baseline before any service-level feature work.
- Auth/session and RBAC primitives before checkout and admin endpoints.
- Event contract schema before automation and notification flows.
- Monitoring/alerting baseline before enabling critical checkout/notification paths.

## Sprint Exit Criteria

- New engineer can clone repo, configure env, run API + worker + scheduler locally.
- Core auth/session/RBAC contracts and DB migration baseline are merged.
- Canonical event schema and queue contracts are documented and testable.
- CI pipeline and observability hooks are active for core services.
- Sprint 1 critical stories can start immediately without infra/setup blockers.

## Sprint 1 - Foundation + First Revenue Slice

## Sprint Goal

Enable authenticated diagnosis and first successful purchase flow with essential tracking and ops alerts.

## In Scope (Stories)

- Epic 1: `1.1`, `1.2`, `1.3`
- Epic 2: `2.1`, `2.2`
- Epic 4: `4.1`, `4.2`, `4.3`
- Epic 6: `6.1`
- Epic 9: `9.4`, `9.5`
- Epic 12: `12.2` (minimum resilience controls for checkout and notifications)
- Epic 12: `12.3` (minimum consent/compliance baseline only)

## Mandatory Technical Tasks (from technical layers)

- Auth/consent/RBAC baseline: `T1.1..T1.5`
- Diagnosis model + ingestion interfaces: `T2.1`, `T2.2`
- Cart/checkout policy and webhook safety: `T4.1..T4.3`, `T4.5`, `T4.6`
- Role metadata schema baseline: `T6.1`
- Enrollment alerts + delivery tracking: `T9.4`, `T9.5`
- Reliability baseline (alerts/retries/DLQ/runbooks): `T12.3`

## Key Dependencies (Critical Path)

- `1.1 -> 1.2 -> 1.3` before `4.1` (checkout auth gate)
- `2.1 -> 2.2 -> 4.1` (diagnosis outputs feed recommendations and purchase context)
- `6.1 -> 4.1` (role-aware offer metadata needed for consistent checkout context)
- `4.1 -> 9.4 + 9.5` (order events trigger ops/student confirmations)
- `12.2 + 12.3` must be active before Sprint-1 exit (launch safety baseline)

## Sprint Exit Criteria

- User can sign up/login, complete diagnosis, see recommendation, and purchase eligible offering.
- Schedule-bound and exam-paid/free rules enforced in cart/checkout.
- Successful order triggers both student confirmation and admin notifications (email/Telegram).
- Failure paths for checkout/notification are observable and retry-safe.

---

## Sprint 2 - Learner Value Loop + Engagement

## Sprint Goal

Increase activation and repeat engagement through dashboard, assessments, planner roadmap, and webinar lifecycle.

## In Scope (Stories)

- Epic 2: `2.3`, `2.4`
- Epic 3: `3.1`, `3.2`, `3.3`
- Epic 7: `7.1`, `7.2`, `7.3`, `7.4`
- Epic 8: `8.4`, `8.5`
- Epic 9: `9.1`, `9.2`, `9.3`
- Epic 4: `4.4` (organization reimbursement checkout path)

## Mandatory Technical Tasks

- Planner generation + progress state: `T2.3..T2.5`
- Dashboard aggregates, charts, bookmarks, exam sessions: `T3.1..T3.5`
- Webinar schedule/attendance/certificates/feedback: `T7.1..T7.4`
- Form routing + discovery call workflows: `T8.6`, `T8.7`
- Campaign rules + preference enforcement + scholarship tracking: `T9.1..T9.3`, `T9.6`
- Org checkout branch: `T4.4`

## Key Dependencies (Critical Path)

- `2.3 -> 2.4 -> 3.1` (roadmap context to dashboard)
- `3.2 -> 3.1` (assessment outcomes update dashboard)
- `7.1 -> 7.2 -> 7.3` (registration before attendance verification and recommendations)
- `9.1` depends on preference model from `1.2` and journey events from Sprint 1
- `4.4` depends on stable base checkout (`4.1`) from Sprint 1

## Sprint Exit Criteria

- Learners can use role-transition planner with 4-8 week roadmap tracking.
- Dashboard supports bar/radar + accessible summaries and bookmarks.
- Webinar flow complete: discover/register, attendance code, feedback, certificate issue/download.
- Always-on and re-engagement campaigns run with preference and fatigue controls.

---

## Sprint 3 - AI, Trust, Search Growth, and Launch Hardening

## Sprint Goal

Scale conversion and discoverability with governed AI, complete trust surfaces, search operations, and cutover readiness.

## In Scope (Stories)

- Epic 5: `5.1`, `5.2`, `5.3`, `5.4`
- Epic 6: `6.2`, `6.3`, `6.4`, `6.5`
- Epic 8: `8.1`, `8.2`, `8.3`, `8.6`
- Epic 10: `10.1`, `10.2`, `10.3`, `10.4`
- Epic 11: `11.1`, `11.2`, `11.3`, `11.4`
- Epic 12: `12.1` + remaining hardening scope in `12.2`, `12.3`

## Mandatory Technical Tasks

- AI orchestration/guardrails/feedback intelligence: `T5.1..T5.6`
- Mock interview templates + role-aware recommendation resolver: `T6.5`, `T6.7`, `T6.8`
- Trust/footer/social governance + claims workflow: `T8.1..T8.5`, `T8.8`
- Admin command center/anomaly/approvals/audit: `T10.1..T10.6`
- Search diagnostics/schema/keyword map/experiments/reporting: `T11.1..T11.6`
- Redirect and SEO health tooling: `T12.1`, `T12.2`, `T12.4..T12.6`

## Key Dependencies (Critical Path)

- `5.1 -> 5.2 -> 5.3 -> 5.4` (assistant availability, guardrails, feedback, quality ops)
- `6.1` and Sprint-1 offer metadata baseline required before `6.5`
- `10.3` (KB governance) required before full AI scale-out (`5.2`, `5.4`)
- `11.2 + 11.3` required before aggressive landing-page scaling (`11.4`)
- `12.1` required before final cutover and index-preserving launch

## Sprint Exit Criteria

- AI assistant is live with compliance guardrails, feedback loop, and admin quality controls.
- Role-specific mock interview and complete course-detail experiences are production-ready.
- Public trust surfaces (community, social proof, footer/legal/compliance) are complete.
- SEO/GEO command center and keyword-intent pages are operational.
- Redirect, reliability, and compliance hardening complete for go-live.

---

## Dependency Matrix (Condensed)


| Capability                     | Depends On                    | Enables                                             |
| ------------------------------ | ----------------------------- | --------------------------------------------------- |
| Auth + consent + checkout gate | none                          | diagnosis persistence, secure checkout, campaigns   |
| Diagnosis + role metadata      | auth baseline                 | recommendation quality, planner, AI personalization |
| Core checkout + order events   | auth + offer metadata         | confirmations, admin alerts, funnel analytics       |
| Dashboard + assessments        | diagnosis + planner model     | engagement loop, campaign segmentation              |
| Webinar lifecycle              | identity + notification base  | retention, trust, cross-sell opportunities          |
| AI assistant governance        | KB/admin controls + analytics | safe conversion guidance at scale                   |
| SEO/GEO operations             | content governance + tracking | discoverability and intent-to-conversion growth     |
| Cutover hardening              | redirect map + monitoring     | safe launch and rollback readiness                  |


## Recommended Sprint Status Baseline

- Sprint 1 stories: mark as `ready-for-dev` first.
- Sprint 2 and Sprint 3 stories: keep as `backlog` until Sprint 1 exit criteria are met.
- Move epics to `in-progress` only when first story implementation starts.

## Final Recommendation

Start with this sequence exactly:

1. **Sprint 0:** setup + architecture enablers
2. **Sprint 1:** foundation + monetization core
3. **Sprint 2:** activation and engagement loops
4. **Sprint 3:** AI scale, trust/search growth, launch hardening

This order gives the fastest path to validated revenue with controlled delivery risk.