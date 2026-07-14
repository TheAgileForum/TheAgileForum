# AGENTS.md

## Cursor Cloud specific instructions

This repo is a two-package monorepo: `server/` (Express + TypeScript + Prisma API, port `3001`) and `client/` (React + Vite SPA, port `5173`). In dev the client proxies `/api → http://localhost:3001` (see `client/vite.config.ts`). Standard commands live in `README.md` and each `package.json`; only the non-obvious cloud caveats are below.

### Datastore (PostgreSQL) — must be running before the API or tests
- PostgreSQL 16 is installed via `apt` and is NOT Docker. Do NOT use `docker compose` here (Docker is unavailable); the `docker-compose.yml` is only a hint for the required services.
- The Postgres process does not auto-start on a fresh VM boot. Start it first:
  `sudo pg_ctlcluster 16 main start`
- Connection: `postgresql://postgres:postgres@localhost:5432/<db>` (password auth over TCP is enabled). Databases `mybmadproj` (dev) and `mybmadproj_test` (integration) already exist in the snapshot.
- Redis (worker/scheduler skeleton) is OPTIONAL and not installed; core commerce/diagnosis/auth flows do not need it.

### Env files (already created, git-ignored, persisted in snapshot)
- `server/.env` — dev config pointing at `mybmadproj` with a valid 32+ char `JWT_SECRET`.
- `server/.env.test` — integration-test config pointing at `mybmadproj_test` (loaded by `vitest.integration.config.ts`).
- All external integrations default to `INTEGRATION_PROVIDER_MODE=stub` and `OAUTH_STUB_MODE=true`, so no real Stripe/Razorpay/Resend/OAuth keys are needed for local dev or tests.

### DB migrations & seed (NOT in the update script — run manually if the DB is empty)
- Dev DB: `cd server && npm run db:deploy && npm run db:seed`
- Test DB (needed once before `npm run test:integration`): apply migrations with the test URL, e.g.
  `cd server && DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mybmadproj_test" DIRECT_URL="postgresql://postgres:postgres@localhost:5432/mybmadproj_test" npx prisma migrate deploy`
- Gotcha: the integration tests run `npx tsx prisma/seed.ts` in `beforeAll`, which fails if the test DB has no schema. Ensure the test DB migrations are applied first.
- Seed creates demo logins: `customer@demo.local` / `password123` and `ops@demo.local` / `password123`, plus 8 catalog offerings.

### Running & testing
- API: `cd server && npm run dev` (health: `curl http://localhost:3001/api/v1/health` → `{"status":"ok"}`).
- Client: `cd client && npm run dev` (open `http://localhost:5173`).
- Server tests: `npm test` (247 unit tests, no DB) and `npm run test:integration` (needs Postgres + test DB migrated).
- Client lint: `npm run lint` (passes with only warnings). Client has no unit tests; `npm run test:e2e` is Playwright (browsers not installed by default).
- The worker/scheduler (`npm run dev:worker` / `dev:scheduler`) are heartbeat-only skeletons and are not needed for user-facing flows.
