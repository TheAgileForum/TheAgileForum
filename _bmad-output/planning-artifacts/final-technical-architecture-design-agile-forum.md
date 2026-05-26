---
title: "Final Technical Architecture Design: The Agile Forum"
status: "final-draft"
created: "2026-05-25"
updated: "2026-05-25"
owner: "Dhirender"
workflowType: "architecture"
inputDocuments:
  - "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/prd-agile-forum.md"
  - "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/epics-agile-forum.md"
  - "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/mvp-cost-minimized-architecture-v1.md"
---

# Final Technical Architecture Design - The Agile Forum

## 1. Architecture Goal

Define a production-ready, cost-minimized, AI-native architecture that can deliver the MVP scope in the PRD while preserving upgrade flexibility for later scale.

Primary outcomes:

- reliable conversion journey from discovery to paid enrollment
- role-specific AI-enabled guidance and services across the full funnel
- governed automation for engagement, campaigns, and operations
- strong SEO + AI-engine discoverability foundations
- low operational overhead for MVP execution

## 2. Guiding Architectural Principles

1. Wix for discovery and trust surfaces; backend for product intelligence and transactions.
2. Single source of truth in backend services + Supabase Postgres.
3. Event-driven automation with retries, idempotency, and observability.
4. AI assistance is governed (guardrails, approvals, auditability), not autonomous by default.
5. Keep MVP toolchain lean; add complexity only after KPI evidence.

## 3. Target System Context

### 3.1 User-Facing Channels

- Public web: `www.theagileforum.com` (Wix Studio)
- API: `api.theagileforum.com` (FastAPI)
- Optional future product app UI: `app.theagileforum.com` (only when Wix UX limits become material)

### 3.2 Core External Integrations

- Auth + DB + storage + vector: Supabase
- Payments: Stripe
- AI model gateway: OpenRouter
- Webinar delivery: Microsoft Teams
- Analytics: PostHog + Microsoft Clarity
- Error monitoring: Sentry
- Admin alerts: Email + Telegram
- Media sources: Wix media + SharePoint + YouTube/Vimeo

## 4. Logical Architecture (Domain-Aligned)

## 4.1 Experience and CMS Layer (Wix)

Responsible for:

- marketing pages, role landing pages, blogs, FAQs, About, Contact, trust and social surfaces
- webinar and free-session discovery widgets
- SEO page templates, metadata, structured content blocks
- lead forms and controlled CTA entry points

Non-responsibilities:

- core identity decisions, payment state, recommendation logic, campaign orchestration, AI policy decisions

## 4.2 Product Services Layer (FastAPI)

Service domains:

1. Identity and profile service (auth gates, consent, user profile)
2. Diagnosis and transition planner service (resume/JD analysis, role X->Y roadmap)
3. Learner dashboard service (scores, progress views, bookmarks, assessments)
4. Commerce service (cart rules, schedule enforcement, checkout orchestration, org-payment branch)
5. AI orchestration service (RAG, prompt policies, claim guardrails, escalation routing)
6. Webinar lifecycle service (registration, attendance code verification, certificates, recommendations)
7. Automation and campaign service (event triggers, segmentation, dispatch rules)
8. Admin command service (health, anomalies, approvals, interventions, audit)
9. Search operations service (schema jobs, keyword map ops, diagnostics ingestion)

## 4.3 Data and Platform Layer (Supabase)

- Postgres: transactional system of record
- Auth: user identity and session primitives
- Storage: resumes, brochures, generated certificates, approved media artifacts
- pgvector: retrieval indexes for AI grounding and role-specific knowledge

## 4.4 Background Processing Layer (Backend Jobs)

- Queue broker: Redis
- Worker framework: Celery or RQ
- Scheduler: APScheduler/Cron
- Dead-letter and retries for failure handling
- Event log persistence in Postgres for replay and audit

## 5. Primary Data Domains

Core entity groups (minimum):

- `users`, `profiles`, `consents`, `roles`
- `offerings`, `offering_schedules`, `bookmarks`
- `diagnosis_reports`, `resume_artifacts`, `role_pathways`, `roadmap_tasks`
- `assessments`, `assessment_attempts`, `skill_scores`
- `carts`, `cart_items`, `orders`, `payments`, `org_checkout_requests`
- `webinars`, `webinar_registrations`, `webinar_attendance`, `webinar_feedback`, `certificates`
- `campaigns`, `campaign_runs`, `notification_preferences`, `deliveries`
- `ai_sessions`, `ai_messages`, `ai_feedback`, `ai_quality_rollups`, `kb_versions`
- `events`, `jobs`, `audit_logs`, `kpi_rollups_daily`

## 6. Key Workflow Architectures

## 6.1 Diagnosis to Offer Conversion

