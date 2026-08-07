# Sender.net email setup — The Agile Forum

Transactional email alternative to Resend. Uses the Sender.net REST API (`POST /v2/message/send`) via `LiveEmailAdapter` when `EMAIL_PROVIDER=sender` (or when only a Sender token is configured). Callers (enrollment, mock interview welcome, verify, password reset, ops) are unchanged.

API reference: [Send transactional email (without template)](https://api.sender.net/transactional-campaigns/send-transactional/).

## Environment variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `SENDER_API_TOKEN` | For real Sender sends | *(from Sender dashboard)* | Account settings → API access tokens. Preferred name. Never commit. |
| `SENDER_API_KEY` | Alias | same | Accepted at runtime if `SENDER_API_TOKEN` is unset |
| `EMAIL_PROVIDER` | Recommended when using Sender | `sender` | `resend` \| `sender`. If unset: Resend if `RESEND_API_KEY` set, else Sender if token set, else stub |
| `EMAIL_FROM` | When Sender/Resend credentials set | `DhirenderVerma@theagileforum.com` | Must be a verified sender address in Sender |
| `EMAIL_FROM_NAME` | Optional | `The Agile Forum` | Maps to Sender `from.name` (API requires name). Default: `The Agile Forum` |
| `INTEGRATION_PROVIDER_MODE` | Staging/prod | `live` | Stub mode uses `StubEmailAdapter` and never calls Sender/Resend |
| `RESEND_API_KEY` | Keep for fallback | `re_...` | Leave set if you want to switch back with `EMAIL_PROVIDER=resend` |

When `INTEGRATION_PROVIDER_MODE=live` but no provider credentials match the selection, `LiveEmailAdapter` returns a stub `messageId` (no network call).

## Local development

1. Create a [Sender.net](https://www.sender.net/) account with transactional email enabled.
2. Generate an API access token (Account settings → API access tokens).
3. Verify `DhirenderVerma@theagileforum.com` (or your chosen From) as a sender in Sender.
4. Set in `server/.env`:
   ```env
   INTEGRATION_PROVIDER_MODE=live
   EMAIL_PROVIDER=sender
   SENDER_API_TOKEN=your_token_here
   EMAIL_FROM=DhirenderVerma@theagileforum.com
   EMAIL_FROM_NAME=The Agile Forum
   ```
5. Quick API check:
   ```bash
   cd server
   npm run sender:verify -- you@your-inbox.com
   ```

## Render staging — activate Sender

On **agile-forum-api-staging** → **Environment**, set:

1. `SENDER_API_TOKEN` = your Sender API access token (secret)
2. `EMAIL_PROVIDER=sender`
3. `EMAIL_FROM=DhirenderVerma@theagileforum.com`
4. Optional: `EMAIL_FROM_NAME=The Agile Forum`
5. Keep `INTEGRATION_PROVIDER_MODE=live`
6. Optionally keep `RESEND_API_KEY` as fallback; switch with `EMAIL_PROVIDER=resend` without redeploying code

Redeploy (or let Render restart) after env changes.

To revert to Resend: set `EMAIL_PROVIDER=resend` (and ensure `RESEND_API_KEY` + verified `EMAIL_FROM`).

## Request shape (implementation)

```http
POST https://api.sender.net/v2/message/send
Authorization: Bearer {SENDER_API_TOKEN}
Content-Type: application/json
Accept: application/json
```

```json
{
  "from": { "email": "DhirenderVerma@theagileforum.com", "name": "The Agile Forum" },
  "to": { "email": "learner@example.com" },
  "subject": "...",
  "html": "..."
}
```

Success response includes `emailId` (used as `messageId` in the adapter).

## Implementation reference

| Piece | Path |
|-------|------|
| Sender HTTP client | `server/src/integrations/sender-api.ts` |
| Provider selection | `server/src/integrations/email-provider.ts` |
| Live adapter | `server/src/integrations/adapters.live.ts` |
| Verify script | `server/scripts/verify-sender-key.ts` |
| Resend (fallback) | `docs/resend-setup.md` |
