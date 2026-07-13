# Resend email setup — The Agile Forum

Transactional email for verification, enrollment confirmations, and ops alerts. Uses the Resend REST API via `LiveEmailAdapter` (no SDK dependency).

## Environment variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `RESEND_API_KEY` | For real sends | `re_...` | From [Resend API Keys](https://resend.com/api-keys). Never commit. |
| `EMAIL_FROM` | When `RESEND_API_KEY` set | `onboarding@resend.dev` (dev) / `notifications@theagileforum.com` (prod) | Must be a verified sender in Resend |
| `INTEGRATION_PROVIDER_MODE` | Staging/prod | `live` | Stub mode uses `StubEmailAdapter` and never calls Resend |
| `REQUIRE_EMAIL_VERIFICATION` | Optional | `true` on staging | Blocks login until email verified |
| `OPS_ENROLLMENT_ALERT_EMAIL` | Optional | `ops@theagileforum.com` | Ops enrollment alert recipient |

When `INTEGRATION_PROVIDER_MODE=live` and `RESEND_API_KEY` is **unset**, `LiveEmailAdapter` returns a stub `messageId` (no network call). This keeps local/staging deploys safe until the key is added.

## Local development

1. Create a free [Resend](https://resend.com) account.
2. Copy `server/.env.example` → `server/.env` if needed.
3. Set:
   ```env
   INTEGRATION_PROVIDER_MODE=live
   RESEND_API_KEY=re_your_key_here
   EMAIL_FROM=onboarding@resend.dev
   ```
   `onboarding@resend.dev` works without domain verification; Resend only delivers to the email on your Resend account unless you verify a domain.
4. Quick API check:
   ```bash
   cd server
   npm run resend:verify -- you@your-resend-account-email.com
   ```

## Domain verification (staging / production)

1. In Resend → **Domains** → **Add Domain** (e.g. `theagileforum.com` or `notify.staging.theagileforum.com`).
2. Add the DNS records Resend provides (SPF, DKIM; add DMARC when ready).
3. Wait for verification (usually minutes).
4. Set `EMAIL_FROM` to an address on that domain, e.g. `notifications@theagileforum.com`.

Keep human mail (`ops@`, `support@`) on Microsoft 365; use Resend only for app-generated mail. See `docs/email-provider-comparison.md`.

## Render staging

1. Open the **agile-forum-api-staging** service → **Environment**.
2. Add secrets (do not put in git):
   - `RESEND_API_KEY` = your Resend API key
   - `EMAIL_FROM` = verified sender (or `onboarding@resend.dev` for first smoke test)
3. Ensure these are already set (see `deploy/staging.server.env.example`):
   - `INTEGRATION_PROVIDER_MODE=live`
   - `REQUIRE_EMAIL_VERIFICATION=true` (when you want gated signup)
   - `OPS_ENROLLMENT_ALERT_EMAIL=ops@theagileforum.com`
4. Redeploy after env changes.

Blueprint reference: `deploy/render.yaml.example`.

## Test verification email on staging

1. Confirm Render has `RESEND_API_KEY`, `EMAIL_FROM`, `INTEGRATION_PROVIDER_MODE=live`, and `REQUIRE_EMAIL_VERIFICATION=true`.
2. Register a new user at `https://app.staging.theagileforum.com` with an inbox you control.
3. Check email for **Verify your Agile Forum account** (from `EMAIL_FROM`).
4. Click the link → API `GET /api/v1/auth/verify-email?token=...` → redirect to login with `?verified=1`.
5. If no mail: Resend dashboard → **Emails** for delivery status; confirm `EMAIL_FROM` is verified and recipient is allowed (test domain only sends to your Resend account email).
6. Resend manually: log in → account/settings flow or `POST /api/v1/auth/verify-email/resend` (authenticated).

## Implementation reference

| Piece | Path |
|-------|------|
| Resend HTTP client | `server/src/integrations/resend-api.ts` |
| Live adapter | `server/src/integrations/adapters.live.ts` |
| Verification flow | `server/src/services/email-verification-service.ts` |
| Enrollment mail | `server/src/notifications/enrollment-notifier.ts` |
| Verify script | `server/scripts/verify-resend-key.ts` |

## Future

- Webhook route for `email.bounced` / `email.complained` (delivery tracking)
- Plain-text multipart bodies for accessibility
