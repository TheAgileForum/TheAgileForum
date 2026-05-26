# Story S0.8: Observability Baseline (Sentry/PostHog/Clarity + Alert Hooks)

## Story Intent

As operations and engineering, we need observability from day one so failures are detectable and KPI events are traceable.

## Owner Lane

- Primary: DevOps + Backend Platform
- Supporting: Frontend, Growth Analytics

## Dependencies

- S0.3, S0.6

## Step-by-Step Tasks

1. Integrate Sentry in API, worker, and scheduler processes.
2. Define structured logging standard and required context fields.
3. Implement PostHog event wrapper with schema checks.
4. Define Clarity instrumentation plan for web surfaces.
5. Configure alert conditions for API errors, queue lag, and job failure spikes.
6. Build baseline dashboards for request failures and job reliability.
7. Run synthetic failure injection to validate alert routes.
8. Document on-call response and escalation process.

## Acceptance Checklist

- [ ] Exceptions in core processes are captured in Sentry.
- [ ] Structured logs include traceable context fields.
- [ ] Product events are emitted through validated wrappers.
- [ ] Alerts trigger and route correctly during synthetic tests.

## Evidence Required

- Sentry issue capture screenshots/logs.
- Dashboard and alert policy screenshots.
- Synthetic failure test report.

## Risks and Rollback

- Risk: noisy alerts create alert fatigue.
- Mitigation: tune thresholds and add severity levels early.
- Rollback: keep critical alerts only while recalibrating non-critical monitors.

## Definition of Done

This story is done when platform reliability and key event flows are observable with actionable alerting.
