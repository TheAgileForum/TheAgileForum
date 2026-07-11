# E2E Smoke — Supabase DB — 2026-07-10

**Environment:** Windows, Supabase remote Postgres (`db.hastmarkjvbyoprgppji.supabase.co`)  
**API:** `http://localhost:3001` · **Client:** `http://localhost:5173` (prior run)

## Connectivity

| Check | Result | Notes |
|-------|--------|-------|
| DNS `db.hastmarkjvbyoprgppji.supabase.co` | **PASS** | Resolves to IPv6 `2406:da1c:4c7:f800::fe31` |
| TCP `:5432` | **PASS** | `Test-NetConnection` succeeded |
| `server/.env` | **UPDATED** | Switched from `localhost:5432/mybmadproj` → Supabase direct URL (from `.env.test` pattern) |

**Previous blocker resolved:** Supabase host failed DNS earlier today; restored per user confirmation.

## Database setup

| Step | Result | Notes |
|------|--------|-------|
| `npm run db:deploy` | **PASS** | 6 migrations present, none pending |
| `npm run db:seed` | **PASS** | Demo users + catalog offerings |
| API restart | **PASS** | Required after `.env` change |

## API smoke

| Endpoint | Result | Notes |
|----------|--------|-------|
| `GET /api/v1/health` | **PASS** | `status: ok` |
| `POST /api/v1/diagnosis/session` | **PASS** | `diagnosisSessionId=5960f247-66c5-4fda-94bf-790cdac19059` |
| `POST /api/v1/auth/login` | **PASS** | `customer@demo.local` / `password123` → role `CUSTOMER` |

## Local Postgres (optional)

If using Supabase only, the Windows service `postgresql-x64-17` is **optional** — you can stop it in Services to free resources. Local Postgres is no longer required for dev when `.env` points to Supabase.

## Notes

- **Do not commit `server/.env`.** Credentials are dev-only.
- For production/staging, prefer Supabase **Session pooler** URL for `DATABASE_URL` and **Direct** URL for `DIRECT_URL` (Prisma migrations). Current config uses direct connection on port 5432 for both — works for dev; consider pooler (`*.pooler.supabase.com:6543`) under higher load.
- Prior local-only smoke (order `ORD-MRF3516D`) documented in `e2e-smoke-2026-07-10-server-only.md`.
