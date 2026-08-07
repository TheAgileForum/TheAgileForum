# Story UX-04.3: My Enrollments & Order History

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created. -->
<!-- Implemented 2026-08-07: order list/detail APIs, AccountOrdersPage, nav + checkout success CTA. -->

## Story

As a signed-in learner,
I want to view my profile’s enrollments and paid/completed orders (courses and services),
so that I can confirm what I bought, see order status, and return to my offerings without relying only on email confirmation.

## Acceptance Criteria

1. **Auth gate:** Unauthenticated users hitting `/account` (or `/my-orders`) are redirected to `/login` with `returnTo` preserved; after login they land back on the account page.
2. **Orders list API:** Authenticated `GET /api/v1/commerce/orders` returns the current user’s orders newest-first, including at least: `id`, `orderNumber`, `status`, `currency`, `totalAmount`, `createdAt`, and line items (`offeringCode`, `quantity`, `unitPrice`, `currency`). Optional enrichment: offering `title` and `category` from catalog.
3. **Order detail API:** Authenticated `GET /api/v1/commerce/orders/:id` returns one order owned by the user, or `404` / `ORDER_NOT_FOUND` if missing or not owned (no cross-user leakage).
4. **Account UI:** Signed-in learners can open an **Account / My enrollments** page from the forum header that lists:
   - Paid / completed orders (`status === "paid"`) as primary “enrolled / purchased” cards
   - Other statuses (`created`, `pending_payment`, etc.) clearly labeled (e.g. “Awaiting payment”)
   - Empty state when the user has no orders, with CTAs to `/trainings`, `/certifications`, `/services`
5. **Line-item clarity:** Each order shows offering titles (not only codes) for courses and services the user paid for.
6. **Checkout success link:** `/checkout/success` includes a secondary CTA: “View my enrollments” → account page (in addition to Back to home).
7. **Privacy:** Responses never include another user’s orders; use `requireAuth` + `userId` filter only.
8. **Analytics (lightweight):** Emit `account_orders_viewed` (list) and optionally `account_order_detail_viewed` with `order_id` / `status` (no PII beyond existing event patterns).

## Tasks / Subtasks

