# mybmadproj

Full-stack scaffold: **Vite + React (TypeScript)** client and **Express + TypeScript** API, per `_bmad-output/planning-artifacts/architecture.md`.

## Prerequisites

- **Node.js** (current LTS recommended)
- **npm**

## Quick start

### Database (Story 1.1+)

Auth uses **PostgreSQL** + **Prisma**. From repo root:

```bash
docker compose up -d
```

This starts local dependencies:
- PostgreSQL on `5432`
- Redis on `6379` (runtime skeleton dependency for worker/scheduler)

Create `server/.env` from `server/.env.example` and set:
- `DATABASE_URL` (runtime/pool URL)
- `DIRECT_URL` (direct migration URL)
- `JWT_SECRET` (32+ chars)

Then:

```bash
cd server
npx prisma migrate deploy
npm run db:seed
```

Demo logins (after seed): **`customer@demo.local`** / **`password123`**, **`ops@demo.local`** / **`password123`**.

### API server

Terminal 1 — API (default port **3001**):

```bash
cd server
npm install
copy .env.example .env   # Windows; add DATABASE_URL + JWT_SECRET for auth
npm run dev
```

Terminal 2 — client (Vite dev server, default **5173**):

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). The home page calls **`GET /api/v1/health`** through the Vite **`/api` → `http://localhost:3001`** proxy.

### Verify health directly

```bash
curl http://localhost:3001/api/v1/health
```

Expected: `200` and body `{"status":"ok"}`.

## Scripts

| Location | Command        | Description        |
|----------|----------------|--------------------|
| `server` | `npm run dev`  | API with hot reload (`tsx watch`) |
| `server` | `npm run dev:worker` | Worker runtime skeleton with heartbeat + health endpoint |
| `server` | `npm run dev:scheduler` | Scheduler runtime skeleton with heartbeat + health endpoint |
| `server` | `npm run dev:runtime` | Local orchestrator that starts API + worker + scheduler |
| `server` | `npm run build`| Compile to `dist/` |
| `server` | `npm start`    | Run compiled `dist/index.js` |
| `server` | `npm run start:worker` | Run compiled worker runtime |
| `server` | `npm run start:scheduler` | Run compiled scheduler runtime |
| `server` | `npm test`     | Vitest unit (`/health`, no DB) |
| `server` | `npm run test:integration` | Auth tests — needs Postgres + `server/.env.test` |
| `server` | `npm run events:synthetic` | Synthetic publish->dispatch event flow verification |
| `server` | `npm run observability:synthetic` | Synthetic error/event injection for alert-route validation |
| `client` | `npm run dev`  | Vite dev + HMR |
| `client` | `npm run build`| Production bundle |

## Engineering standards baseline (Sprint 0)

- Root formatting rules are defined in `.editorconfig`.
- Pull requests use `.github/pull_request_template.md`.
- CI workflow is defined in `.github/workflows/ci.yml` and runs:
  - `client`: lint and build
  - `server`: unit tests and build

## Environment

- **`server/.env.example`** — required backend runtime variables.
- Prisma datasource uses:
  - `DATABASE_URL` for runtime connections
  - `DIRECT_URL` for migration path
- **`client/.env.example`** — optional frontend overrides.
- Validate backend environment before startup:
  - `cd server && npm run env:check`
- Detailed setup docs:
  - `docs/environment-bootstrap.md`
  - `docs/staging-deploy.md` — staging URLs, OAuth, Render/Vercel examples
  - `docs/linkedin-oauth-setup.md`
  - `docs/secrets-policy.md`
  - `docs/data-baseline-s0-4.md`
  - `docs/auth-rbac-consent-contracts-s0-5.md`
  - `docs/event-queue-baseline-s0-6.md`
  - `docs/integrations-scaffolding-s0-7.md`
  - `docs/observability-baseline-s0-8.md`

Do not commit `.env` files with secrets.

### Runtime skeleton health endpoints (S0.3)

- API: `http://localhost:3001/api/v1/health`
- Worker: `http://localhost:3101/health`
- Scheduler: `http://localhost:3102/health`

### Integration webhook skeleton (S0.7)

- Stripe webhook: `POST http://localhost:3001/api/v1/integrations/stripe/webhook`

## Project layout

- `client/` — Vite React app
- `server/` — Express API (`GET /api/v1/health`)
- `_bmad-output/` — planning & implementation artifacts (BMad)
