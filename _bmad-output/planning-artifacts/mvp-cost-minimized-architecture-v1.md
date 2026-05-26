# MVP Cost-Minimized Architecture v1 (Backend-Jobs Automation)

## Purpose

Define a practical, low-cost MVP architecture for Agile Forum that:

- preserves the required product scope from `prd-agile-forum.md`
- minimizes tool sprawl and recurring SaaS cost
- uses **backend jobs** (not workflow SaaS) for automation
- stays upgrade-ready for Phase 2/3

## Architectural Principles

1. **Wix for content and trust; backend for product logic**
2. **Single source of truth in backend + database**
3. **Event-driven automations with reliable job processing**
4. **Keep external tools minimal in MVP**
5. **Defer expensive or ops-heavy components unless required by KPI gaps**

## Recommended MVP Stack (Cost-Minimized)


| Layer                 | Tooling                                                           | MVP Decision     | Notes                                                                                                    |
| --------------------- | ----------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| Website + CMS         | Wix Studio                                                        | Keep             | Public pages, SEO, blogs, trust pages, forms                                                             |
| Backend APIs          | FastAPI                                                           | Keep             | Core business logic, AI orchestration, commerce rules                                                    |
| Database/Auth/Storage | Supabase (Postgres + Auth + Storage + pgvector)                   | Keep             | Replaces multiple services in one platform                                                               |
| Payments              | Stripe                                                            | Keep             | Required for paid services and checkout reliability                                                      |
| AI Gateway            | OpenRouter                                                        | Keep             | Cost-flexible model routing                                                                              |
| Automation Engine     | Backend Jobs (Celery/RQ + Redis + Scheduler)                      | Keep             | Replace n8n/Flowise for MVP ops simplicity                                                               |
| Analytics             | PostHog + Microsoft Clarity                                       | Keep             | PostHog for event/funnel/KPI attribution, Clarity for session replay, heatmaps, and UX behavior insights |
| Error Monitoring      | Sentry                                                            | Keep             | Reliability/incident visibility                                                                          |
| Email                 | Wix Automations first, backend-triggered provider later if needed | Keep/Phase-gate  | Start low-cost; upgrade when transactional complexity increases                                          |
| Webinar Platform      | MS Teams                                                          | Keep             | Leverages existing paid subscription                                                                     |
| Community Platform    | Circle                                                            | Defer to Phase 2 | Not required for MVP launch                                                                              |
| CRM                   | HubSpot                                                           | Defer to Phase 2 | Add after MVP funnel stabilization                                                                       |
| Vector DB             | Supabase pgvector                                                 | Keep             | Defer Qdrant until scale demands                                                                         |
| File/CDN              | Wix media + SharePoint/YouTube/Vimeo                              | Keep             | Avoid adding R2 in MVP unless needed                                                                     |


## Deployment Topology (MVP)

### Preferred

- `www.theagileforum.com` -> Wix Studio (marketing + CMS)
- `api.theagileforum.com` -> FastAPI backend service
- Supabase -> DB/Auth/Storage/pgvector

### Optional (if product UI in dedicated frontend is needed)

- `app.theagileforum.com` -> dedicated app frontend (later)

In MVP, keep as much UI as possible in Wix, and move only logic-heavy flows to backend APIs.

## Backend-Jobs Automation Architecture

## Core Components

1. **Event Producer Layer**
  - emits domain events from APIs (checkout success, cart abandoned, webinar attended, etc.)
2. **Event Store / Queue**
  - Redis queue for immediate async jobs
  - Postgres event log table for auditability/replay
3. **Worker Layer**
  - Celery or RQ workers execute jobs
  - dedicated queues by domain (notifications, AI processing, analytics, certificates)
4. **Scheduler Layer**
  - APScheduler/Cron workers for delayed jobs (3-day nudges, reminder windows, digests)
5. **Delivery Adapters**
  - Email adapter (Wix automation bridge and/or provider API)
  - Telegram adapter (admin notifications)
  - MS Teams adapter (optional event reminders/posts if needed)
6. **Observability Layer**
  - job status table + retries + dead-letter queue
  - Sentry for failures, PostHog for campaign outcome events, Clarity for UX friction evidence

## Analytics Decision: PostHog + Microsoft Clarity

Use both tools in MVP:

- **Microsoft Clarity**: free behavioral analytics (heatmaps, recordings, rage/dead clicks, scroll depth).
- **PostHog**: product event analytics for conversion funnels, cohorting, campaign attribution, and KPI rollups.

### Why Clarity alone is not enough

Clarity is excellent for UX diagnostics, but it is weak for full product analytics requirements like:

