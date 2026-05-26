# Sprint 0 Execution Playbook - Setup + Architecture Enablers

## Objective

Execute a no-blocker foundation sprint that prepares engineering, data, observability, and deployment rails for Sprint 1 product delivery.

## Scope Boundary

Sprint 0 includes setup and enablers only. Avoid building full user-facing product flows beyond smoke validation.

## Story Set (Sprint 0)

- `S0.1` Repo + Standards + CI Baseline
- `S0.2` Environment and Secrets Setup (Dev/Stage)
- `S0.3` Backend Runtime Skeleton (API + Worker + Scheduler)
- `S0.4` Supabase Data Baseline (Schema, Migrations, Seeds)
- `S0.5` Auth/RBAC/Consent Enabler Contracts
- `S0.6` Event and Queue Contract Baseline
- `S0.7` Integrations Scaffolding (Stripe/Email/Telegram/Webinar)
- `S0.8` Observability Baseline (Sentry/PostHog/Clarity + alert hooks)
- `S0.9` Security and Compliance Setup Baseline
- `S0.10` Release Readiness Gate for Sprint 1 Start

## Execution Sequence (Do in order)

1. `S0.1` -> `S0.2` -> `S0.3`
2. `S0.4` parallel with late phase of `S0.3`
3. `S0.5` after `S0.3` + `S0.4`
4. `S0.6` after `S0.3`
5. `S0.7` after `S0.3` + `S0.6`
6. `S0.8` starts early, completes after `S0.3` + `S0.6`
7. `S0.9` after `S0.2` + `S0.5`
8. `S0.10` final gate

---

## S0.1 - Repo + Standards + CI Baseline

## Goal

Create shared engineering standards so all contributors can work consistently from day one.

## Minute-Step Task Checklist

1. Create/update repository structure (`apps`, `services`, `workers`, `docs`, `infra`).
2. Add branch strategy and PR template docs.
3. Add `.editorconfig` and lint/format standards.
4. Add language-specific lint configs for backend and frontend packages.
5. Add base unit test runner config and smoke test task.
6. Add CI workflow: install -> lint -> test -> build.
7. Add required status checks in repo policy documentation.

## Deliverables

- CI passing on baseline branch.
- Engineering standards docs committed.
- PR template with checklist and acceptance gate fields.

## Exit Criteria

- Every PR triggers automated checks.
- New contributor onboarding takes less than 30 minutes.

---

## S0.2 - Environment and Secrets Setup (Dev/Stage)

## Goal

Ensure repeatable environment bootstrapping and secure secrets handling.

## Minute-Step Task Checklist

1. Define environment matrix: local-dev, shared-dev, staging.
2. Create `.env.example` for each service (API/worker/scheduler/frontend).
3. Classify secrets by level: required-at-runtime vs optional.
4. Configure secret storage pattern (platform-managed secrets, never plaintext in repo).
5. Add startup validation script to fail fast on missing required env vars.
6. Document environment bootstrap steps in one runbook.
7. Verify local startup from clean machine using only runbook.

## Deliverables

- Environment runbook.
- Secret inventory sheet with owner and rotation cadence.
- Env validation script integrated in startup.

## Exit Criteria

- No hardcoded secrets in code.
- All services fail-fast with clear config errors.

---

## S0.3 - Backend Runtime Skeleton (API + Worker + Scheduler)

## Goal

Provision operational skeleton for synchronous APIs and asynchronous jobs.

## Minute-Step Task Checklist

1. Scaffold FastAPI project with modular route layout.
2. Add health, readiness, and version endpoints.
3. Scaffold worker process with queue consumer loop.
4. Scaffold scheduler process with cron-like task registration.
5. Add shared config module for all processes.
6. Add shared logging module with correlation id support.
7. Create docker-compose (or equivalent) for API + Redis + worker + scheduler local run.
8. Validate all processes start together and stop cleanly.

## Deliverables

- Runnable local stack with API, Redis, worker, scheduler.
- Health endpoints for each process role.

## Exit Criteria

- Single command starts full backend runtime in local.
- Logs include request/job correlation ids.

---

## S0.4 - Supabase Data Baseline (Schema, Migrations, Seeds)

## Goal

Establish stable schema and migration process for Sprint 1 stories.

## Minute-Step Task Checklist

1. Define initial domain tables: users, profiles, consents, events, jobs, carts, orders.
2. Add RBAC role mapping and permission tables.
3. Add indexes for expected Sprint 1 query paths.
4. Configure migration framework and naming conventions.
5. Create seed scripts for baseline roles and sample data.
6. Add rollback-safe migration validation checklist.
7. Run migration and seed in clean environment.
8. Document schema ownership and migration approval process.

## Deliverables

- Migration scripts v1.
- Seed data package.
- Data model and ownership doc.

## Exit Criteria

- Fresh database can be provisioned and seeded automatically.
- Migration rollback procedure is tested.

---

## S0.5 - Auth/RBAC/Consent Enabler Contracts

## Goal

Create contract-first auth and authorization rails before feature implementation.

## Minute-Step Task Checklist

1. Define auth API contracts (signup/login/logout/session refresh).
2. Define OAuth continuation contract placeholders.
3. Implement session token issuance and validation middleware.
4. Implement RBAC guards with role matrix.
5. Add consent capture schema and API contract.
6. Add route-level authorization annotation standard.
7. Add integration tests for auth happy/failure paths.
8. Add audit-log event emission for auth-sensitive actions.

