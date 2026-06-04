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
