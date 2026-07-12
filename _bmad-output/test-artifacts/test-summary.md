# Test Automation Summary

**Location:** `_bmad-output/test-artifacts/`  
**Branch:** `sprint/s1-foundation-revenue-slice`  
**Last run:** 2026-07-12 (Playwright FR-177 global cart badge — 3 passed)  
**Last planning reconciliation:** 2026-06-08 (Quinn)

## Latest Run Status

| Suite | Result |
|-------|--------|
| `client` Playwright `e2e/global-cart-badge.spec.ts` | **3 passed** — 2026-07-12 (`e2e/client-global-cart-badge-2026-07-12.json`) |
| `npm run test` (unit/contract) | **160 passed** (39 files) — 2026-06-08 |
| `npm run test:integration` (full) | **45 passed** (3 files) — 2026-06-08 |

### Integration breakdown (2026-06-08)

| File | Tests |
|------|-------|
| `auth.integration.test.ts` | 23 |
| `diagnosis.integration.test.ts` | 5 |
| `commerce.integration.test.ts` | 17 |

**Combined automated count (unit + integration):** **205 passed** (160 unit + 45 integration)

## QA Plan Index (FR-mapped)

| Plan | FR scope | Status |
|------|----------|--------|
| `auth-consent-rbac-test-plan.md` | FR-1..3, FR-151, FR-180 | Active — 23 integration tests green |
| `diagnosis-journey-test-plan.md` | FR-3..7, FR-12, FR-158..160, FR-181 | Active — 5 integration tests green |
| `commerce-checkout-policy-test-plan.md` | FR-85–87, FR-151–157, FR-165–166, FR-154, FR-176 | Active — 17 integration tests green |
| `catalog-browse-test-plan.md` | FR-161–168, FR-87, FR-179 | Active — 9 route + 5 filter tests green |
| `emi-installment-test-plan.md` | FR-169–175, FR-13, FR-178 | Active — 11 payment-mode + quote tests; IN EMI stub checkout |
| `shell-trust-commerce-test-plan.md` | FR-176–182 | Partial — BE APIs for 176–181; FR-182 POST publish gate done |

## Test Inventory (new this session)

### FR-182 admin catalog publish gate
- `admin-catalog.routes.ts` — POST `/offerings` rejects enabled schedule-bound offerings without schedules
- `admin-catalog.routes.test.ts` — 15 route tests (FR-182 POST publish gate)

### Razorpay EMI stub (FR-170)
- `checkout-service.ts` — `razorpayEmiPlans` + stub checkout URL for IN installment mode
- `commerce.integration.test.ts` — IN installment checkout returns EMI plans without live API

### Pricing & currency (FR-178)
- `server/src/pricing/supported-currencies.ts` + `.test.ts` — launch currency list, geo map, IDR zero-decimal formatting
- `server/src/pricing/currency-context.ts` + `.test.ts`
- `server/src/pricing/quote-service.ts` + `.test.ts`
- `server/src/routes/pricing.routes.ts` + `.test.ts`

### Role-based upsell (FR-181)
- `server/src/recommendations/upsell-service.ts` + `.test.ts`
- `server/src/routes/recommendations.routes.ts` + `.test.ts`

### Catalog trust (FR-179)
- `server/src/catalog/catalog-response-policy.ts`
- `catalog.routes.test.ts` — no discount marketing fields gate

### Cart shell & journey origin (FR-176, FR-177)
- `lineCount` on guest/authed cart serialization
- `commerceJourneyOrigin` on cart add + checkout start
- `commerce.integration.test.ts` — 3 new tests

### Admin catalog (FR-180, FR-182)
- `admin-catalog.routes.test.ts` (15 route tests) + `auth.integration.test.ts` RBAC cases
- `server/scripts/import-wix-catalog.ts` — Wix export import

## Coverage gaps (remaining)

| Priority | Gap | Plan |
|----------|-----|------|
| P1 | Stripe test-mode CI webhook E2E | commerce plan |
| P1 | Razorpay EMI live sandbox (FR-170) | emi plan — stub done |
| P2 | Global cart shell FE badge (FR-177) | **Done** — Playwright `client/e2e/global-cart-badge.spec.ts` (3 tests) |
| P2 | Journey origin PostHog events (FR-176) | **Done** — `product-events.ts` + `commerce-analytics.ts` wired on cart/checkout |
| P2 | Live PostHog capture in staging | **Ready** — set `POSTHOG_API_KEY` + run `npm run observability:posthog-verify`; see `docs/staging-posthog-setup.md` |
| P2 | Client PostHog browser events | **Done** — `posthog-js` + `VITE_POSTHOG_KEY` via `trackEvent()` |
| P2 | Installment analytics events (FR-175) | emi plan |
| P3 | Homepage diagnosis-primary regression (FR-161) | catalog plan |
| P3 | LinkedIn OAuth live mode | auth plan |

## Next Steps

1. Manual E2E per `docs/sprint-1-e2e-smoke.md`.
2. Stripe test-mode CI secret for webhook integration.
3. CI required check: `cd server && npm run test`.
4. Set staging secrets and run `cd server && npm run observability:posthog-verify` (see `docs/staging-posthog-setup.md`).
5. Wire PostHog events for installment funnel completion (FR-175).
