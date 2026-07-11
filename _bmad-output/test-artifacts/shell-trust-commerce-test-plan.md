# Shell, Trust & Commerce Extensions QA Plan (FR-176–182)

**Status:** Active — partial BE; FE shell UX in progress (UX-08.5, UX-10, UX-11)  
**Sources:** `must-have-priorities-agile-forum.md` (A9–A14), `api-contract-matrix.md` gates 11–15  
**Target:** Epic 4.8–4.9, Epic 10, Epic 13.6–13.7, Epic 2.5 / 6.7

## FR mapping

| FR | Requirement | Automated coverage |
|----|-------------|-------------------|
| FR-176 | `commerce_journey_origin` on cart/checkout events | Events contract test (pending) |
| FR-177 | Global cart icon + badge on customer shell | Guest cart GET (partial); FE e2e (pending) |
| FR-178 | Single currency per session; resolver SSOT | `pricing/currency-context` API test (pending) |
| FR-179 | No public discount fields on catalog APIs | Catalog response schema test (pending) |
| FR-179 | Checkout coupon via minimal endpoint only | Checkout coupon API test (pending) |
| FR-180 | Admin-only ops surfaces | `auth.integration.test.ts` (admin-check); `/admin/*` (pending) |
| FR-181 | Role-based SAFe + mock interview upsell | `GET /recommendations/upsell` test (pending) |
| FR-182 | Catalog admin publish lifecycle | Admin catalog API tests (pending) |

## API contract gates (from matrix §3)

| Gate | Requirement | Test status |
|------|-------------|-------------|
| 11 | Global cart badge count matches server `line_count` | Partial — guest cart integration exists |
| 12 | Single-currency gate on price-bearing responses | Pending |
| 13 | EMI plans omitted (not empty array) when geo has no plans | `payment-mode.test.ts` (unit); offer API (pending) |
| 14 | No `percent_off`, `promo_badge`, `strikethrough_price` on catalog APIs | Pending |
| 15 | `/v1/admin/*` requires admin role | Partial — admin-check only |

## Unit / contract tests (implemented)

| File | Scope |
|------|-------|
| `server/src/commerce/payment-mode.test.ts` | Geo-asymmetric EMI availability (gate 13 unit) |
| `server/src/auth.integration.test.ts` | Admin-check RBAC (gate 15 partial) |
| `server/src/commerce/commerce.integration.test.ts` | Guest cart line_count for badge (gate 11 partial) |

## Integration tests (pending)

### FR-176 Journey origin
- [ ] `cart_updated` event includes `commerce_journey_origin` when set from catalog path
- [ ] `checkout_started` / `checkout_confirmed` include origin enum values per PRD
- [ ] Campaign deep link sets `campaign_deep_link` origin on first cart add

### FR-177 Global cart shell
- [ ] Guest `GET /v1/cart/guest` `line_count` matches `lines.length` after multi-SKU add
- [ ] Authenticated `GET /v1/cart` badge count after guest merge
- [ ] FE: badge visible on home, diagnosis, catalog, dashboard, offer detail (e2e)
- [ ] FE: badge omitted on login/register/password-reset only

### FR-178 Multi-currency

Supported session currencies (2026-07-11): **USD**, **INR**, **CAD**, **NGN**, **AUD**, **IDR**, **SGD**, **BRL**, **EUR** (Europe), **AED**, **GBP**. Header selector labels use `CODE — Region` (e.g. `CAD — Canada`, `EUR — Europe`). IDR amounts omit decimals.

- [ ] `GET /v1/pricing/currency-context` geo-detect default (IN → INR, US → USD, CA → CAD, NG → NGN, ID → IDR, NL → EUR, BR → BRL)
- [ ] User override via `currency_override` persists for session
- [ ] `POST /v1/pricing/quote` returns single currency across all `offer_ids`
- [ ] Catalog listing prices match quote for same `currency_context`
- [ ] Checkout totals use same currency as catalog (FR-13 parity)

### FR-179 No public discounts
- [ ] Catalog list/detail responses exclude marketing discount fields (gate 14)
- [ ] `POST /v1/checkout/sessions/{id}/coupon` applies discount without exposing on catalog
- [ ] FE visual: no promo chips on catalog cards (manual / snapshot)
- [ ] Re-engagement nudges exclude public discount language (campaign copy review)

### FR-181 Role-based upsell
- [ ] `GET /v1/recommendations/upsell?target_role=scrum_master&context=diagnosis` returns SAFe + mock SKUs
- [ ] Contexts: `dashboard`, `cart`, `detail`, `post_webinar` return role-relevant sets
- [ ] Upsell response excludes discount/promo fields (FR-179)
- [ ] Upsell CTA add-to-cart uses session currency (FR-178)
- [ ] Events: `upsell_impression`, `upsell_click`

### FR-182 Catalog admin ops
- [ ] `POST /admin/catalog/offerings` validates required metadata before publish
- [ ] Disable offering removes from public catalog list (not hard delete)
- [ ] Schedule batch attach updates FR-157 checkout gate
- [ ] Wix import script parity check (content ops + smoke test)
- [ ] Audit log on manual tag override (FR-138 cross-check if in scope)

## Manual / E2E scenarios

1. Add item from certifications listing → badge increments on diagnosis page without reload (FR-177).
2. Switch currency in header → all visible prices update; checkout matches (FR-178).
3. Browse catalog — confirm no discount badges anywhere (FR-179).
4. Scrum Master diagnosis result → upsell shows relevant SAFe cert + mock interview (FR-181).
5. Ops admin publishes new offering → appears in correct category listing (FR-182).
6. PostHog funnel: filter checkout by `commerce_journey_origin=catalog_certifications` (FR-176).

## Commands

```powershell
cd C:\AgileForum\mybmadproj\server
npm run test -- src/commerce/payment-mode.test.ts src/auth.integration.test.ts
npm run test:integration -- src/commerce/commerce.integration.test.ts src/auth.integration.test.ts
```
