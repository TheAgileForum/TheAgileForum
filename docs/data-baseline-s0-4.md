# Data Baseline Runbook (S0.4)

## Purpose

Define the baseline database domains, migration workflow, and rollback checks for Sprint 0 data readiness.

## Baseline Domains

- Identity and access: `users`, `tenants`, `tenant_memberships`
- Role and permission mapping: `role_definitions`, `permissions`, `role_permissions`
- Consent governance: `consent_events`
- Event-driven runtime: `events`, `jobs`
- Commerce baseline: `carts`, `cart_items`, `orders`, `order_items`

## Migration Workflow

1. Review `server/prisma/schema.prisma` changes.
2. Apply migrations in dev:
   - `cd server`
   - `npm run db:migrate`
3. Generate and verify Prisma client:
   - `npm run db:generate`
4. Seed baseline reference data:
   - `npm run db:seed`

## Idempotency Expectations

- Seeds use `upsert` for role/permission and demo user data.
- Re-running seed should not create duplicate role definitions or permission mappings.

## Rollback Procedure (Baseline)

1. Identify problematic migration.
2. Reset local dev database:
   - `npm run db:reset`
3. Reapply migrations and seed:
   - `npm run db:migrate`
   - `npm run db:seed`
4. Validate critical queries and auth smoke tests.

## Ownership

- Schema ownership: Backend platform lead
- Migration approval: Tech lead + reviewer
- Seed data approval: Product + backend owner
