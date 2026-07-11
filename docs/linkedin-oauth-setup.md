# LinkedIn OAuth (live mode)

Enable **Sign in with LinkedIn** for staging and production. Local dev can keep `OAUTH_STUB_MODE=true` without LinkedIn credentials.

## 1. LinkedIn Developer app

1. Open [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) → **Create app**.
2. Under **Products**, add **Sign In with LinkedIn using OpenID Connect**.
3. **Auth** tab → **OAuth 2.0 settings**:
   - **Authorized redirect URLs** (must match exactly):
     - Local API: `http://localhost:3001/api/v1/auth/oauth/linkedin/callback`
     - Staging API: `https://<your-api-host>/api/v1/auth/oauth/linkedin/callback`
4. Copy **Client ID** and **Client Secret**.

LinkedIn OpenID scopes used by this app: `openid profile email`.

## 2. Server environment

Set in `server/.env` (never commit secrets):

```env
OAUTH_STUB_MODE=false
API_PUBLIC_URL=http://localhost:3001
APP_PUBLIC_URL=http://localhost:5173
LINKEDIN_CLIENT_ID=<from LinkedIn app>
LINKEDIN_CLIENT_SECRET=<from LinkedIn app>
```

For staging/production, use your public API and app URLs (see **`docs/staging-deploy.md`**):

```env
OAUTH_STUB_MODE=false
API_PUBLIC_URL=https://api.staging.theagileforum.com
APP_PUBLIC_URL=https://app.staging.theagileforum.com
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
```

Register this redirect in LinkedIn **exactly**:

`https://api.staging.theagileforum.com/api/v1/auth/oauth/linkedin/callback`

Client build must set `VITE_API_URL=https://api.staging.theagileforum.com` (see `deploy/staging.client.env.example`).

When `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` are set, stub mode is ignored for LinkedIn even if `OAUTH_STUB_MODE=true`.

## 3. Verify locally

1. Start API + client (`npm run dev` in `server/` and `client/`).
2. Open `http://localhost:5173/login` → **Continue with LinkedIn**.
3. Complete LinkedIn consent → you should land on `/login?oauth=success` and be signed in.
4. Confirm user row:

```sql
SELECT email, auth_provider, email_verified_at
FROM users
WHERE auth_provider = 'linkedin'
ORDER BY created_at DESC
LIMIT 5;
```

## 4. Automated tests

| Test | Coverage |
|------|----------|
| `server/src/services/oauth-service.test.ts` | Live token exchange + userinfo (mocked `fetch`) |
| `server/src/auth.oauth.test.ts` | Stub redirect |
| `server/src/auth.integration.test.ts` | Stub callback + session cookie + user create |

Run:

```powershell
cd server
npm test -- oauth-service
npm run test:integration -- auth.integration
```

## 5. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `OAUTH_NOT_CONFIGURED` (501) | Missing `LINKEDIN_CLIENT_*` with `OAUTH_STUB_MODE=false` |
| `OAUTH_TOKEN_EXCHANGE_FAILED` | Redirect URL mismatch vs LinkedIn app settings |
| `OAUTH_PROFILE_FAILED` | LinkedIn account has no verified email on file |
| `OAUTH_STATE_INVALID` | Expired or tampered `state` (10 min TTL) |
| Redirect to `/login?oauth=error` | Check `reason` query param; inspect API logs |

Ensure `API_PUBLIC_URL` matches the host LinkedIn redirects to (including `http` vs `https` and port).
