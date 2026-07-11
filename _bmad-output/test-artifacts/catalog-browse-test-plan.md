# Catalog Browse QA Plan (FR-161–168)

**Status:** Active — API at `GET /api/v1/catalog/*`  
**Target:** Epic 13, EPIC-UX-08  
**Last reviewed:** 2026-06-08 (planning doc reconciliation)

## FR mapping

| FR | Requirement | Automated coverage |
|----|-------------|-------------------|
| FR-161 | Three nav destinations; diagnosis primary on homepage | FE e2e (pending); manual IA checklist |
| FR-162 | Full category listings | `catalog.routes.test.ts` (trainings/certifications/services) |
| FR-163 | Required filters (server-side) | `catalog/filter.test.ts`, `catalog.routes.test.ts` |
| FR-164 | Shareable URL filter state | FE e2e (pending); API query contract tests (partial) |
| FR-165 | Browse + cart without login | `commerce.integration.test.ts` |
| FR-166 | Multi-SKU cart | `commerce.integration.test.ts` (guest multi-SKU merge) |
| FR-167 | Campaign deep links | FE e2e (pending); `commerce_journey_origin` (FR-176, pending) |
| FR-168 | Pricing/metadata parity | `catalog/filter.test.ts`; pricing resolver parity (pending) |
| FR-87 | Exam access labels on listings | `catalog.routes.test.ts` |
| FR-178 | Single currency per session on listings | `shell-trust-commerce-test-plan.md` (pending) |
| FR-179 | No discount badges on catalog cards | API schema test + FE visual (pending) |
| FR-181 | Role-based upsell on detail from catalog path | `shell-trust-commerce-test-plan.md` (pending) |
| FR-177 | Global cart badge on catalog pages | `shell-trust-commerce-test-plan.md` (pending) |

## Unit / contract tests (implemented)

| File | Scope |
|------|-------|
| `server/src/catalog/filter.test.ts` | Filter logic FR-163 (5 tests) |
| `server/src/routes/catalog.routes.test.ts` | List endpoints, filters, exam labels (8 tests) |

## Integration tests (implemented)

- [x] `GET /api/v1/catalog/trainings` returns only training category
- [x] `GET /api/v1/catalog/certifications` returns only certification category
- [x] `GET /api/v1/catalog/services` returns only service category
- [x] Guest cart add without auth (`POST /cart/guest/items`)
- [x] Guest cart merge at login preserves lines (FR-165/166)
- [x] Filter query combinations (role + delivery mode + batch, price range)
- [x] Exam access labels on certification listings (FR-85/86/87)

## Integration / E2E tests (pending)

- [ ] Catalog API responses exclude discount marketing fields (FR-179, gate 14)
- [ ] Listing prices match `POST /pricing/quote` for session currency (FR-168, FR-178)
- [ ] `installment_plans` omitted on SG/UAE/default geo listings (FR-169, gate 13)
- [ ] Homepage regression: diagnosis CTA primary, catalog nav secondary (FR-161)
- [ ] Filter URL copy → new session restores filters (FR-164)
- [ ] Campaign `?campaign_id=` deep link lands on correct offering (FR-167)
- [ ] Wix import parity: offering count and category tags match ops export (FR-182)
- [ ] Sort control: relevance, price, upcoming batch (API `sort` param if exposed)
- [ ] Empty filter state shows reset CTA (FE)

## Manual / E2E scenarios

1. WhatsApp deep link → certification detail → add to cart → login → checkout.
2. Apply filters → copy URL → open in new session → filters restored.
3. Add training + service + certification to one cart → checkout.
4. Schedule-bound item blocked without batch selection (FR-157 cross-check).
5. SG/UAE session: listing cards show price only — no EMI chip (FR-169).
6. Currency override in header: all listing prices refresh to selected currency (FR-178). Test **CAD**, **NGN**, **IDR** (no decimals), **EUR**, **AED** in addition to USD/INR.
7. Catalog cards: assert no discount/promo badges (FR-179).
8. Global cart badge updates after add-from-card without leaving listing page (FR-177).

## Commands

```powershell
cd C:\AgileForum\mybmadproj\server
npm run test -- src/catalog src/routes/catalog.routes.test.ts
npm run test:integration -- src/commerce/commerce.integration.test.ts
```
