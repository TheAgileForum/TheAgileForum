# QA Pending Work Queue

**Artifacts root:** `C:\AgileForum\mybmadproj\_bmad-output\test-artifacts`  
**Branch:** `sprint/s1-foundation-revenue-slice`

## Done (this session)

- [x] Moved agent workspace to `C:\AgileForum\mybmadproj`
- [x] Created `test-artifacts/` with README, test-summary, commerce plan, pending queue
- [x] Unit suite green: **67 passed** (`npm run test`)
- [x] Added exam access integration tests (402 paid / 200 free) in `commerce.integration.test.ts`

## Pending (priority order)

### P1 — Verification
- [x] Commerce integration slice: **7 passed**
- [x] Full integration: **33 passed** — recorded in `test-summary.md` (2026-06-05)
- [ ] Archive run log under `docs/reports/` if needed for S0.10 sign-off

### P2 — Sprint 1 tracker (see `implementation-artifacts/sprint-1-remaining-work-tracker.md`)
- [ ] Clean-machine bootstrap smoke
- [ ] Security/compliance checklist review (S0.9)
- [ ] Sign-off names on readiness gate
- [ ] LinkedIn OAuth live mode
- [ ] Manual org-checkout E2E on staging
- [ ] Stripe test-mode CI integration test

### P3 — QA depth
- [ ] Exam listing access-label contract test (FR-87)
- [ ] Cart add idempotency integration case
- [ ] CI required check for `npm run test`

## Legacy

Docs under `_bmad-output/implementation-artifacts/tests/` — prefer `test-artifacts/` for updates.
