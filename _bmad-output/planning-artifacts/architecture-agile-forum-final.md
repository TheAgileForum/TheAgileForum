---

## stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]

workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-05-25'
inputDocuments:

- '{project-root}/_bmad-output/planning-artifacts/prd-agile-forum.md'
- '{project-root}/_bmad-output/planning-artifacts/epics-agile-forum.md'
- '{project-root}/_bmad-output/planning-artifacts/mvp-cost-minimized-architecture-v1.md'
project_name: mybmadproj
user_name: Dhirender
date: '2026-05-25'

# Final Technical Architecture Design - The Agile Forum

This document is the final implementation-ready architecture for the Agile Forum AI-native career transformation platform. It aligns with the PRD, MVP epics/stories, and cost-minimized constraints while keeping the system scalable for later releases.

## 1) Architecture Outcome

Build a hybrid platform where:

- Wix owns public growth surfaces (SEO pages, blogs, trust pages, forms, campaigns baseline).
- FastAPI + Supabase own product logic, AI orchestration, automation, commerce policies, and operator controls.
- Backend jobs (queue + workers + scheduler) power notifications, campaign automation, AI processing, and reliability workflows.
- PostHog is the source of truth for conversion/product KPIs; Microsoft Clarity provides UX behavior evidence (recordings/heatmaps).

## 2) Design Principles

1. Keep MVP lean: prefer low tool sprawl and existing subscriptions.
2. Preserve clear boundaries: marketing CMS vs product system of record.
3. Treat automation as product capability: event-first, retry-safe, observable.
4. Enforce AI governance by design: guardrails, traceability, human validation.
5. Make cutover safe: URL continuity, rollback paths, SEO preservation.

## 3) Deployment Topology

## Domains

- `www.theagileforum.com` -> Wix Studio (public pages, blogs, SEO landing pages, trust and informational pages).
- `api.theagileforum.com` -> FastAPI services (auth extensions, diagnosis, planner, checkout rules, AI orchestration, admin APIs).
- `db` (Supabase) -> Postgres, Auth, Storage, pgvector.

## Optional domain (phase-gated)

- `app.theagileforum.com` -> dedicated frontend if Wix page capabilities become limiting for product UX complexity.

## Runtime components

- API service: FastAPI app.
- Worker service: Celery or RQ workers.
- Scheduler service: APScheduler/Cron worker.
- Queue broker: Redis.
- Observability agents: Sentry SDK + PostHog event producers.

## 4) Logical Architecture Layers

## Experience Layer

- Wix-rendered pages for acquisition, trust, webinars, blogs, FAQ, About, Contact, social proof, and offer discovery.
- Embedded or linked product surfaces for diagnosis, dashboard, assessments, checkout, and admin actions.

## Application Layer

- Identity/profile orchestration.
- Diagnosis and transition planner engine (role X -> role Y roadmap).
- Offer/catalog service with role-specific AI-enabled metadata.
- Commerce orchestration with schedule-bound validation and checkout variants.
- Webinar lifecycle service (attendance code, feedback, certificate issuance).
- Campaign/notification service.
- Admin control-plane APIs.
- SEO/GEO operations APIs.

## AI Layer

- Model gateway via OpenRouter.
- RAG service using Supabase pgvector.
- Guardrail and policy middleware for compliant messaging.
- AI quality feedback ingestion and continuous improvement loop.

## Data and Integration Layer

- Supabase Postgres for transactional and analytical source tables.
- Supabase Storage for resume uploads and generated artifacts.
- Stripe for payments.
- MS Teams for webinar operations.
- Email adapters (Wix automation first, provider API later if needed).
- Telegram adapter for critical admin notifications.

## 5) Core Data Architecture

## Primary domains

- Identity and consent: users, roles, consent_events, notification_preferences.
- Career intelligence: resumes, jd_inputs, skill_gaps, transition_paths, roadmap_items.
- Learning and offers: offerings, schedules, role_mappings, bookmarks, assessments, mock_interviews.
- Commerce: carts, cart_items, orders, order_items, payments, invoices.
- Webinar: webinar_sessions, attendance_events, feedback_submissions, attendance_certificates.
- AI operations: ai_interactions, ai_feedback, kb_sources, kb_proposals, kb_validations, prompt_policies.
- Automation and analytics: events, jobs, campaign_runs, campaign_deliveries, kpi_rollups_daily.

## Storage and indexing

- pgvector tables for embeddings from curated knowledge sources.
- Row-level security for learner data and admin access isolation.
- Idempotency keys for event-driven writes and payment/webhook safety.

## 6) API and Service Contracts

## Public and learner APIs (selected)

- `POST /auth/*` for sign-up, login, OAuth continuation.
- `POST /diagnosis/resume-scan`
- `POST /diagnosis/job-link-scan`
- `GET /planner/transitions/{fromRole}/{toRole}`
- `GET /dashboard/learner-summary`
- `POST /cart/items` (requires valid schedule id)
- `POST /checkout/start` (enforces login for non-auth users)
- `POST /checkout/org-reimbursement/start` (SAFe/org path)
- `POST /webinars/attendance/verify-code`
- `POST /webinars/certificates/generate`
- `POST /ai/feedback`

## Admin APIs (selected)

- `GET /admin/funnel/overview`
- `GET /admin/campaigns/performance`
- `POST /admin/campaigns/{id}/run`
- `GET /admin/jobs`
- `POST /admin/kb/proposals/{id}/approve`
- `POST /admin/seo/reindex-jobs`
- `GET /admin/ai/quality`

## Integration adapters

- Stripe webhook handler with signature validation and retry safety.
- Telegram dispatch adapter for critical order alerts.
- Email dispatch bridge (Wix-first with provider fallback path).
- Webinar adapter for MS Teams metadata sync.

