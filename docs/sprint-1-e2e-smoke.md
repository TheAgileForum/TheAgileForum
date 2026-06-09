# Sprint 1 E2E Smoke Script

Run with **server** (`npm run dev` in `server/`) and **client** (`npm run dev` in `client/`) on the same machine.

## Automated gate (run first)

```powershell
cd C:\AgileForum\mybmadproj\server
npm run readiness:gate
```

Expect **GO** in `docs/reports/sprint-1-readiness-gate-s0-10.md`.

## Manual funnel

1. Open http://localhost:5173/
2. **Start diagnosis** → complete Step 1 (role + consent) → Step 2 (upload resume metadata + run analysis) → Step 3 (wait) → Step 4 (results + primary CTA).
3. Open offer link (e.g. `/offers/agile-readiness`) → select schedule if required → **Sign in** (`customer@demo.local` / `password123`).
4. **Checkout** — standard stub payment OR org reimbursement if cart has `safe-leading-safe`.
5. Confirm success page shows order number.

## OAuth stub

1. Log out → `/login` → **Google** (dev-stub account created).
2. Confirm redirect back with session cookie and home access.

## API-only (curl-style via PowerShell)

```powershell
# Health
Invoke-WebRequest http://localhost:3001/api/v1/health

# Diagnosis session
$session = Invoke-RestMethod -Method POST http://localhost:3001/api/v1/diagnosis/session -ContentType application/json -Body '{}'
```

## Known defers (not blocking smoke)

- Production AI analysis (stub worker)
- Live Stripe keys (optional `STRIPE_SECRET_KEY`)
- Wix marketing integration
- Full campaign automation beyond enrollment notifications

---

## Clean-machine bootstrap addendum (S0.10)

Use when validating on a **second machine** or fresh clone. Requires Docker Desktop (or compatible runtime).

### Prerequisites

- Node.js 20+ and npm
- Docker with `docker compose` CLI
- Copy `server/.env.example` → `server/.env` and set at minimum:
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mybmadproj`
  - `REDIS_URL=redis://localhost:6379` (if worker/scheduler used)
  - `SESSION_SECRET` (any dev value)

### Bootstrap sequence

```powershell
# 1) Start local infra
cd C:\AgileForum\mybmadproj
docker compose up -d

# 2) Wait for Postgres healthy, then migrate + seed
cd server
npm install
npm run db:deploy

# 3) Automated tests
npm run test
npm run test:integration

# 4) Client build
cd ..\client
npm install
npm run build

# 5) Optional gate script
cd ..\server
npm run readiness:gate
```

Expect **GO** in `docs/reports/sprint-1-readiness-gate-s0-10.md` when env + DB are healthy.

### Evidence machine note (2026-06-09)

Docker CLI was **not available** on the S0.10 evidence run machine; integration tests ran against the configured remote Supabase instance instead. Clean-machine bootstrap remains **unchecked** until repeated with local `docker compose`.

### Smoke after bootstrap

1. `npm run dev` in `server/` (port 3001) and `client/` (port 5173).
2. Run **Manual funnel** and **OAuth stub** sections above.
3. Optional: IN geo installment path — select EMI on checkout, confirm Razorpay stub redirect and success page payment mode label.
