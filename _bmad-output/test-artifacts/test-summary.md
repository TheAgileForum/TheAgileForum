# Test Automation Summary

**Location:** `_bmad-output/test-artifacts/`  
**Branch:** `sprint/s1-foundation-revenue-slice`  
**Last run:** 2026-06-04

## Latest Run Status

| Suite | Result |
|-------|--------|
| `npm run test` (unit/contract) | **67 passed** (24 files, ~33s) |
| `npm run test:integration` (commerce slice) | **7 passed** (`commerce.integration.test.ts`, ~57s) |
| `npm run test:integration` (full) | Run full suite and record total |

## Test Inventory

### Auth & consent
- `server/src/auth.contract.test.ts` — contracts, rate-limit, OAuth stub redirect, malformed cookie
- `server/src/auth.integration.test.ts` — session, consent upsert, unsubscribe, rate-limit boundaries
- `server/src/auth.oauth.test.ts` — OAuth start redirect

### Commerce & checkout (Sprint 1)
- `server/src/commerce/checkout-policy.test.ts` — FR-157, FR-85–87, FR-152/153 unit policy
- `server/src/commerce/commerce.integration.test.ts` — cart, checkout, Stripe webhook, org reimbursement, exam access

### Security (S0.9)
- `server/src/middleware/security.test.ts`
- `server/src/middleware/error-handler.test.ts`
- `server/src/security/audit.test.ts`
- `server/src/security/upload-policy.test.ts`

### Events & integrations
- `server/src/events/contracts.test.ts`, `processor.test.ts`, `publisher.test.ts`
- `server/src/routes/stripe-webhook.routes.test.ts`
- `server/src/integrations/factory.test.ts`, `external-call.test.ts`

### Observability (S0.8 / S0.10)
- `server/src/observability/posthog.test.ts`, `sentry.test.ts`, `bootstrap.test.ts`, `alerts.test.ts`
- Script tests: synthetic failure, readiness gate, synthetic event flow

### Diagnosis (Sprint 1)
- `server/src/diagnosis/diagnosis.contract.test.ts`

### Notifications
- `server/src/notifications/enrollment-notifier.test.ts`
- `server/src/services/email-verification-service.test.ts`

## Commerce policy coverage (implemented)

| FR | Coverage |
|----|----------|
| FR-157 | Unit + integration (schedule-required cart) |
| FR-85–87 | Unit + integration (`/commerce/exam/access` 402/200) |
| FR-151 | Integration (checkout auth gate) |
| FR-152/153 | Unit + integration (org reimbursement) |

## Next Steps

1. Run `npm run test:integration` and record count in this file.
2. Manual E2E per `docs/sprint-1-e2e-smoke.md`.
3. Stripe test-mode CI secret for webhook integration (tracker §5).
4. CI required check: `cd server && npm run test`.
