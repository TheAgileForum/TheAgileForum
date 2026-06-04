# Commerce and Checkout Policy QA Plan

**Status:** Active — routes live in `server/src/routes/commerce.routes.ts`

## FR mapping

| FR | Requirement | Automated coverage |
|----|-------------|-------------------|
| FR-157 | Schedule required for schedule-bound cart | `checkout-policy.test.ts`, `commerce.integration.test.ts` |
| FR-85–87 | Free vs paid exam policy | `checkout-policy.test.ts`, `commerce.integration.test.ts` (`POST /commerce/exam/access`) |
| FR-151 | Checkout requires auth | `commerce.integration.test.ts` |
| FR-152 | Org payment for eligible SAFe carts | `checkout-policy.test.ts`, `commerce.integration.test.ts` |
| FR-153 | Org reimbursement fields | `checkout-policy.test.ts`, `commerce.integration.test.ts` |

## Remaining gaps

- [ ] Catalog/listing exposes `FREE_SKILL_ASSESSMENT` vs `PAID_CERTIFICATION_MOCK` labels (API or FE contract test)
- [ ] Geo/pricing consistency hooks (if in Sprint 1 scope)
- [ ] Duplicate add-to-cart idempotency integration case
- [ ] Stripe test-mode end-to-end in CI

## Commands

```powershell
cd C:\AgileForum\mybmadproj\server
npm run test -- src/commerce
npm run test:integration -- src/commerce/commerce.integration.test.ts
```
