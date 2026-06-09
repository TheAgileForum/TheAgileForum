# Sprint 1 Remaining Work Tracker

**Project:** The Agile Forum  
**Branch:** `sprint/s1-foundation-revenue-slice`  
**Last updated:** 2026-06-08  
**Purpose:** Single checklist for open gaps called out in delivery review. Keep this file updated as items close.

---

## Persistent constraints (do not forget)

| Constraint | Current state | Target |
|------------|---------------|--------|
| **Diagnosis analysis** | Stub worker in `analysis-runner.ts` (deterministic gaps + recommendation) | Production AI pipeline (OpenRouter + RAG + guardrails) — **post–Sprint 1 or gated slice** |
| **Stripe** | Webhook route + stub `paymentRef` on `completeCheckout` | Real PaymentIntent / Checkout Session, signature-verified webhooks, idempotent order `paid` transition |
| **Wix** | Marketing home on Wix; product UI on Vite (`localhost:5173` / future `app.*`) | Wix CTAs/embeds + analytics; not a full port of React app into Wix |

---

## 1) S0.10 — Sprint 1 readiness gate (sign-off)

**Artifact:** `s0-10-sprint-1-readiness-gate.md`

### Tasks

- [x] Run full CI on `sprint/s1-foundation-revenue-slice` and attach results to closure report. _(2026-05-31: `docs/reports/gate-evidence-20260529.log`, `s0-10-closure-report.md`.)_
- [ ] Clean-machine bootstrap: `docker compose up`, `prisma migrate deploy`, `npm test` (server), `npm run build` (client). _(Run on second machine before production sign-off.)_
- [ ] Smoke: API health, Redis/worker/scheduler (if used), diagnosis → analyze → result, checkout start/complete.
- [x] Run auth/RBAC/consent contract + integration suites; capture pass/fail counts. _(59 unit + 27 integration tests passed.)_
- [x] Run synthetic event + observability scripts (`observability:synthetic`, readiness-gate script). _(Gate **GO**.)_
- [ ] Security/compliance checklist review (S0.9 baseline).
- [ ] Publish risk register (owners + target sprint).
- [x] Go/no-go meeting + documented decision. _(Automated **GO**; human sign-off names pending.)_

### Acceptance checklist (from S0.10)

- [x] All Sprint 0 stories meet exit criteria.
- [x] No blocking issues on Sprint 1 critical path (enabler scope).
- [x] Go/no-go documented — `docs/reports/sprint-1-readiness-gate-s0-10.md`.
- [x] Evidence: closure report, test outputs — `docs/reports/s0-10-closure-report.md`.
- [ ] Sign-off record (Tech, QA, Security, SM names/dates).

---

## 2) Story 1.1 — Google / LinkedIn OAuth

**Current:** Dev-stub OAuth + Google live path when `GOOGLE_CLIENT_*` set; LinkedIn live pending.

### Tasks

- [ ] Configure OAuth apps (Google, LinkedIn) in provider consoles; store secrets in `server/.env` (never commit).
- [x] Add routes: `GET /api/v1/auth/oauth/:provider/start`, `GET /api/v1/auth/oauth/:provider/callback`.
- [x] Map provider identity → user record (link or create); issue same session/JWT pattern as email login.
- [x] FE: login page buttons for Google + LinkedIn; handle callback/error states.
- [x] Tests: `server/src/auth.oauth.test.ts` (stub redirect); OAuth callback in `auth.integration.test.ts`.
- [x] Update `server/.env.example` with OAuth env vars.
- [ ] LinkedIn token exchange + profile fetch (live mode).

**Done when:** Story 1.1 acceptance criteria (signup/login via Google and LinkedIn) pass in staging.

---

## 3) Commerce policy tests — `checkout-policy.test.ts`

**Current:** Unit policy tests implemented; commerce integration covers cart/checkout.

### Tasks

