# EMI / Installment QA Plan (FR-169–175)

**Status:** Active — resolver at `server/src/commerce/payment-mode.ts`  
**Matrix:** `_bmad-output/planning-artifacts/payment-provider-matrix.md`  
**Target:** Epic 4.5–4.7, Epic 6.6, EPIC-UX-09  
**Last reviewed:** 2026-06-08 (planning doc reconciliation)

## FR mapping

| FR | Requirement | Automated coverage |
|----|-------------|-------------------|
| FR-169 | Course-page EMI preview (geo-asymmetric; no chip SG/UAE/default) | `payment-mode.test.ts`; offer API + FE (pending) |
| FR-178 | EMI amounts in session currency | `shell-trust-commerce-test-plan.md` (pending) |
| FR-170 | India Razorpay EMI + UPI | `payment-mode.test.ts`; live Orders API + confirm + webhook (`razorpay-api.test.ts`, `commerce.integration.test.ts` mocked); **manual `rzp_test_*` modal E2E pending** |
| FR-171 | Geo-specific BNPL matrix | `payment-mode.test.ts` (all country groups); provider integration (pending) |
| FR-172 | Full pay + installment at checkout | checkout integration (pending) |
| FR-173 | Gateway-owned disclaimers | FE snapshot + manual compliance review |
| FR-174 | Course page ↔ checkout parity | `payment-mode.test.ts` parity helper; integration (pending) |
| FR-175 | Installment analytics events | events contract test (pending) |
| FR-13 | Pricing parity across surfaces | quote + offer + checkout amount match (pending) |

## Approved provider matrix (2026-06-07)

| Country Group | Full pay | Installment / BNPL | Local |
| ------------- | -------- | ------------------ | ----- |
| India | Razorpay | Razorpay EMI | UPI |
| USA | Stripe | Affirm, Klarna | — |
| Canada | Stripe | Affirm, Klarna | — |
| UK | Stripe | Klarna, Clearpay | — |
| Australia | Stripe | Afterpay, Zip | — |
| New Zealand | Stripe | Afterpay | — |
| Europe (15+) | Stripe | Klarna | — |
| Singapore | Stripe | — | Cards, PayNow |
| UAE | Stripe | — | Cards |

## Unit tests (implemented)

| File | Scope |
|------|-------|
| `server/src/commerce/payment-mode.test.ts` | All country groups + parity helper (11 tests) |

## API contract gates (pending)

- [ ] Gate 8: EMI parity — offer detail plans equal checkout resolver for same `offer_id` + `geo` + `currency`
- [ ] Gate 9: `payment_mode=installment` rejected when provider unavailable for geo
- [ ] Gate 13: `installment_plans` field **omitted** (not `[]`) when no plans for geo

## Integration tests (pending)

- [ ] `POST /v1/payments/installment-plans` returns plans for IN with Razorpay provider
- [x] India: Razorpay EMI checkout — live path mocked in `commerce.integration.test.ts` (Orders API stub + signature confirm)
- [ ] India: Razorpay EMI + UPI checkout paths — **manual sandbox modal** with real test keys (FR-170)
- [ ] US/CA: Affirm and Klarna widget routing (FR-171)
- [ ] UK: Klarna and Clearpay
- [ ] AU: Afterpay and Zip
- [ ] NZ: Afterpay
- [ ] DE/FR (EU): Klarna
- [ ] SG: PayNow + cards — **no EMI chip, no empty shell** (FR-169)
- [ ] AE: cards only — **no EMI chip, no empty shell**
- [ ] Default geo: full-pay-only — **no EMI UI rendered**
- [ ] FR-178: installment preview amounts match session `currency_context` (all launch currencies: USD, INR, CAD, NGN, AUD, IDR, SGD, BRL, EUR, AED, GBP)
- [ ] FR-172: checkout presents both full pay and installment when plans exist
- [ ] Multi-provider geo: user `installment_provider` selection persists to confirmation
- [ ] FR-173: provider disclaimer ref returned and rendered on FE
- [ ] Events: `installment_option_impression`, `installment_checkout_started`, `installment_checkout_completed` (FR-175)
- [ ] Funnel reporting: installment conversion vs full-pay (FR-47 cross-check)

## Manual / E2E scenarios

1. India paid offering: course page shows EMI preview → checkout amounts match (FR-174).
2. Singapore offering: price only, no EMI module or empty placeholder (FR-169).
3. US cart: user selects Affirm at checkout → confirmation shows installment provider.
4. Gateway T&C and approval disclaimers visible before payment (FR-173).
5. PostHog: installment funnel events fire in correct order (FR-175).

## Commands

```powershell
cd C:\AgileForum\mybmadproj\server
npm run test -- src/commerce/payment-mode.test.ts
```
