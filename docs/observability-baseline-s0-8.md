# Observability Baseline Runbook (S0.8)

## Scope

This baseline adds reliability visibility for:

- API process
- worker process
- scheduler process
- product analytics event wrapper

## Instrumentation

### 1) Sentry bootstrap

Implemented in:

- `server/src/observability/sentry.ts`
- `server/src/observability/bootstrap.ts`

Integrated in:

- `server/src/index.ts`
- `server/src/runtime/worker.ts`
- `server/src/runtime/scheduler.ts`

Behavior:

- initializes Sentry when `SENTRY_DSN` is configured
- captures `uncaughtException` and `unhandledRejection`
- logs structured lifecycle events for observability startup

### 2) Structured logging standard

Logger baseline in `server/src/runtime/logger.ts` now emits:

- `service`
- `env`
- `component`
- `event`
- `requestId`
- timestamp + pid + level + message

## Product Event Wrapper (PostHog)

Wrapper file:

- `server/src/observability/posthog.ts`

Behavior:

- validates events via Zod schema (`distinctId`, `event`, `properties`)
- skips safely when API key is not configured
- flushes immediately for deterministic baseline behavior

## Clarity instrumentation plan

Client bootstrap helper:

- `client/src/lib/clarity.ts`

Client entry wiring:

- `client/src/main.tsx`

Enable with:

- `VITE_CLARITY_PROJECT_ID=<id>`

## Baseline alert hooks and dashboards

Policy constants:

- `server/src/observability/alerts.ts`

Initial thresholds:

- API error rate spike (>5% / 5m) -> pager
- queue lag sustained (>120s / 10m) -> Slack
- job failure spike (>20 / 10m) -> Slack

Use these as templates in your monitor provider (Sentry/PostHog/DataDog/Grafana).

## Synthetic validation

Script:

- `server/scripts/observability-synthetic-failure.ts`

Run:

```bash
cd server
npm run observability:synthetic
```

Expected:

- structured start/end log lines
- synthetic failure log
- Sentry issue (if DSN configured)
- one PostHog event attempt (if API key configured)

## On-call response baseline

1. Triage alert severity and affected role (`api`/`worker`/`scheduler`).
2. Correlate logs by `event` and `requestId`.
3. Inspect latest Sentry issues for stack traces.
4. Confirm queue/job status from DB and synthetic event health.
5. Escalate to incident channel if critical threshold exceeds 15 minutes.