- [x] Policy tests in `server/src/commerce/checkout-policy.test.ts`.
- [x] Integration: schedule-bound cart, checkout auth, org reimbursement (`commerce.integration.test.ts`).
- [x] Cover: exam `402` path via integration test (`commerce.integration.test.ts`).
- [ ] Cover: geo/pricing consistency hooks if in scope for Sprint 1.
- [ ] Run `npm test` and refresh `tests/test-summary.md` after each release.

**Done when:** No skipped/todo policy tests; CI green on commerce policy suite.

---

## 4) Story 4.4 / UX-03.2 — Org reimbursement checkout (FE + E2E)

**Current:** `ForumCheckoutPage` supports org branch; integration test passes.

### Tasks

- [x] FE: Detect cart eligibility (`safeOrgPaymentEligible` from catalog).
- [x] FE: Checkout branch UI — org vs standard.
- [x] FE: Org form fields + `startCheckout('org_reimbursement', ...)`.
- [x] BE: Org path completes to `paid` with PO payment ref (integration test).
- [ ] QA: Manual E2E on staging.
- [ ] Analytics: `org_checkout_submitted` (PostHog).

**Done when:** Story 4.4 and UX-03.2 acceptance criteria met in staging.

---

## 5) Stripe integration (real payments)

**Current:** Optional Stripe Checkout Session on `checkout/start` when `STRIPE_SECRET_KEY` set; stub path remains otherwise.

### Tasks

- [x] Flow: Stripe Checkout Session (`stripe-checkout-service.ts`).
- [x] `checkout/start` returns `stripeCheckoutUrl` when configured; FE redirects.
- [x] Webhook: map `checkout.session.completed` → `completeOrderFromStripeWebhook` (idempotent when already `paid`).
- [ ] Handle failures, expired sessions, and duplicate webhook delivery (retry-safe DLQ evidence).
- [ ] Integration test with Stripe test mode (CI secret).
- [x] Env: `STRIPE_SECRET_KEY` documented in `.env.example`.

**Done when:** Story 4.1 can complete a real test-mode payment end-to-end.

---

## 6) Epic 9 — Campaign automation (9.4, 9.5)

**Current:** Order enrollment notifications wired; **full campaign automation not done**.

### Tasks (Sprint 1 minimum vs full)

**Sprint 1 minimum (exit criteria):**

- [x] On order paid: `deliverEnrollmentNotifications` + events (`enrollment.order_confirmed`, `notification.enrollment_delivered`) — integration test.
- [x] Event persisted with idempotency (S0.6 baseline).
- [ ] Verify in staging with live email/Telegram adapters.

**Full campaign automation (may spill to Sprint 2):**

- [ ] Campaign rules engine + preference/fatigue (Epic 9.1–9.3).
- [ ] Cart abandoned, diagnosis drop-off, webinar reminders.
- [ ] Admin run/trigger APIs and PostHog funnel events.

**Done when:** Sprint 1 exit criteria bullet on notifications is evidenced; full automation tracked separately.

---

## 7) Diagnosis — production AI (replace stub worker)

**Current:** `processAnalysisRun` uses `buildStubRecommendation()` in `analysis-runner.ts`.

### Tasks

- [ ] Ingest resume/JD into storage + text extraction (real upload path, not metadata-only).
- [ ] Queue job calls OpenRouter (or worker) with guardrails + KB context (pgvector).
- [ ] Persist structured gap insight + recommendation from model output (validate schema).
- [ ] FE: handle longer runs, failures, and partial results; keep consent gate before analyze.
- [ ] Cost/latency limits, PII handling, and audit logging.
- [ ] QA: golden-path fixtures + red-team prompts for unsafe claims.

**Done when:** Story 2.1/2.2 acceptance criteria met with non-stub analysis (can be Sprint 1.5 or Sprint 2 if explicitly deferred).

---

## 8) Full Sprint 1 exit criteria — evidence pack

**Source:** `mvp-sprint-build-order-agile-forum.md` (Sprint 1 exit criteria).

