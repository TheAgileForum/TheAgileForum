---
title: "Payment Provider Matrix by Country Group"
status: approved
updated: "2026-06-08"
owner: Dhirender
---

# Payment Provider Matrix

Canonical routing for full pay, installments/BNPL, and local payment methods. Gateway-owned T&C and approval disclaimers apply (FR-173).

| Country Group | ISO examples | Full pay | Installment / BNPL | Local methods | Customer UX (EMI) |
| ------------- | ------------ | -------- | ------------------ | ------------- | ----------------- |
| **India** | `IN` | Razorpay | Razorpay EMI | UPI | Show EMI chip/module when resolver returns plans |
| **USA** | `US` | Stripe | Affirm, Klarna | — | Show EMI chip/module when resolver returns plans |
| **Canada** | `CA` | Stripe | Affirm, Klarna | — | Show EMI chip/module when resolver returns plans |
| **UK** | `GB`, `UK` | Stripe | Klarna, Clearpay | — | Show EMI chip/module when resolver returns plans |
| **Australia** | `AU` | Stripe | Afterpay, Zip | — | Show EMI chip/module when resolver returns plans |
| **New Zealand** | `NZ` | Stripe | Afterpay | — | Show EMI chip/module when resolver returns plans |
| **Europe** | `DE`, `FR`, `ES`, `IT`, `NL`, `BE`, `AT`, `IE`, `PT`, `SE`, `DK`, `FI`, `NO`, `PL`, `CH`, `CZ`, `GR`, `HU`, `RO` | Stripe | Klarna | — | Show EMI chip/module when resolver returns plans |
| **Singapore** | `SG` | Stripe | — (cards-only lane) | Cards, PayNow | **Full-pay-only** — no EMI chip, no empty shell |
| **UAE** | `AE`, `UAE` | Stripe | — (cards-only lane) | Cards | **Full-pay-only** — no EMI chip, no empty shell |
| **Nigeria** | `NG` | Stripe | — | Cards | **Full-pay-only** (default group; BNPL TBD) |
| **Indonesia** | `ID` | Stripe | — | Cards | **Full-pay-only** (default group; BNPL TBD) |
| **Brazil** | `BR` | Stripe | — | Cards | **Full-pay-only** (default group; BNPL TBD) |
| **Default / other** | — | Stripe | — | — | **Full-pay-only** — no EMI chip, no empty shell |

## Implementation notes

- **Geo-asymmetric EMI (approved 2026-06-08):** Show EMI/installment/BNPL UI **only** where payment resolver returns plans (rows with installment providers above). SG, UAE, and default: **full-pay-only** — do not render EMI chip, module, or empty placeholder (FR-169).
- Checkout shows **full pay + installment** only when resolver returns installment plans for geo/SKU.
- India uses **Razorpay** as primary rail (EMI + UPI); international uses **Stripe** for full pay with regional BNPL widgets.
- Course-page EMI preview must list representative plans from the same resolver as checkout (FR-174).
- User selects one installment provider when multiple are available (e.g. US: Affirm or Klarna).
- All amounts use **session currency context** from centralized pricing resolver (FR-178).
- Session currency codes: USD, INR, CAD, NGN, AUD, IDR, SGD, BRL, EUR (Europe), AED, GBP. Geo defaults: CA→CAD, NG→NGN, ID→IDR, NL→EUR, BR→BRL (see `server/src/pricing/supported-currencies.ts`).

## Resolver source

Runtime routing: `server/src/commerce/payment-mode.ts`  
Tests: `server/src/commerce/payment-mode.test.ts`
