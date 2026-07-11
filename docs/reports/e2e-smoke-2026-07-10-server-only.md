# E2E Smoke — Server-Only DB (No Docker) — 2026-07-10

**Environment:** Windows, PostgreSQL 17 native (winget), local `mybmadproj` database  
**API:** `http://localhost:3001` · **Client:** `http://localhost:5173`

## Infrastructure setup

| Step | Result | Notes |
|------|--------|-------|
| PostgreSQL 17 install (winget silent) | **PASS** | Service `postgresql-x64-17` running |
| Create DB `mybmadproj` | **PASS** | |
| Update `server/.env` → localhost | **PASS** | Replaced unreachable Supabase host |
| `npm run db:deploy` | **PASS** | 6 migrations applied |
| `npm run db:seed` | **PASS** | Demo users + 6 catalog offerings |
| API restart | **PASS** | Required after `.env` change |

**Previous blocker resolved:** Supabase host `db.hastmarkjvbyoprgppji.supabase.co` failed DNS; no Docker used.

## API smoke

| Endpoint | Result |
|----------|--------|
| `GET /api/v1/health` | **PASS** (`status: ok`) |
| `POST /api/v1/diagnosis/session` | **PASS** (returns `diagnosisSessionId`) |
| `POST /api/v1/auth/login` | **PASS** (`customer@demo.local`) |

## Browser smoke

| Step | Result | Notes |
|------|--------|-------|
| Home `/` | **PASS** | Nav, cart badge, diagnosis CTA |
| Diagnosis step 1 → step 2 | **PASS** | Consent + continue after local DB |
| Diagnosis step 2–4 (full analysis) | **NOT RUN** | Resume upload + stub worker deferred |
| Catalog `/trainings` | **PASS** (prior run) | 2 offerings with filters |
| Offer `/offers/agile-readiness` | **PASS** | Schedule, pricing, trust block |
| Add to cart | **PASS** | Badge updated to **1 item** |
| Login | **PASS** | Redirect home, **Log out** visible |
| Checkout `/checkout` | **PASS** | Order summary $299, payment mode |
| Confirm payment (stub) | **PASS** | Success page **ORD-MRF3516D** |

## Remaining gaps (non-blocking for local dev)

- Full diagnosis funnel (step 2 upload → analysis → results) — manual follow-up
- OAuth Google stub — not exercised this run
- Redis not running — workers/scheduler optional for this smoke
- Supabase remote project — still dead DNS; use localhost for dev until restored

## Keep running locally

```powershell
# Ensure PostgreSQL service is running (Windows Services: postgresql-x64-17)
cd C:\AgileForum\mybmadproj\server
npm run dev

cd C:\AgileForum\mybmadproj\client
npm run dev
```

**Do not commit `server/.env`.** Local DB credentials are dev-only.