## 7) Event-Driven Automation Architecture

## Event model

Every high-value action emits a domain event:

- `checkout.completed`
- `cart.abandoned`
- `webinar.attended`
- `webinar.feedback_submitted`
- `assessment.completed`
- `mock_interview.booked`
- `ai.feedback_submitted`

## Processing pattern

1. API writes business transaction.
2. Event is persisted (`events` table) with idempotency key.
3. Dispatcher enqueues job to domain queue.
4. Worker executes delivery/AI/reporting tasks.
5. Failures retry with exponential backoff.
6. Exhausted failures move to DLQ and alert operators.

## Queue design

- `q_critical`: payment webhooks, order confirmations, admin alerts.
- `q_notifications`: campaigns, reminders, scholarship outreach.
- `q_ai_processing`: resume parsing, embeddings, AI recommendation jobs.
- `q_reporting`: KPI rollups and funnel aggregation.
- `q_growth`: social trust sync and SEO/GEO task runners.

## 8) AI Architecture and Guardrails

## AI interaction policy

- Ground responses with curated knowledge base first.
- Enforce claim-safe templates for salary/career outcomes.
- Block guaranteed-outcome language.
- Insert disclaimers where confidence or certainty is limited.
- Allow conversion nudges to paid services only through approved copy/policy templates.

## Knowledge base evolution

- AI can propose new KB changes and suggested sources.
- Human reviewers approve/reject before publish.
- Versioned KB snapshots support rollback.
- Each published artifact stores source traceability metadata.

## Feedback intelligence

- Capture correctness/helpfulness feedback per AI response.
- Feed quality dashboards and prompt/model experiment governance.
- Route low-quality clusters to triage workflows.

## 9) Analytics and Measurement Architecture

## Dual-tool strategy

- PostHog: KPI source of truth and attribution.
- Microsoft Clarity: UX friction diagnostics.

## KPI instrumentation coverage

- Services/certifications booked.
- Visitors -> customers conversion.
- Webinar attendees -> customers conversion.
- 1:1 calls booked.
- Resumes uploaded.
- Mock interviews booked.
- New users registered.
- Campaign conversion by interest segment.

## Identity and attribution rules

- Use stable user id where authenticated.
- Use anonymous id + UTM/referrer pre-auth.
- Merge identity after login/registration.
- Preserve campaign metadata across checkout and post-purchase lifecycle.

## 10) SEO, GEO, and AI-Search Architecture

## Indexability and structured content

- Dedicated role and transition landing pages for high-intent terms.
- Structured data for courses, webinars, FAQs, and organization metadata.
- Programmatic page templates driven by validated content rules.

## AI-search readiness (GEO)

- Publish citation-friendly, schema-rich, trust-backed pages.
- Maintain factual consistency across PRD-approved claims.
- Track index health and AI-engine discoverability diagnostics.

## 11) Security, Privacy, and Compliance

- Enforce Auth + consent checks before personalized engagement.
- Encrypt sensitive data in transit and at rest.
- Validate uploads and isolate storage paths.
- Use signed webhooks and secret management best practices.
- Keep audit logs for admin overrides, campaign changes, policy updates, and AI governance decisions.
- Honor unsubscribe/quiet-hours/frequency caps across all notification channels.

## 12) Reliability and Operations

## SLO-focused controls

- Checkout and critical notifications must be retry-safe and observable.
- Automation jobs require heartbeats, timeout controls, and DLQ visibility.
- Error bursts trigger Sentry alerts and operator runbooks.
- Feature flags govern high-risk releases (AI/prompt/campaign changes).

## Incident response posture

- Job recovery via replay-safe event processing.
- Dashboard views for failed campaigns, failed notifications, and stuck AI jobs.
- Operational override paths for manual intervention.

## 13) Cutover and Migration Design

## Cutover strategy

- Maintain URL mapping and redirects from legacy Wix structure.
- Keep legal/policy pages and critical trust surfaces continuous.
- Roll out in controlled waves: public pages, diagnosis/dashboard, then commerce enhancements.

## Rollback strategy

- Preserve previous page routes and content snapshots.
- Use route-level feature flags to switch critical flows.
- Support rollback of KB and AI policy changes independently from app deploys.

## 14) Implementation Blueprint (MVP)

## Wave 1 - foundation

- Auth/profile/consent.
- Diagnosis + transition planner.
- Dashboard with charts, bookmarks, free assessments.
- Core offer catalog and course details.

## Wave 2 - monetization and lifecycle

- Schedule-bound checkout and order flows.
- SAFe org reimbursement checkout variant.
- Webinar attendance code, feedback, and certificates.
- Notification and campaign automations.

## Wave 3 - intelligence and hardening

- AI quality loop and admin AI governance console.
- SEO/GEO operations command center.
- Reliability, observability, and compliance hardening.

## 15) Architecture Validation Note

This architecture is practical for MVP and aligned with your constraints:

- Uses Wix where Wix is strongest (content, trust, rapid publishing).
- Uses backend services where control is required (logic, automation, AI governance, analytics truth).
- Keeps cost low by consolidating on Supabase + backend jobs + existing tools.
- Preserves a clear upgrade path without re-platforming core domains.

## 16) Final Recommendation

Adopt this as the execution baseline:

**Wix Studio + FastAPI + Supabase + Stripe + OpenRouter + Backend Jobs (Redis + Workers + Scheduler) + PostHog + Microsoft Clarity + Sentry + MS Teams**

Defer additional major platforms (separate app frontend host, CRM expansion, workflow SaaS, dedicated vector DB, advanced CDP) until KPI evidence justifies added complexity.