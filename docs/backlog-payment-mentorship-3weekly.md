# Backlog — Payment & Mentorship Checkout (Stripe 3-Weekly Plan)

**Status:** DEFERRED (backlog only — not scheduled for implementation)
**Source requirement:** "TheAgileForum — Payment & Mentorship Checkout Requirements" (Phase 1 Stripe 3-Weekly Payment Plan; Phase 2 Affirm)
**Currency scope:** USD (Phase 1)
**Decision date:** 2026-08-08

---

## Decision

The full Stripe 3-weekly installment payment plan (and the deferred Affirm work)
is **captured in the backlog and deferred**. No implementation is scheduled at
this time. This document records the epics so the work can be picked up later
without re-analysis.

Rationale (see the feasibility analysis): the initiative is large and high-risk
(money movement + asynchronous webhook-driven state + access entitlement). The
current commerce model (`Order.status` free-text string, single `paymentRef`,
access derived from `status === "paid"`) has no room to express a multi-payment
lifecycle or the payment-vs-access split the spec requires. Implementing it means
a Prisma schema migration, a new payments/subscription service, expanded
webhooks, an entitlement-based access layer, a grace-period reconciliation job,
refund/cancellation flows, an admin payments view, and a provider abstraction.

The one change made now (outside this deferral) is a customer-facing cleanup:
**installment/EMI affordability messaging is suppressed for all non-INR
transactions** (see "Related change made now" below).

---

## Deferred epics

| Epic | Scope | Priority | Notes |
| --- | --- | --- | --- |
| EPIC-01 | Pricing & Checkout UX (Pay in Full vs 3 Weekly Payments; §5 terminology) | P0 | Extend `client/src/pages/forum/ForumCheckoutPage.tsx`, `CheckoutPaymentModeSelector.tsx`; must not say "monthly/subscription". |
| EPIC-02 | Stripe 3-Weekly Payment Plan (recurring billing; $166.34 + $166.33 + $166.33 = $499) | P0 | New Stripe Subscription Schedule integration; `integrations/stripe-api.ts` is `mode:"payment"` only today. |
| EPIC-03 | Stripe Webhooks (`invoice.*`, `customer.subscription.*`, `charge.refunded`) | P0 | Extend `routes/stripe-webhook.routes.ts` + `EventLog` idempotency. |
| EPIC-04 | Payment Failure & 3-Day Grace Period | P0 | Net-new time-based reconciliation job (Redis not installed; needs DB-poll or scheduler). |
| EPIC-05 | Customer Payment Method Recovery | P0 | Stripe Billing portal / SetupIntent + client update flow. |
| EPIC-06 | Mentorship Enrollment & Access (entitlement, not derived from paid order) | P0 | Replace `hasCompletedPaidOrder` with stored `access_status`. |
| EPIC-07 | Customer Notifications (6 templates, §25) | P1 | Extend `notifications/enrollment-notifier.ts`. |
| EPIC-08 | Admin Payment Dashboard (§24) | P1 | No orders/payments admin exists today (only catalog CRUD). |
| EPIC-09 | Refund & Cancellation (§26/§27 four-way distinction) | P1 | Net-new Stripe Refund API + access sync; refund matrix under-specified. |
| EPIC-10 | Security & Error Handling (§28/§29) | P0 | Keys already server-side; mostly the error matrix + hardening. |
| EPIC-11 | End-to-End Testing (§30 matrix via Stripe test clocks) | P0 | Largest ongoing cost; simulates weekly cadence + grace/suspension/recovery. |
| EPIC-12 | Payment Provider Abstraction / Affirm Readiness (§35) | P1 | Move checkout/refund/payment-method behind a `PaymentProvider` interface. |
| EPIC-13 | Affirm Integration | Phase 2 | Deferred; introduce only after Phase 1 data justifies it (§34 metrics). |

---

## Data model impact (when implemented — §22)

- Split `Order.status` (free string) into enum-backed `payment_status` + `access_status`.
- Add `payment_plan` (FULL / THREE_WEEKLY), `installment_count`, `stripe_customer_id`,
  `stripe_subscription_id`, `stripe_invoice_id`, `grace_period_start`, `grace_period_until`.
- New tables: a `PaymentPlan`/`Subscription` record and an `Installment` (+ likely `Refund`) child table.
- Backfill migration for existing `orders` rows (legacy `paid` → new axes).

## Key open questions to resolve before scheduling

1. Confirm the Stripe Subscription-Schedule + exact-cents approach against current
   Stripe Billing docs (the "exactly $499" acceptance criterion depends on it).
2. Define the refund/cancellation matrix (§26/§27) — currently under-specified.

---

## Related change made now (not deferred)

To keep customer-facing pricing honest while installments are deferred, the client
now displays installment/EMI affordability messaging **for INR only**. The EMI
preview (e.g. "EMI from $83.17/mo · 6 months") no longer renders for any non-INR
currency, and the checkout installment option is hidden for non-INR (it falls back
to Pay in Full). Implemented via a single chokepoint in
`client/src/lib/emi-resolver.ts` (`emiPreviewFromPlans`), which feeds
`EmiAffordabilityModule` (offer cards, offer page, offer detail) and
`CheckoutPaymentModeSelector`.
