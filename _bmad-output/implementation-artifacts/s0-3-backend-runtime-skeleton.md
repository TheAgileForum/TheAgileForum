# Story S0.3: Backend Runtime Skeleton (API + Worker + Scheduler)

## Story Intent

As engineering, we need a runnable backend runtime skeleton so synchronous APIs and asynchronous jobs can evolve without architecture rework.

## Owner Lane

- Primary: Backend
- Supporting: DevOps

## Dependencies

- S0.1, S0.2

## Step-by-Step Tasks

1. Scaffold FastAPI project with modular package layout.
2. Add `/health`, `/ready`, and `/version` endpoints.
3. Scaffold queue worker process with startup/shutdown hooks.
4. Scaffold scheduler process with periodic job registration.
5. Build shared config loader consumed by API, worker, scheduler.
6. Add shared structured logger and correlation-id support.
7. Create local orchestration config (e.g., compose) for API + Redis + worker + scheduler.
8. Validate startup and graceful shutdown for all processes.
9. Add smoke test verifying all process health endpoints.

## Acceptance Checklist

- [ ] API, worker, scheduler run together in local.
- [ ] Health checks return expected status codes.
- [ ] Shared config and logging modules are reused across processes.
- [ ] Smoke tests validate runtime boot path.

## Evidence Required

- Process startup logs for all services.
- Health endpoint response captures.
- Runtime architecture note showing module boundaries.

## Risks and Rollback

- Risk: hidden coupling between process config causes runtime failures.
- Mitigation: one config contract with strict schema validation.
- Rollback: temporarily disable scheduler jobs while stabilizing base runtime.

## Definition of Done

This story is done when the team can launch and observe API, worker, and scheduler as one coherent backend foundation.
