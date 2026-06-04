# Environment Bootstrap Runbook (S0.2)

## Purpose

Provide a repeatable setup sequence for local/dev/stage environment configuration with fail-fast validation.

## Runtime Components

- `server` (Express API)
- `server` worker runtime skeleton
- `server` scheduler runtime skeleton
- `client` (Vite frontend)

## Required Environment Files

- `server/.env` (required)
- `client/.env` (optional unless overriding API URL)
- `server/.env.test` (integration tests; recommended separate DB/project)

## Local Setup Steps

1. Copy env template files:
   - `server/.env.example` -> `server/.env`
   - `client/.env.example` -> `client/.env` (optional)
2. Set required values in `server/.env`:
   - `NODE_ENV`
   - `PORT`
   - `DATABASE_URL` (runtime/pool URL)
   - `DIRECT_URL` (direct DB URL for migrations)
   - `JWT_SECRET` (minimum 32 chars)
   - `REDIS_URL`
3. Validate backend environment:
   - `cd server && npm run env:check`
4. Install and run backend:
   - `cd server && npm install && npm run dev`
5. Install and run frontend:
   - `cd client && npm install && npm run dev`
6. Optional full runtime orchestration (API + worker + scheduler):
   - `cd server && npm run dev:runtime`

## Stage Setup Notes

- Use platform-managed secrets for stage/prod variables.
- Never copy local `.env` files into shared environments.
- Keep `NODE_ENV=production` in production-like deployments.
- Recommended split:
  - `DATABASE_URL` = pooler/runtime URL
  - `DIRECT_URL` = direct DB URL for Prisma migrations
- For integration tests, prefer a separate Supabase test project and set
  `server/.env.test` (`DATABASE_URL` + `DIRECT_URL`) to that test database.

## Troubleshooting

- If `env:check` fails, fix the exact key reported and rerun.
- If app boots but auth fails, confirm `JWT_SECRET` length and `DATABASE_URL` reachability.
- If frontend cannot call API, verify Vite proxy or `VITE_API_URL`.
- If worker/scheduler fail to start, verify `REDIS_URL` and ports (`WORKER_PORT`, `SCHEDULER_PORT`).
