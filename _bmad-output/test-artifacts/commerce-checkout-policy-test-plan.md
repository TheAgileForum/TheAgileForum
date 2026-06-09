# Commerce and Checkout Policy QA Plan



**Status:** Active — routes live in `server/src/routes/commerce.routes.ts`  

**Last reviewed:** 2026-06-08 (planning doc reconciliation)



## FR mapping



| FR | Requirement | Automated coverage |

|----|-------------|-------------------|

| FR-157 | Schedule required for schedule-bound cart | `checkout-policy.test.ts`, `commerce.integration.test.ts` |

| FR-85–87 | Free vs paid exam policy | `checkout-policy.test.ts`, `commerce.integration.test.ts`, `catalog.routes.test.ts` (labels) |

| FR-151 | Checkout requires auth | `commerce.integration.test.ts` |

| FR-152 | Org payment for eligible SAFe carts | `checkout-policy.test.ts`, `commerce.integration.test.ts` |

| FR-153 | Org reimbursement fields | `checkout-policy.test.ts`, `commerce.integration.test.ts` |

| FR-165–166 | Guest cart + merge at login/register | `commerce.integration.test.ts` (4 tests) |

| FR-154 | Order confirmation + enrollment notifications | `commerce.integration.test.ts`, `enrollment-notifier.test.ts` |

| FR-169–175 | EMI/installment | `payment-mode.test.ts`, `emi-installment-test-plan.md` |

| FR-161–168 | Catalog browse | `catalog-browse-test-plan.md` |

| FR-176 | Journey origin on cart/checkout events | `shell-trust-commerce-test-plan.md` (pending) |

| FR-177 | Global cart badge | `shell-trust-commerce-test-plan.md` (partial) |

| FR-178 | Session currency at checkout | `shell-trust-commerce-test-plan.md` (pending) |

| FR-179 | No public discount UI; checkout coupon only | `shell-trust-commerce-test-plan.md` (pending) |



## Integration tests (implemented)



| Scenario | File |

|----------|------|

| Checkout start requires auth (FR-151) | `commerce.integration.test.ts` |

| Schedule-bound add-to-cart blocked without scheduleRef (FR-157) | `commerce.integration.test.ts` |

| Paid exam access 402 / free exam 200 (FR-85–87) | `commerce.integration.test.ts` |

| Standard checkout + enrollment events (FR-154) | `commerce.integration.test.ts` |

| Stripe webhook `checkout.session.completed` | `commerce.integration.test.ts` |

| Org reimbursement checkout (FR-152/153) | `commerce.integration.test.ts` |

| Guest add-to-cart (FR-165) | `commerce.integration.test.ts` |

| Guest cart merge on login + register (FR-165/166) | `commerce.integration.test.ts` |

| Explicit `/cart/merge` endpoint | `commerce.integration.test.ts` |

| Cart add idempotency (duplicate line merges qty) | `commerce.integration.test.ts` |



## Remaining gaps



- [ ] Geo/pricing consistency hooks across catalog → checkout (FR-13, FR-178)

- [ ] Stripe test-mode end-to-end in CI (webhook + PaymentIntent)

- [ ] Razorpay EMI sandbox integration (FR-170) — see `emi-installment-test-plan.md`

- [ ] Regional BNPL routing integration (FR-171)

- [ ] Installment analytics events (FR-175)

- [ ] `commerce_journey_origin` on checkout events (FR-176)

- [ ] Checkout coupon apply API + no catalog discount leak (FR-179)

- [ ] Manual org-checkout E2E on staging

- [ ] `org_checkout_submitted` analytics event (PostHog)



## Commands



```powershell

cd C:\AgileForum\mybmadproj\server

npm run test -- src/commerce

npm run test:integration -- src/commerce/commerce.integration.test.ts

```