- visitor-to-customer and webinar-to-customer conversion attribution
- role-based funnel breakdowns across diagnosis -> cart -> checkout
- campaign impact measurement tied to notifications/emails
- operational KPI rollups required in admin reporting

### MVP Implementation Pattern

1. Instrument core business events in backend and frontend to PostHog.
2. Install Clarity script on Wix and app surfaces for behavior replay and heatmaps.
3. Add a shared `user_id` and campaign metadata strategy so Clarity sessions can be investigated alongside PostHog funnel drops.
4. Keep PostHog as source of truth for KPI dashboards; use Clarity for qualitative troubleshooting.

## Recommended Queue Design

- `q_critical`: payment webhooks, enrollment confirmation, admin alerts
- `q_notifications`: campaign emails, reminders, nudges
- `q_ai_processing`: resume parsing, embeddings, recommendations
- `q_reporting`: KPI aggregation and rollups
- `q_low_priority`: social/content sync tasks

## Reliability Controls (mandatory)

- idempotency keys on all event-triggered jobs
- exponential retry policy by job type
- dead-letter queue for exhausted retries
- job timeout + heartbeat monitoring
- replay-safe event processing

## Automation Coverage (Mapped to PRD FRs)


| Functional Area                | FR Coverage          | Backend Jobs Pattern                              |
| ------------------------------ | -------------------- | ------------------------------------------------- |
| Abandoned cart reminders       | FR-54                | Scheduled delayed jobs + cancellation on purchase |
| Inactivity nudges + offers     | FR-55                | Segment query + timed campaign jobs               |
| Preference-aware notifications | FR-56, FR-156        | Eligibility filter before dispatch                |
| Trigger orchestration          | FR-57                | Event -> routing table -> queue                   |
| Campaign performance tracking  | FR-58, FR-46         | Async delivery/open/click/conversion event sinks  |
| Automation failure alerting    | FR-59                | Worker error hooks -> Sentry/ops alerts           |
| Frequency caps + quiet hours   | FR-60                | Rules engine in dispatch pre-check                |
| Scholarship outreach           | FR-133..135          | Eligibility batch jobs + intake flow tracking     |
| Enrollment admin alerts        | FR-147..150          | Critical queue fan-out (email + Telegram)         |
| Student order confirmations    | FR-154               | Immediate transactional confirmation job          |
| Webinar reminders/follow-up    | FR-31..33, FR-79..84 | Time-based and post-attendance chained jobs       |
| AI quality feedback loop       | FR-126..130          | Feedback ingestion + triage aggregation jobs      |
| Knowledge base update workflow | FR-92..95            | Proposal aggregation + approval workflow tasks    |


## Data Model (Minimum Tables)

- `events` (event_name, payload, source, idempotency_key, status)
- `jobs` (job_type, queue, run_at, attempts, status, error)
- `notification_preferences` (channels, interests, frequency, quiet_hours)
- `campaigns` (rules, templates, eligibility, active_flag)
- `campaign_deliveries` (recipient, channel, sent_at, status)
- `enrollment_notifications` (order_id, admin_recipients, telegram_targets, status)
- `ai_feedback` (response_id, helpful, correct, comments, role_topic)
- `kpi_rollups_daily` (metric_name, dimension, value, date)

## API Boundaries

- `POST /events` (internal event ingest)
- `POST /jobs/dispatch` (internal scheduler/dispatcher)
- `GET /admin/jobs` (ops status)
- `GET /admin/campaigns/performance` (campaign metrics)
- `POST /admin/campaigns/{id}/run` (manual trigger with governance)

## Security & Compliance

- service-to-service auth for internal job APIs
- encrypted secrets and webhook signature verification
- PII minimization in queue payloads
- audit logs for campaign changes and admin overrides
- consent checks enforced before outbound messaging

## Cost Control Strategy

1. Start with one backend service + one worker process + one scheduler process.
2. Use Supabase pgvector before introducing separate vector DB.
3. Use Wix email automation where possible; move to dedicated provider only when transactional complexity demands.
4. Defer CRM/community integrations until KPI evidence supports ROI.

## Phase Gates

### MVP Gate (Go Live)

- all FR automation requirements covered with backend jobs
- retry/DLQ operational
- key campaign flows live (cart, inactivity, enrollment, scholarship)
- ops dashboard and alerting active

### Phase 2 Upgrade Triggers

- notification volume or complexity outgrows current adapters
- AI throughput requires dedicated queue workers or model-specific scaling
- CRM handoff needs robust sales pipeline orchestration

## Final Recommendation

This architecture is practical and cost-minimized for MVP.  
Use **Wix + FastAPI + Supabase + Stripe + OpenRouter + Backend Jobs + PostHog + Microsoft Clarity + Sentry + MS Teams** as the default baseline, and defer additional tools until KPI evidence justifies them.