## Deliverables

- Auth and RBAC contract docs.
- Middleware scaffolds and test baseline.

## Exit Criteria

- Protected routes enforce auth + role checks.
- Consent records are captured and queryable.

---

## S0.6 - Event and Queue Contract Baseline

## Goal

Define canonical event contracts so automation in Sprint 1 is deterministic.

## Minute-Step Task Checklist

1. Define canonical event envelope (`event_name`, `source`, `payload`, `idempotency_key`, `occurred_at`).
2. Define initial event catalog for Sprint 1 (`checkout.completed`, `order.confirmed`, etc.).
3. Define queue taxonomy (`q_critical`, `q_notifications`, `q_reporting`, `q_ai_processing`).
4. Define retry policy and DLQ routing rules by queue.
5. Implement event publisher utility and job dispatcher abstraction.
6. Implement idempotency deduplication check.
7. Create contract tests for event schema and queue routing.
8. Document replay procedure for failed jobs.

## Deliverables

- Event catalog v1.
- Queue contract + retry/DLQ policy doc.
- Publisher/dispatcher utility module.

## Exit Criteria

- Event contract violations fail tests.
- At least one synthetic event is processed end-to-end.

---

## S0.7 - Integrations Scaffolding (Stripe/Email/Telegram/Webinar)

## Goal

Prepare external integration adapters without fully enabling business flows yet.

## Minute-Step Task Checklist

1. Define adapter interface for each integration.
2. Add stub implementations with deterministic responses.
3. Add webhook endpoint skeleton with signature verification placeholder.
4. Add provider-specific error mapping standards.
5. Add timeout/retry wrapper for external calls.
6. Add integration sandbox credentials loading pattern.
7. Add integration smoke tests (stub mode).

## Deliverables

- Adapter interface contracts.
- Stub implementations + smoke tests.

## Exit Criteria

- Switching from stub to real adapter requires config change only.
- External failure modes are represented in typed errors.

---

## S0.8 - Observability Baseline (Sentry/PostHog/Clarity + alert hooks)

## Goal

Ensure every critical foundation component is observable before product rollout.

## Minute-Step Task Checklist

1. Integrate Sentry into API, worker, scheduler.
2. Add structured log format standard with context fields.
3. Add PostHog event producer wrapper with schema validation.
4. Add Clarity instrumentation plan for web surfaces.
5. Define operational alerts for API down, queue lag, job failure spike.
6. Add dashboard widgets for request error rate and job failure rate.
7. Validate alerts by synthetic failure injection.

## Deliverables

- Observability configuration docs.
- Alert policy and escalation matrix.
- Synthetic test logs/events proving instrumentation works.

## Exit Criteria

- Critical failures are visible within defined detection window.
- KPI-event instrumentation wrapper is usable by Sprint 1 stories.

---

## S0.9 - Security and Compliance Setup Baseline

## Goal

Install baseline controls for privacy, consent, and operational safety.

## Minute-Step Task Checklist

1. Add API input validation and output sanitization standard.
2. Enable rate-limiting strategy for sensitive endpoints.
3. Define upload validation rules (mime/size/scan hooks) for resume flows.
4. Implement consent/unsubscribe data model baseline.
5. Add security headers and CORS policy templates.
6. Document retention policy baseline for PII artifacts.
7. Add audit logging for privileged/admin actions.
8. Run baseline security checklist and remediate blockers.

## Deliverables

- Security baseline checklist report.
- Compliance control mapping to PRD NFRs.

## Exit Criteria

- No high-severity baseline security findings open.
- Consent and unsubscribe controls are technically enforceable.

---

## S0.10 - Sprint 1 Readiness Gate

## Goal

Formally certify readiness to start Sprint 1 feature implementation.

## Minute-Step Task Checklist

1. Run full CI pipeline on integration branch.
2. Run environment bootstrap from clean machine and record timing/issues.
3. Run API + worker + scheduler + Redis smoke workflow.
4. Execute auth + consent + RBAC contract test suite.
5. Execute synthetic event dispatch and job retry/DLQ test.
6. Execute observability and alert smoke verification.
7. Conduct architecture and security checklist sign-off.
8. Publish Sprint 0 closure note with open risks and owners.

## Deliverables

- Sprint 0 completion report.
- Sprint 1 go/no-go decision record.
- Risk register for unresolved non-blockers.

## Exit Criteria (Must Meet All)

- Foundation services are stable in dev and staging.
- Enabler contracts are approved and documented.
- Monitoring and alerting are active.
- Security/compliance baseline is signed off.
- Sprint 1 stories can start with no infrastructure blockers.

---

## Suggested Daily Execution Cadence (Example)

- Day 1: `S0.1`, `S0.2` kickoff and completion
- Day 2: `S0.3` + start `S0.4`
- Day 3: complete `S0.4`, execute `S0.5`
- Day 4: execute `S0.6`, `S0.7`
- Day 5: execute `S0.8`, `S0.9`
- Day 6: `S0.10` readiness gate, closure, Sprint 1 handoff

## Final Note

This Sprint 0 playbook is intentionally granular and execution-oriented.  
If you want, the next step is converting each `S0.x` story into individual implementation story files with owners, estimates, and a task board-ready checklist.
