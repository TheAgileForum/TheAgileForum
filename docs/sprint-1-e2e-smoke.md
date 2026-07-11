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

### Evidence machine note (2026-06-08)

S0.10 evidence run completed: **227 tests passed**, readiness gate **GO**, sign-off record at `docs/reports/s0-10-human-sign-off.md`. Local `docker compose` remains **unchecked** until WSL2 is enabled (Docker daemon blocked). Integration tests use remote Supabase; CI Postgres job is clean-machine proxy evidence.

### Smoke after bootstrap

1. `npm run dev` in `server/` (port 3001) and `client/` (port 5173).
2. Run **Manual funnel** and **OAuth stub** sections above.
3. Optional: IN geo installment path — select EMI on checkout, confirm Razorpay stub redirect and success page payment mode label.

---

## Razorpay live sandbox (FR-170)

Use when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `server/.env` (Razorpay **test mode** keys).

### Server env

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...   # optional; webhook backup path
APP_PUBLIC_URL=http://localhost:5173
```

### Manual flow

1. Log in as `customer@demo.local` / `password123`.
2. Add `exam-mock-certification` to cart with `?geo=IN` (or use session currency INR).
3. Checkout → payment mode **Installment** → Razorpay EMI.
4. Razorpay modal opens on `/checkout/razorpay` — complete with sandbox card / EMI.
5. Confirm success page; order `status=paid` and `paymentRef` like `razorpay:order_…:pay_…`.

### Automated coverage (no live keys required)

| Layer | Test |
|-------|------|
| Orders API + signatures | `server/src/integrations/razorpay-api.test.ts` |
| Live session when keys set | `server/src/services/razorpay-checkout-service.test.ts` |
| Webhook `payment.captured` | `server/src/routes/razorpay-webhook.routes.test.ts` |
| Full confirm path (mocked Orders API) | `commerce.integration.test.ts` → Razorpay live sandbox path |

Run integration slice when DB is up:

```powershell
cd C:\AgileForum\mybmadproj\server
npm run test:integration -- src/commerce/commerce.integration.test.ts
```

---

## Stripe live sandbox (non-IN geo)

Use when `STRIPE_SECRET_KEY` is set in `server/.env` (Stripe **test mode** secret `sk_test_...`).

### Server env

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # optional locally; required for webhook backup
APP_PUBLIC_URL=http://localhost:5173
```

### Manual flow

1. Header currency → **USD** (or EUR/GBP/CAD/AUD/SGD/AED — routes to Stripe; INR → Razorpay).
2. Log in as `customer@demo.local` / `password123`.
3. Add **Mock Certification Exam** to cart → checkout → **Pay in full**.
4. Browser redirects to **checkout.stripe.com** — use test card `4242 4242 4242 4242`, any future expiry, any CVC.
5. After payment, Stripe returns to `/checkout/success?order=...&orderId=...&session_id=...&provider=stripe`.
6. Success page calls `POST /checkout/stripe/confirm` → order `paid`.

### Webhook (optional)

Dashboard → **Developers → Webhooks → Add endpoint**:

```text
http://localhost:3001/api/v1/integrations/stripe/webhook
```

Event: `checkout.session.completed`. For localhost, use **Stripe CLI** (`stripe listen --forward-to localhost:3001/api/v1/integrations/stripe/webhook`) or rely on the **confirm** API on success page.

### Test card

| Field | Value |
|-------|--------|
| Card | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
