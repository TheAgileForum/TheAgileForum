# Google OAuth (live mode)

Enable **Sign in with Google** for staging and production. Local dev can use the OAuth stub without Google credentials.

## Quick fix for `Error 401: invalid_client`

This usually means the app sent a placeholder `client_id` (for example `test`) to Google. Either:

1. **Use dev stub (easiest locally)** — remove placeholder vars from your shell / `server/.env` and set:

```env
OAUTH_STUB_MODE=true
```

Restart the API server. Google sign-in will create a stub user locally (no Google console needed).

2. **Use real Google credentials** — follow the steps below and set `OAUTH_STUB_MODE=false` with a valid Client ID and Secret.

## 1. Google Cloud OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. **Create credentials** → **OAuth client ID** → application type **Web application**.
3. **Authorized redirect URIs** (must match exactly):
   - Local API: `http://localhost:3001/api/v1/auth/oauth/google/callback`
   - Staging API: `https://<your-api-host>/api/v1/auth/oauth/google/callback`
4. Copy **Client ID** and **Client secret**.

Scopes used: `openid email profile`.

## 2. Server environment

Set in `server/.env` (never commit secrets):

```env
OAUTH_STUB_MODE=false
API_PUBLIC_URL=http://localhost:3001
APP_PUBLIC_URL=http://localhost:5173
GOOGLE_CLIENT_ID=<from Google Cloud>
GOOGLE_CLIENT_SECRET=<from Google Cloud>
```

For staging/production, use your public API and app URLs (see **`docs/staging-deploy.md`**):

```env
OAUTH_STUB_MODE=false
API_PUBLIC_URL=https://api.staging.theagileforum.com
APP_PUBLIC_URL=https://app.staging.theagileforum.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Register this redirect in Google **exactly**:

`https://api.staging.theagileforum.com/api/v1/auth/oauth/google/callback`

## 3. Verify locally

1. Start API + client (`npm run dev` in `server/` and `client/`).
2. Open `http://localhost:5173/login` → **Continue with Google**.
3. Complete Google consent → you should land on `/login?oauth=success` and be signed in.

## 4. Dev stub vs live

| Mode | When | Behaviour |
|------|------|-----------|
| Stub | `OAUTH_STUB_MODE=true` or missing/placeholder credentials in development | Instant local sign-in with a generated `@oauth.stub.local` user |
| Live | Real `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`, `OAUTH_STUB_MODE=false` | Redirects to Google, exchanges code, creates/links user by email |

Placeholder values like `test` are ignored and fall back to stub in development.
