# Staging preflight + payment keys — 2026-07-12

**Branch:** `sprint/s1-ux-staging-continue`  
**Runner:** local agent

## Staging env templates

| File | Purpose |
|------|---------|
| `deploy/staging.server.env.example` | Filled template for API host (URLs from `domains.json`) |
| `deploy/staging.client.env.example` | Filled template for Vercel/Netlify build |
| `deploy/staging.server.env` | Local copy (gitignored) — secrets merged from `server/.env` |
| `deploy/staging.client.env` | Local copy (gitignored) |

## `npm run staging:preflight` (from `deploy/staging.server.env`)

| Check | Result |
|-------|--------|
| APP / API / CORS URLs | **PASS** |
| OAuth redirect URIs | **PASS** (register in consoles) |
| DATABASE_URL + JWT_SECRET | **PASS** |
| STRIPE_SECRET_KEY | **PASS** (test mode) |
| RAZORPAY_KEY_ID | **PASS** |
| LinkedIn / Google credentials | **WARN** — not set locally |

## Stripe sandbox status

| Check | Result |
|-------|--------|
| `STRIPE_SECRET_KEY` in `server/.env` | **SET** (`sk_test_...`) |
| `npm run stripe:verify` | **PASS** — key accepted by Stripe API |
| `STRIPE_WEBHOOK_SECRET` | **Not set** — OK for local; success page uses confirm API |
| Manual browser checkout (USD → checkout.stripe.com) | **Not recorded** — Razorpay manual E2E was verified; run once per `docs/sprint-1-e2e-smoke.md` § Stripe |

## Still required for real staging E2E

1. Deploy API (Render/Fly) with `deploy/staging.server.env` secrets + custom domain `api.staging.theagileforum.com`
2. Deploy SPA (Vercel) with `deploy/staging.client.env` + domain `app.staging.theagileforum.com`
3. `curl https://api.staging.theagileforum.com/api/v1/health`
4. OAuth consoles — add redirect URIs from preflight output
5. Browser: login + USD checkout (Stripe) + INR checkout (Razorpay)
