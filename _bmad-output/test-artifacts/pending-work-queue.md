# QA Pending Work Queue



**Artifacts root:** `C:\AgileForum\mybmadproj\_bmad-output\test-artifacts`  

**Branch:** `sprint/s1-foundation-revenue-slice`  

**Last updated:** 2026-06-08 (Amelia follow-up — FR-182 POST gate, Razorpay EMI stub)



## Done (this session)



- [x] Moved agent workspace to `C:\AgileForum\mybmadproj`

- [x] Created `test-artifacts/` with README, test-summary, commerce plan, pending queue

- [x] Unit suite green: **95 passed** (`npm run test`) — 2026-06-08

- [x] Integration suite green: **38 passed** (`npm run test:integration`) — 2026-06-08

- [x] Added exam access integration tests (402 paid / 200 free) in `commerce.integration.test.ts`

- [x] Exam access labels on catalog listings (FR-85/86/87) — `catalog.routes.test.ts`

- [x] Category filter combo tests (role + delivery + batch, price range) — `catalog.routes.test.ts`

- [x] Cart add idempotency (authenticated cart merges duplicate lines) — `cart-service.ts` + integration test

- [x] Test run log archived — `docs/reports/test-run-2026-06-08.txt`

- [x] **Planning doc recheck:** added `diagnosis-journey-test-plan.md`, `auth-consent-rbac-test-plan.md`, `shell-trust-commerce-test-plan.md`

- [x] **Planning doc recheck:** refreshed commerce, catalog, emi plans; synced stale gap items

- [x] **Planning doc recheck:** updated `test-summary.md` with QA plan index and gap matrix

- [x] **Catalog SSOT** — `catalog-repository.ts` + seed/import patterns (FR-182)

- [x] **Admin catalog APIs** — `admin-catalog.routes.ts` + contract tests (FR-180, FR-182)

- [x] **Pricing resolver** — `pricing-service.ts`, `quote-service.ts`, currency context (FR-178)

- [x] **Payment modes API** — `GET /commerce/payment-modes` + `payment-mode.test.ts` (FR-170, FR-171)

- [x] **CI integration** — `.github/workflows/server-test.yml` required check for `npm run test`

- [x] **Schedule admin** — offering schedule CRUD + enable/disable gates (FR-182)

- [x] **Wix import script** — `server/scripts/import-wix-catalog.ts` (FR-182)

- [x] **Razorpay stub** — full-pay + EMI installment checkout stub for IN geo (FR-170)



## Pending (priority order)



### P1 — Verification

- [x] Commerce integration slice: **12 passed**

- [x] Full integration: **38 passed** — recorded in `test-summary.md` (2026-06-08)

- [x] Archive run log under `docs/reports/` if needed for S0.10 sign-off

- [ ] Stripe test-mode CI integration test

- [ ] Razorpay EMI sandbox checkout (FR-170 live API) — stub done; sandbox E2E remains



### P2 — Sprint 1 tracker (see `implementation-artifacts/sprint-1-remaining-work-tracker.md`)

- [ ] Clean-machine bootstrap smoke

- [ ] Security/compliance checklist review (S0.9)

- [ ] Sign-off names on readiness gate

- [ ] LinkedIn OAuth live mode — see `auth-consent-rbac-test-plan.md`

- [ ] Manual org-checkout E2E on staging



### P3 — QA depth (new plans from planning recheck)



**Shell & trust (`shell-trust-commerce-test-plan.md`)**

- [ ] Global cart shell FE + badge count (FR-177) — UX-08.5

- [ ] Multi-currency session + header override (FR-178) — UX-10.1

- [ ] No public discount fields on catalog API (FR-179) — UX-10.2

- [ ] Admin `/admin/*` RBAC beyond admin-check (FR-180)

- [ ] Role-based upsell API tests (FR-181) — UX-11.1

- [x] Catalog admin APIs + import script (FR-182) — Story 10.6 / T10.7

- [ ] `commerce_journey_origin` on cart/checkout events (FR-176)



**Catalog & EMI (existing plans)**

- [x] Wix export → backend import for SKU parity (content ops + BE, blocks catalog GA)

- [ ] Regional BNPL sandbox integrations per `payment-provider-matrix.md` (FR-171)

- [ ] Installment funnel analytics events (FR-175)

- [ ] Homepage diagnosis-primary regression (FR-161)

- [x] Catalog pricing resolver parity (FR-168, FR-178)

- [x] CI required check for `npm run test`



**Diagnosis (`diagnosis-journey-test-plan.md`)**

- [ ] JD save path integration test (IT-05)

- [ ] Diagnosis analytics events (IT-12)

- [ ] Roadmap task PATCH progress (FR-160, IT-14)



### Completed (prior sessions — do not reopen)

- [x] Exam listing access-label contract test (FR-87)

- [x] Cart add idempotency integration case

- [x] Guest cart merge at login integration (FR-165/166) — 4 tests in `commerce.integration.test.ts`

- [x] Category list route contract tests (trainings/certifications/services) — `catalog.routes.test.ts`

- [x] Catalog filter unit tests (`catalog/filter.test.ts`) — 5 passed

- [x] Payment mode resolver unit tests (`commerce/payment-mode.test.ts`) — 5 passed

- [x] Catalog routes contract tests (`catalog.routes.test.ts`) — 8 passed



## Legacy



Docs under `_bmad-output/implementation-artifacts/tests/` — prefer `test-artifacts/` for updates.