- [x] **BE — list & detail endpoints** (AC: #2, #3, #7)
  - [x] Add `GET /api/v1/commerce/orders` and `GET /api/v1/commerce/orders/:id` on `commerce.routes.ts`
  - [x] Service helpers in `order-query-service.ts`: `listOrdersForUser`, `getOrderForUser`
  - [x] Enrich line items with catalog title/category via `getOfferingFromCatalog` (graceful fallback to code if unknown)
  - [x] Unit + integration tests (auth 401, ownership 404, paid order appears in list)

- [x] **FE — Account page** (AC: #1, #4, #5)
  - [x] Route under forum layout: `account`
  - [x] Page: `client/src/pages/forum/AccountOrdersPage.tsx`
  - [x] `forum-api.ts`: `listMyOrders()`, `getMyOrder(id)`
  - [x] Header: when `user` present, link “My enrollments” (+ mobile drawer)

- [x] **FE — Checkout success CTA** (AC: #6)
  - [x] Update `ForumCheckoutSuccessPage.tsx` with link to account page

- [x] **Analytics** (AC: #8)
  - [x] Client `trackEvent` `account_orders_viewed`

- [x] **Docs / tracker**
  - [x] Mark this story done in `sprint-1-remaining-work-tracker.md`

## Dev Notes

### Why this story now

PRD Journey 8 requires order confirmation + enrollment status; Journey 9 and A2/FR-8 imply a returning learner surface. Continuity policy requires access to purchase records. Today checkout success is fire-and-forget (“Back to home”) with **no** learner-facing order list.

### Hard dependencies (must exist — already largely done)

| Dependency | Status | Notes |
|------------|--------|-------|
| Auth + session cookie | Done | `requireAuth`, `/auth/me` |
| `Order` + `OrderItem` models | Done | `schema.prisma`; indexed by `userId` |
| Checkout create + mark paid | Done | `checkout-service.ts` `completeCheckout` / Stripe webhook path |
| Forum layout + login returnTo | Done | Reuse LoginPage `returnTo` pattern |

### Soft dependencies / sequencing advice

**You can start this story immediately** as a thin slice on top of existing paid orders.

**Do first only if broken in your environment:**

1. **Reliable `status = paid` path** — If local/staging payments stay on `created` and never reach `paid`, the enrollments list will look empty. Verify Stripe webhook and/or Razorpay complete + stub `completeCheckout` before calling the UI “done.”
2. **Not blockers for v1:** Full skills dashboard (UX-04.1), micro-exams (UX-04.2), in-app mentor slots (UX-05.2), PDF invoices, LMS content unlock.

**Recommended order relative to nearby work:**

```
1. Commerce paid-order reliability (smoke: pay → order.paid)   [if flaky]
2. UX-04.3 My enrollments / order history                     ← THIS STORY
3. UX-04.1 Dashboard shell (skills + continuation rail)       [can reuse Account nav]
4. Deeper enrollment artifacts (community links, certificates)
```

### Out of scope (v1)

- Editing profile fields (FR-2 personalization) beyond purchase list
- Invoice PDF download
- Admin ops order queue (restaurant/ops demo routes)
- Migrating historical Wix purchases (continuity policy — separate story)
- Schedule ref on `OrderItem` (cart has `scheduleRef`; order items currently do not — do **not** invent columns unless product asks; show schedule later if schema extended)

### Architecture compliance

- API prefix: `/api/v1/commerce/...`
- Auth: `requireAuth` from existing middleware
- Errors: `{ error: { code, message } }` pattern used by commerce routes
- Client: `apiFetch` / `forum-api.ts`; forum routes under `ForumLayout` + `PricingProvider` only if pricing needed (list page may not need cart currency for historical totals — show order currency as stored)
- Do not put learner order history under `/demo` or restaurant routes

### Suggested API shapes

```ts
// GET /api/v1/commerce/orders
{
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string; // "created" | "paid" | ...
    currency: string;
    totalAmount: string;
    createdAt: string;
    items: Array<{
      offeringCode: string;
      title: string;
      category?: string;
      quantity: number;
      unitPrice: string;
      currency: string;
    }>;
  }>;
}
```

### File structure (expected touch points)

- `server/src/routes/commerce.routes.ts`
- `server/src/services/checkout-service.ts` or `server/src/services/order-query-service.ts`
- `server/src/commerce/commerce.integration.test.ts` (extend)
- `client/src/App.tsx` — add route
- `client/src/layouts/ForumLayout.tsx` — nav link when signed in
- `client/src/pages/forum/AccountOrdersPage.tsx` — new
- `client/src/lib/forum-api.ts` — API helpers
- `client/src/pages/forum/ForumCheckoutSuccessPage.tsx` — CTA
- `client/src/lib/analytics.ts` — event names if typed union

### Testing requirements

- Unit/contract: 401 without cookie; 200 list empty; 200 list with paid order for owner; 404 for other user’s id
- Integration: create checkout → complete → list contains order with items
- FE smoke: login → Account → see order; logout → Account redirects to login

### References

- [Source: `_bmad-output/planning-artifacts/prd-agile-forum.md` — Journey 8 Payment/Order, Journey 9 Onboarding, FR-8, FR-154]
- [Source: `_bmad-output/planning-artifacts/product-brief-agile-forum.md` — A2 learner account + continuity / receipts]
- [Source: `_bmad-output/implementation-artifacts/s1-3-ux-implementation-epics-stories-tasks.md` — EPIC-UX-04]
- [Source: `server/prisma/schema.prisma` — `Order`, `OrderItem`]
- [Source: `server/src/services/checkout-service.ts` — `completeCheckout`]
- [Source: `client/src/pages/forum/ForumCheckoutSuccessPage.tsx`]

## Dev Agent Record

### Agent Model Used

Composer (story authoring)

### Debug Log References

### Completion Notes List

- Story authored 2026-08-07 from founder request for profile enrollments / paid-order history.
- Sequencing: can start after paid-order path smoke; does not require full dashboard epic.

### File List

- `_bmad-output/implementation-artifacts/ux-04-3-my-enrollments-order-history.md` (this file)