| Criterion | Evidence needed | Status |
|-----------|-----------------|--------|
| Sign up/login → diagnosis → recommendation → purchase | Screen recording + API logs + DB rows | Partial |
| Schedule-bound + exam paid/free rules enforced | Policy tests + manual cart scenarios | Partial |
| Order triggers student + admin notifications | Email/Telegram capture or test doubles | Partial |
| Failure paths observable + retry-safe | Sentry, event DLQ, readiness-gate report | Partial |

### Tasks

- [x] Run readiness gate — `docs/reports/sprint-1-readiness-gate-s0-10.md` (**GO**).
- [x] E2E script — `docs/sprint-1-e2e-smoke.md`.
- [ ] Screen recording + DB evidence for product sign-off.
- [x] Defers listed in smoke doc + §1 persistent constraints.

---

## 9) UX / FE polish (Sprint 1 UX stories still open)

Quick reference — detail in `s1-3-ux-implementation-epics-stories-tasks.md`:

- [x] UX-01.1: proof strip, sticky mobile CTA, journey resume (journey-state API), Clarity analytics events. _(2026-06-08: ForumHomePage + analytics.ts.)_
- [x] UX-01.3: drag/drop upload, draft autosave, metadata upload path. _(2026-06-08: ResumeDropZone + step-2 draft.)_ · [ ] real binary upload + virus-scan hook (BE).
- [x] UX-01.4: timeout fallback + support link. _(2026-06-08: step-3 poll timeout ~60s.)_
- [x] UX-02.1/02.2: roadmap preview (API-driven), chips/table a11y toggle, low-confidence escalation + mentor CTA, secondary actions. _(2026-06-08: result-enrichment BE + diagnosis results components.)_
- [x] UX-03.1: offer trust block, policy links, pricing consistency with checkout. _(2026-06-08: OfferPage + formatPrice.)_
- [x] UX-08.1/08.2 (partial): `/trainings`, `/certifications`, `/services` listings, URL-synced filters, secondary nav, guest cart + badge, session currency selector. _(2026-06-08.)_
- [x] UX-08.3–08.5 (partial): cart remove/qty, upsell rail, catalog facets API, `commerce_journey_origin` on checkout. _(2026-06-08.)_
- [x] UX-09.1 (partial): EMI preview module on catalog cards + offer + checkout note (geo-asymmetric stub). _(2026-06-08.)_
- [ ] UX-09.2+: checkout EMI payment mode UI, gateway plan parity (FR-174).
- [x] UX-10/11: full FR-178 price resolver BE, upsell personalization from diagnosis role. _(2026-06-08: PricingContext + resolver quotes on catalog/offer/cart; upsell API with gap ranking + session currency.)_

---

## Suggested execution order

1. **Evidence / gate** — Close S0.10 checklist with CI + test artifacts (unblocks “done” narrative).  
2. **Policy tests** — Convert `checkout-policy.pending.test.ts` todos → real tests.  
3. **Org checkout FE** — Unblocks Story 4.4 without Stripe.  
4. **Stripe** — Standard payment path for Story 4.1.  
5. **OAuth** — Story 1.1 completeness.  
6. **Notifications** — Prove 9.4/9.5 for exit criteria.  
7. **Production AI** — Replace stub (explicit schedule: Sprint 1.5 vs 2).  
8. **Wix + analytics** — Parallel when API stable.

---

## Risk register (owners — assign in review)

| Risk | Owner | Target | Mitigation |
|------|-------|--------|------------|
| Stub diagnosis AI | BE Lead | Sprint 2 | OpenRouter pipeline + guardrails |
| Stripe webhook → paid order | BE Lead | Sprint 1.1 | Wire `checkout.session.completed` handler |
| Wix ↔ app integration | FE + Marketing | Sprint 3 | CTAs to `app.*`; Clarity on both |
| OAuth live providers | Platform | Sprint 1 | Configure Google/LinkedIn secrets in staging |
| Production AI cost/PII | Architect | Sprint 2 | Limits + audit on analyze path |

---

## How to update this file

When an item ships, check the box, add PR/commit link, and move deferred items to the target sprint section.
