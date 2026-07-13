# Google OAuth (live mode)

Enable **Sign in with Google** for staging and production. Local dev can keep `OAUTH_STUB_MODE=true` without Google credentials.

## Why staging returns `OAUTH_NOT_CONFIGURED` (501)

Staging sets `OAUTH_STUB_MODE=false` (live OAuth required). When **either** `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is missing, empty, or a placeholder (`test`, `changeme`, etc.), the API returns:

```json
{"error":{"code":"OAUTH_NOT_CONFIGURED","message":"OAuth provider credentials are not configured"}}
```

LinkedIn can work while Google fails if only `LINKEDIN_CLIENT_*` is set on Render. `npm run staging:verify` reports `google-oauth FAIL` until Google credentials are added.

## Quick fix for `Error 401: invalid_client` (local dev)

This usually means the app sent a placeholder `client_id` (for example `test`) to Google. Either:

1. **Use dev stub (easiest locally)** — remove placeholder vars from your shell / `server/.env` and set:

```env
OAUTH_STUB_MODE=true
```

Restart the API server. Google sign-in will create a stub user locally (no Google console needed).

2. **Use real Google credentials** — follow the steps below and set `OAUTH_STUB_MODE=false` with a valid Client ID and Secret.

## 1. Google Cloud Console

### A. OAuth consent screen (required once per project)

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **OAuth consent screen**.
2. Choose **External** (or Internal if using Google Workspace only).
3. Fill app name, support email, and developer contact.
4. **Scopes** — add (or confirm at authorize time): `openid`, `email`, `profile` (the app requests `openid email profile`).
5. **Test users** — while the app is in *Testing*, add Google accounts that may sign in.
6. Publish to *Production* when ready for any Google user.

### B. OAuth client (Web application)

1. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized redirect URIs** (must match **exactly** — no trailing slash):

| Environment | Redirect URI |
|-------------|--------------|
| Local API | `http://localhost:3001/api/v1/auth/oauth/google/callback` |
| Staging API | `https://api.staging.theagileforum.com/api/v1/auth/oauth/google/callback` |
| Production API | `https://api.theagileforum.com/api/v1/auth/oauth/google/callback` |

4. **Authorized JavaScript origins** (optional for server-side redirect flow; safe to add):

| Environment | Origin |
|-------------|--------|
| Local SPA | `http://localhost:5173` |
| Staging SPA | `https://app.staging.theagileforum.com` |
| Production SPA | `https://app.theagileforum.com` |

5. Copy **Client ID** and **Client secret**.

Canonical staging redirect is also in `deploy/domains.json` → `staging.oauthRedirects.google`.

## 2. Server environment

Set in `server/.env` (never commit secrets):

```env
OAUTH_STUB_MODE=false
API_PUBLIC_URL=http://localhost:3001
APP_PUBLIC_URL=http://localhost:5173
GOOGLE_CLIENT_ID=<from Google Cloud>
GOOGLE_CLIENT_SECRET=<from Google Cloud>
```

For staging/production (see **`docs/staging-deploy.md`**):

```env
OAUTH_STUB_MODE=false
API_PUBLIC_URL=https://api.staging.theagileforum.com
APP_PUBLIC_URL=https://app.staging.theagileforum.com
CORS_ALLOWED_ORIGINS=https://app.staging.theagileforum.com
GOOGLE_CLIENT_ID=<from Google Cloud>
GOOGLE_CLIENT_SECRET=<from Google Cloud>
```

`API_PUBLIC_URL` must be the host Google redirects to. The browser may call OAuth start via `app.staging.../api/...` (Vercel proxy), but the **redirect URI registered in Google** is always on the **API host**.

## 3. Render checklist (staging API service)

In Render → **agile-forum-api-staging** → **Environment**:

| Variable | Value |
|----------|--------|
| `OAUTH_STUB_MODE` | `false` |
| `API_PUBLIC_URL` | `https://api.staging.theagileforum.com` |
| `APP_PUBLIC_URL` | `https://app.staging.theagileforum.com` |
| `GOOGLE_CLIENT_ID` | *(from Google Cloud)* |
| `GOOGLE_CLIENT_SECRET` | *(from Google Cloud)* |

Save → **Manual Deploy** (or wait for auto-deploy). Then verify:

```bash
cd server
npm run staging:verify
```

Expect `google-oauth PASS` with `mode=live-google` (302 redirect to `accounts.google.com`).

## 4. Verify end-to-end

1. Open `https://app.staging.theagileforum.com/login` → **Continue with Google**.
2. Complete Google consent → land on `/login?oauth=success` and be signed in.
3. Optional SQL:

```sql
SELECT email, auth_provider, email_verified_at, created_at
FROM users
WHERE auth_provider = 'google'
ORDER BY created_at DESC
LIMIT 5;
```

## 5. Dev stub vs live

| Mode | When | Behaviour |
|------|------|-----------|
| Stub | `OAUTH_STUB_MODE=true`, or missing/placeholder credentials in development | Instant local sign-in with a generated `@oauth.stub.local` user |
| Live | Real `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`, `OAUTH_STUB_MODE=false` | Redirects to Google, exchanges code, creates/links user by email |

On staging/production with `OAUTH_STUB_MODE=false`, missing Google credentials **fail closed** with `OAUTH_NOT_CONFIGURED` (no stub fallback).

Placeholder values like `test` are ignored in development and fall back to stub; on production they still count as not configured when stub mode is off.

## 6. Automated tests

| Test | Coverage |
|------|----------|
| `server/src/services/oauth-service.test.ts` | Live Google token exchange + userinfo (mocked `fetch`) |
| `server/src/auth.oauth.test.ts` | Stub redirect |
| `server/src/auth.integration.test.ts` | Stub callback + session cookie + user create |
| `server/src/auth.contract.test.ts` | `OAUTH_NOT_CONFIGURED` when stub off and no credentials |

```powershell
cd server
npm test -- oauth-service
npm run test:integration -- auth.integration
```

## 7. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `OAUTH_NOT_CONFIGURED` (501) | Missing `GOOGLE_CLIENT_*` with `OAUTH_STUB_MODE=false` on Render |
| `Error 401: invalid_client` | Placeholder or wrong Client ID sent to Google |
| `redirect_uri_mismatch` | Redirect URI in Google Console ≠ `{API_PUBLIC_URL}/api/v1/auth/oauth/google/callback` |
| `OAUTH_TOKEN_EXCHANGE_FAILED` | Redirect URI mismatch, wrong secret, or expired auth code |
| `OAUTH_PROFILE_FAILED` | Google account has no email on file, or userinfo request failed |
| `OAUTH_STATE_INVALID` | Expired or tampered `state` (10 min TTL) |
| Redirect to `/login?oauth=error` | Check `reason` query param; inspect API logs |
| Consent screen blocks sign-in | App in *Testing* — add user as **Test user**, or publish app |
| OAuth succeeds but `/me` 401 | Cookie domain / `VITE_API_URL` — see `docs/staging-deploy.md` §8 |

Ensure `API_PUBLIC_URL` matches the host Google redirects to (including `https` and no trailing slash).
