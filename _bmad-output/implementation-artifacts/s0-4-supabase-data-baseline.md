# Story S0.4: Supabase Data Baseline (Schema, Migrations, Seeds)

## Story Intent

As backend and data owners, we need a migration-safe schema baseline so Sprint 1 stories can ship without database instability.

## Owner Lane

- Primary: Backend + Data
- Supporting: DevOps, QA

## Dependencies

- S0.2, S0.3

## Step-by-Step Tasks

1. Define initial tables for users, profiles, consent events, events, jobs, carts, orders.
2. Define role and permission mapping tables for RBAC.
3. Add baseline indexes for expected Sprint 1 query paths.
4. Establish migration naming/versioning conventions.
5. Create first migration bundle and apply on clean database.
6. Create seed scripts for roles and foundational lookup data.
7. Validate migration + seed idempotency.
8. Document rollback process for failed migrations.
9. Run schema smoke queries to validate table integrity.

## Acceptance Checklist

- [ ] Migration scripts are versioned and reproducible.
- [ ] Seed scripts run without manual patching.
- [ ] Rollback procedure is documented and tested.
- [ ] Baseline schema supports Sprint 1 critical domains.

## Evidence Required

- Migration execution logs (apply + rollback test).
- Seed run logs.
- ERD/schema snapshot for baseline domain model.

## Risks and Rollback

- Risk: schema churn causes frequent migration conflicts.
- Mitigation: migration review gate and ownership per domain.
- Rollback: revert to last known good migration and reseed.

## Definition of Done

This story is done when a fresh environment can be fully provisioned with migrations and seeds in a deterministic way.
