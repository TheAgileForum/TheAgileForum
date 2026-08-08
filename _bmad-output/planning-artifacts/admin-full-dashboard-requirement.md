# Full Admin Operations Dashboard — Requirement (Later Sprint)

**Status:** Captured for **later sprint** (Sprint 3+ / post–commerce hardening)  
**Owner:** Ops + Product  
**Related:** PRD FR-65..78, FR-147..150, FR-180; Epic 10; FRD MOD-11 (users/orders/revenue/funnel); architecture `GET /admin/funnel/overview`  
**New FRs:** FR-183 .. FR-188 (see `prd-agile-forum.md`)  
**Story:** Epic 10 · Story **10.5** Unified Commercial Ops Dashboard  

---

## Problem

Ops currently relies on enrollment email/Telegram alerts (FR-147–150) and a thin `/ops` shell. There is no single **admin-login** view to browse customers, orders, diagnosis/resume artifacts, and sales mix (trainings, certifications, services) with quick drill-down analytics.

## Goal

Deliver a **complete admin operations dashboard** so authenticated ops/super-admin users can see, search, and drill into commercial and diagnosis data quickly — without exporting raw DB rows.

## Personas & access

| Role | Access |
|------|--------|
| `super_admin` | Full dashboard + exports + PII |
| `support_ops` / `marketing_ops` | Read customer/order/resume views; limited PII as policy allows |
| Learner / visitor | **Denied** (403) — FR-180 |

All routes under `/admin/*` (API) and `/ops/*` (SPA) require admin RBAC. Audit log admin data access (FR-77).

## Scope (MVP of this later-sprint slice)

### 1) Customers directory
- List registered users with email, display name, auth provider, created/last active, geo/currency if known
- Search/filter by email, name, role tags, registration date
- Customer detail: profile summary, orders, diagnosis sessions, resume assets, bookmarks

### 2) Orders & commerce
- List all orders (status, amount, currency, payment provider, created_at)
- Filters: status, date range, offering category (training / certification / service), currency, geo
- Order detail: line items, schedule batch, discounts/coupons, payment refs, enrollment confirmation status
- Aggregate tiles: GMV (session or filter currency), paid count, abandoned/cart-open count, refunds if modeled

### 3) Resume & diagnosis intelligence
- List resume uploads/assets: user, upload time, storage link (secure signed URL), extraction status, char count / warnings
- Parsed text preview (ops-only; respect retention — NFR-S3)
- Diagnosis session list: target role, gap tags, confidence, stub-fallback flag, created_at
- Resume/diagnosis **scores** where the product already computes them (fit %, skill ratings, match summary) — show on detail; do not invent new scoring models in this story unless already shipped on learner path
- Link to open learner diagnosis result / offer recommendations for support context

### 4) Sales mix & catalog analytics
- Units and revenue by offering code/title and by category (training, certification, service)
- Top sellers; zero-sales published SKUs
- Certification body / service type breakdowns
- Optional: coupon/discount usage rates

### 5) Funnel & ops analytics (extends FR-65)
- Diagnosis start → complete → checkout start → paid conversion
- Resume upload / scan unlock rates
- Offer impression → enroll click → paid (from existing events where available)
- Deep-link to PostHog/Clarity for behavioral detail (dashboard is operational SSOT for CRM-like tables; product analytics remains event tools)

### 6) Quick actions (read-heavy MVP; writes optional)
- Copy customer email / order id
- Resend enrollment confirmation (if already supported)
- Open catalog admin for an SKU (existing FR-182)
- Escalate to coach (stub: mailto / ticket note) — full CRM writeback out of scope

## Explicit out of scope (this story)

- Full marketing automation builder (Epic 9 remainder)
- AI prompt/KB governance UI (Stories 10.2–10.4) — may share shell nav only
- Editing learner resumes or re-running diagnosis as admin (support may trigger re-analyze later)
- WhatsApp/Wix CRM sync
- Real-time BI warehouse (BigQuery etc.) — use API aggregations + cached rollups first

## UX outline

1. **Ops home** — KPI cards (customers, paid orders today/7d/30d, GMV, open diagnosis sessions, resume uploads)
2. **Customers** — table + detail drawer/page
3. **Orders** — table + detail
4. **Resumes & diagnosis** — table with score columns + secure link
5. **Sales analytics** — category/SKU charts + table
6. **Funnel** — simple stage counts (reuse `/admin/funnel/overview` if present)

Mobile: tables collapse to card lists; PII fields redact on small screens unless expanded.

## API sketch (non-binding)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/admin/customers` | Paginated customer list |
| GET | `/api/v1/admin/customers/:id` | Customer 360 |
| GET | `/api/v1/admin/orders` | Paginated orders |
| GET | `/api/v1/admin/orders/:id` | Order detail |
| GET | `/api/v1/admin/resumes` | Resume assets + parse metadata |
| GET | `/api/v1/admin/diagnosis/sessions` | Diagnosis sessions + scores |
| GET | `/api/v1/admin/analytics/sales` | Sales by SKU/category |
| GET | `/api/v1/admin/analytics/funnel` | Funnel stage counts |
| GET | `/api/v1/admin/funnel/overview` | Existing architecture endpoint — align/extend |

All require admin auth; support cursor/offset pagination; never return raw resume bytes without signed short-TTL URL.

## Acceptance criteria

1. Ops admin can log in and open `/ops` dashboard home with KPI tiles populated from live staging/prod data (or seeded demo).
2. Admin can list/search customers and open a detail that shows orders + diagnosis/resume summaries.
3. Admin can list/filter orders and open line-item detail including cert vs service offerings.
4. Admin can see resume assets with parse status, secure link, and any available scores from diagnosis.
5. Admin can see sales breakdown for trainings, certifications, and services sold.
6. Learner JWT cannot access any new `/api/v1/admin/*` endpoints (403).
7. Admin data access is auditable (who viewed which customer/order at when) at least for PII-bearing detail endpoints.
8. Empty and error states are usable; list endpoints remain responsive under typical demo catalog volume.

## Sprint placement

| Window | Work |
|--------|------|
| Now–Sprint 2 | Keep thin `/ops` + enrollment alerts; do **not** block commerce/diagnosis |
| **Sprint 3+ (later)** | Story **10.5** + FR-183..188 — full commercial ops dashboard (`T10.9`, `T10.10`) |
| After 10.5 | Optional: exports (CSV), coach assignment queue, write actions |

## Dependencies

- Stable orders + enrollments model
- Resume asset + text extract persistence
- Diagnosis session storage with scores/gaps
- Admin RBAC (FR-78 / FR-180)
- Catalog SSOT (FR-182) for SKU titles/categories

## Traceability

| Artifact | Update |
|----------|--------|
| `prd-agile-forum.md` | FR-183..188 |
| `epics-agile-forum.md` | Story 10.5 |
| `mvp-sprint-build-order-agile-forum.md` | Sprint 3 scope includes 10.5 |
| `pending-work-queue.md` | P3 later-sprint item |
| This file | Authoritative elaboration |
