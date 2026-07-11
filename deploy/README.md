# Deploy — staging (The Agile Forum)

Canonical URLs: **`deploy/domains.json`**

| Environment | App (SPA) | API |
|-------------|-----------|-----|
| Staging | `https://app.staging.theagileforum.com` | `https://api.staging.theagileforum.com` |
| Production | `https://app.theagileforum.com` | `https://api.theagileforum.com` |

Full runbook: [`docs/staging-deploy.md`](../docs/staging-deploy.md)

---

## Quick start (staging)

### 1. API — Docker (Fly, Railway, Render, etc.)

```bash
cd server
docker build -t agile-forum-api .
docker run --env-file ../deploy/staging.server.env -p 3001:3001 agile-forum-api
```

Or use **`deploy/render.yaml.example`** → copy to Render dashboard as blueprint.

### 2. Secrets

Copy and fill (never commit):

- `deploy/staging.server.env.example` → platform secret store
- `deploy/staging.client.env.example` → Vercel/Netlify build env

### 3. Preflight (before go-live)

```powershell
cd server
$env:APP_PUBLIC_URL="https://app.staging.theagileforum.com"
$env:API_PUBLIC_URL="https://api.staging.theagileforum.com"
$env:CORS_ALLOWED_ORIGINS="https://app.staging.theagileforum.com"
$env:OAUTH_STUB_MODE="false"
$env:LINKEDIN_CLIENT_ID="..."
$env:LINKEDIN_CLIENT_SECRET="..."
# plus DATABASE_URL, JWT_SECRET from your .env
npm run staging:preflight
```

### 4. OAuth consoles

Register **exact** redirect URIs from `deploy/domains.json` → `staging.oauthRedirects`:

- LinkedIn: `https://api.staging.theagileforum.com/api/v1/auth/oauth/linkedin/callback`
- Google: `https://api.staging.theagileforum.com/api/v1/auth/oauth/google/callback`

### 5. Client (Vercel)

- Root: `client/`
- Build: `npm ci && npm run build`
- Output: `dist`
- Env: `VITE_API_URL=https://api.staging.theagileforum.com` (+ see `staging.client.env.example`)

### 6. Verify

```bash
curl https://api.staging.theagileforum.com/api/v1/health
```

Browser: `https://app.staging.theagileforum.com/login` → **Continue with LinkedIn**

---

## Files

| File | Purpose |
|------|---------|
| `domains.json` | Single source of truth for public URLs |
| `staging.server.env.example` | API env template |
| `staging.client.env.example` | SPA build env template |
| `render.yaml.example` | Render web service blueprint |
| `../client/vercel.json.example` | Optional same-origin `/api` proxy |
| `../server/Dockerfile` | Production API image |
