# Staging deployment — OAuth + environment wiring

Wire **public URLs** so LinkedIn/Google OAuth, session cookies, and CORS work on staging.

Replace `staging.theagileforum.com` with your real staging domain (or use the **single-origin** pattern in §2).

**Canonical URLs** are defined in `deploy/domains.json` (aligned with architecture: `app.theagileforum.com` / `api.theagileforum.com` for production).

---

## 1. URL layout (recommended: API subdomain)

| Role | Example URL | Env var |
|------|-------------|---------|
| SPA (Vite build) | `https://app.staging.theagileforum.com` | `APP_PUBLIC_URL` |
| Express API | `https://api.staging.theagileforum.com` | `API_PUBLIC_URL` |
| Browser API calls | same as API host | `VITE_API_URL` (client build) |

OAuth **redirect URIs** (register in LinkedIn + Google consoles):

```
https://api.staging.theagileforum.com/api/v1/auth/oauth/linkedin/callback
https://api.staging.theagileforum.com/api/v1/auth/oauth/google/callback
```

Session cookies are set on the **API host** after OAuth callback. `app.*` and `api.*` on the same registrable domain work with `SameSite=Lax` and `credentials: "include"` (already used in the client).

---

## 2. Alternative: single origin (SPA proxies `/api`)

If the browser only sees one host (e.g. `https://staging.theagileforum.com`):

| Setting | Value |
|---------|--------|
| `APP_PUBLIC_URL` | `https://staging.theagileforum.com` |
| `API_PUBLIC_URL` | `https://staging.theagileforum.com` |
| `VITE_API_URL` | *(unset — relative `/api` paths)* |
| OAuth redirect URIs | `https://staging.theagileforum.com/api/v1/auth/oauth/{provider}/callback` |

Proxy `/api/*` on the SPA host to your API backend (see `client/vercel.json.example`).

---

## 3. Server secrets (staging API host)

Copy `deploy/staging.server.env.example` → platform secret store (Render, Fly, Railway, etc.).

**Minimum for OAuth:**

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<pooler url>
DIRECT_URL=<direct url>
JWT_SECRET=<32+ chars>
REDIS_URL=<redis url>
OAUTH_STUB_MODE=false
APP_PUBLIC_URL=https://app.staging.theagileforum.com
API_PUBLIC_URL=https://api.staging.theagileforum.com
CORS_ALLOWED_ORIGINS=https://app.staging.theagileforum.com
LINKEDIN_CLIENT_ID=<linkedin app>
LINKEDIN_CLIENT_SECRET=<linkedin secret>
GOOGLE_CLIENT_ID=<google app>
GOOGLE_CLIENT_SECRET=<google secret>
```

Validate after deploy:

```bash
curl https://api.staging.theagileforum.com/api/v1/health
cd server && npm run staging:preflight   # with staging env vars set
```

---

## 4. Client build (staging SPA host)

Set **build-time** env (Vercel / Netlify / CI), then `npm run build` in `client/`:

```env
VITE_API_URL=https://api.staging.theagileforum.com
VITE_APP_ENV=staging
VITE_OBSERVABILITY_RELEASE=staging
# Optional analytics — see docs/staging-posthog-setup.md
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

Full template: `deploy/staging.client.env.example`

---

## 5. Provider console checklist

### LinkedIn

1. [LinkedIn Developer](https://www.linkedin.com/developers/apps) → your app → **Auth**.
2. **Authorized redirect URLs** — add exactly:
   `https://api.staging.theagileforum.com/api/v1/auth/oauth/linkedin/callback`
3. Product: **Sign In with LinkedIn using OpenID Connect**.

Details: `docs/linkedin-oauth-setup.md`

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth client.
2. **Authorized redirect URIs**:
   `https://api.staging.theagileforum.com/api/v1/auth/oauth/google/callback`
3. **Authorized JavaScript origins** (optional for redirect flow):
   `https://app.staging.theagileforum.com`

---

## 6. Deploy targets (examples)

### API on Render

1. New **Web Service** → repo root `server/`, build `npm ci --include=dev && npm run build`, start `npm start`.
2. Add env from `deploy/staging.server.env.example`.
3. Run migrations once: `npm run db:deploy` (Render shell or CI).
4. Custom domain: `api.staging.theagileforum.com` → note HTTPS URL for `API_PUBLIC_URL`.

See `deploy/render.yaml.example` for a starter blueprint.

### SPA on Vercel

1. Root directory: `client/`, build: `npm run build`, output: `dist`.
2. Env: `VITE_API_URL`, `VITE_APP_ENV`, etc.
3. Optional: copy `client/vercel.json.example` → `client/vercel.json` if using **single-origin** proxy instead of `VITE_API_URL`.

---

## 7. Post-deploy verification

| Step | Expected |
|------|----------|
| `GET /api/v1/health` | `{"status":"ok"}` |
| Open `APP_PUBLIC_URL/login` | Page loads |
| **Continue with LinkedIn** | LinkedIn consent → `/login?oauth=success` → signed in |
| **Continue with Google** | Same |
| DevTools → Application → Cookies on API domain | `access_token` httpOnly |
| SQL: `auth_provider = 'linkedin'` | New user row |

```sql
SELECT email, auth_provider, email_verified_at, created_at
FROM users
WHERE auth_provider IN ('linkedin', 'google')
ORDER BY created_at DESC
LIMIT 10;
```

---

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| `CORS_ORIGIN_BLOCKED` | Add exact `APP_PUBLIC_URL` to `CORS_ALLOWED_ORIGINS` (no trailing slash) |
| `OAUTH_TOKEN_EXCHANGE_FAILED` | Redirect URI in provider console must match `API_PUBLIC_URL` + path exactly |
| OAuth succeeds but `/me` 401 | `VITE_API_URL` must point to the host that set the cookie; check cookie domain in DevTools |
| `OAUTH_NOT_CONFIGURED` | Set client id/secret; `OAUTH_STUB_MODE=false` on staging |
| Mixed content | Use `https` for both `APP_PUBLIC_URL` and `API_PUBLIC_URL` in staging |

---

## Related docs

- `docs/linkedin-oauth-setup.md`
- `docs/staging-posthog-setup.md`
- `docs/environment-bootstrap.md`
- `deploy/staging.server.env.example`
- `deploy/staging.client.env.example`