1. User submits profile + resume/JD context.
2. Diagnosis engine computes skill gaps and role readiness.
3. Planner generates Role X->Y pathway and 4-8 week roadmap.
4. Recommendation engine returns next best paid/free actions.
5. Checkout is gated by auth and schedule rules.

## 6.2 Commerce and Enrollment

1. Add-to-cart validates schedule requirement.
2. Exam policy is enforced (free skill assessment vs paid mock exam).
3. If SAFe-eligible items exist, organization reimbursement path is offered.
4. Stripe webhook confirms payment; enrollment event emitted.
5. Student confirmation + admin email + Telegram notifications dispatched via jobs.

## 6.3 Webinar Attendance and Certificate Loop

1. Registration event stored with reminders scheduled.
2. Learner enters webinar end-code in dashboard.
3. Attendance verification job validates code/session eligibility.
4. Feedback captured and next-session recommendations generated.
5. Certificate status set and downloadable artifact made available when eligible.

## 6.4 AI Chat with Guardrails

1. Chat request enters policy gateway.
2. Retrieval fetches approved knowledge artifacts.
3. Prompt policy enforces claims/disclaimer rules.
4. Response includes next-step CTA and escalation option for low confidence.
5. User feedback signal updates quality triage queues.

## 6.5 Re-Engagement and Campaigns

1. Trigger events emitted (cart abandoned, inactivity, webinar no-convert, etc.).
2. Eligibility + consent + preference filters applied.
3. Campaign action dispatched by channel (email/Telegram/other approved).
4. Delivery and conversion outcomes written to analytics events.

## 7. Analytics and Measurement Architecture

## 7.1 Tool Split

- PostHog: event-level product analytics, attribution, funnel truth, KPI rollups
- Microsoft Clarity: heatmaps, recordings, UX friction diagnosis

## 7.2 KPI Source of Truth

PostHog-backed KPIs:

- services/certifications booked
- visitor->customer and webinar attendee->customer conversions
- 1:1 discovery calls booked
- resume uploads
- mock interviews booked by role
- new users registered
- campaign and AI quality outcomes

Clarity is investigative support for UX bottlenecks, not the source of business attribution truth.

## 8. Security, Compliance, and Trust Controls

- service-to-service authentication for internal APIs/jobs
- strict RBAC for admin control plane operations
- PII minimization in queue payloads and logs
- encrypted secrets and webhook signature validation
- consent and unsubscribe enforcement before outbound campaigns
- AI claim governance with disallowed-language blocking and disclaimer insertion
- full audit logs for admin actions, approvals, prompt/policy revisions, and overrides

## 9. Reliability and Operations Design

Mandatory controls:

- idempotency keys on event-triggered jobs
- exponential retries by queue and domain
- dead-letter queues with replay runbooks
- job heartbeat and timeout monitoring
- health checks for checkout, sitemap, schema jobs, and campaign dispatch
- alerting via Sentry + operational channels

## 10. Deployment Topology and Environments

## 10.1 MVP Topology

- Wix hosts public experience
- FastAPI hosts product APIs
- Supabase hosts data/auth/storage/vector
- Redis supports async jobs
- Worker + scheduler run as separate processes

## 10.2 Environment Strategy

- Dev: integrated test data + sandbox payment/webinar integrations
- Staging: production-like routing and observability checks
- Prod: controlled release with feature flags for high-risk features (AI/campaign policies)

## 11. Scalability and Phase Gates

## 11.1 Keep in MVP

- single API deployment + one worker + one scheduler baseline
- Supabase pgvector (defer separate vector DB)
- Wix automations where sufficient for low-complexity transactional needs

## 11.2 Trigger Upgrades

- delivery volume or orchestration complexity exceeds current adapters
- AI workload needs queue sharding and model-specific worker pools
- CRM/community integrations become required for measured ROI
- SEO/GEO automation needs dedicated pipeline services

## 12. Requirement Coverage Snapshot

This architecture covers PRD and Epic intent across:

- identity, diagnosis, dashboard, assessments, bookmarks
- commerce rules, org reimbursement path, order notification flows
- role-specific AI and mock interview services
- webinar feedback/recommendation/certificate self-service
- social trust, campaign orchestration, scholarship and interest-based outreach
- admin command center and knowledge-base governance
- SEO + AI discoverability operations and cutover reliability

## 13. Final Recommendation

Adopt the hybrid architecture as the final MVP baseline:

**Wix + FastAPI + Supabase + Stripe + OpenRouter + Backend Jobs (Redis/Celery/RQ + Scheduler) + PostHog + Microsoft Clarity + Sentry + MS Teams**

This design is implementation-ready for MVP and intentionally structured to support controlled upgrades without re-platforming.
