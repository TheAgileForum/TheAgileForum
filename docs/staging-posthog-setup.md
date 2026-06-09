# PostHog live capture — staging setup

Server commerce events and client shell analytics can both send to the same PostHog project when keys are configured.

## 1. PostHog project

1. Create or open a PostHog project (cloud: [us.posthog.com](https://us.posthog.com) or EU).
2. **Project Settings → Project API Key** — copy the `phc_…` key (same key works for server and browser).

## 2. Server (staging API)

Set in staging secrets or `server/.env`:

```env
POSTHOG_API_KEY=phc_your_project_api_key
POSTHOG_HOST=https://us.i.posthog.com
OBSERVABILITY_RELEASE=staging
NODE_ENV=production
```

Events emitted from the API (with Zod product contracts):

| Event | Source |
|-------|--------|
| `global_cart_viewed` | Guest cart GET |
| `cart_updated` | Add to cart |
| `checkout_started` | Checkout session start |
| `checkout_confirmed` | Payment confirmed |
| `installment_*` | EMI funnel |

All server captures include `app_env`, `release`, and `service: mybmadproj-server`.

## 3. Client (staging SPA)

Build-time env (e.g. CI / hosting):

```env
VITE_POSTHOG_KEY=phc_your_project_api_key
VITE_POSTHOG_HOST=https://us.i.posthog.com
VITE_APP_ENV=staging
VITE_OBSERVABILITY_RELEASE=staging
```

Browser events flow through `trackEvent()` in `client/src/lib/analytics.ts` (Clarity + PostHog when configured).

## 4. Verify live capture

From `server/`:

```bash
npm run observability:posthog-verify
```

- **Exit 0** — all contracted events flushed to PostHog.
- **Exit 1** — missing `POSTHOG_API_KEY` or a capture failed.

In PostHog → **Activity**, filter `staging_posthog_verify` (last 5 minutes) to confirm the verify run.

## 5. Local one-off test

```powershell
$env:POSTHOG_API_KEY="phc_..."
$env:OBSERVABILITY_RELEASE="staging"
cd server
npm run observability:posthog-verify
```

Do not commit real API keys. Use staging secrets or a local `.env` file (gitignored).

## 6. Readiness gate

`npm run observability:synthetic` still runs without PostHog (synthetic Sentry/alert path).

Run `observability:posthog-verify` separately after staging deploy when `POSTHOG_API_KEY` is set.
