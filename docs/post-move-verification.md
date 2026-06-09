# Post-move verification checklist

Run from `C:\AgileForum\mybmadproj` after relocating the project or fixing Cursor paths.

## Environment

- [ ] `server/.env` exists (copy from `server/.env.example`)
- [ ] `DATABASE_URL` and `JWT_SECRET` set
- [ ] `docker compose up -d` (if using local Postgres)
- [ ] `cd server && npx prisma migrate deploy`

## Backend

```powershell
cd C:\AgileForum\mybmadproj\server
npm install
npm test
npm run build
```

## Frontend

```powershell
cd C:\AgileForum\mybmadproj\client
npm install
npm run lint
npm run build
npm run dev
```

- [ ] Vite on http://localhost:5173/
- [ ] API proxy to http://localhost:3001 (`/api/v1/health`)

## Smoke (Sprint 1 funnel)

1. Home → **Start diagnosis**
2. Step 1 intent + consent → Step 2 resume upload → **Run analysis**
3. Step 3 progress → Step 4 results → primary CTA → offer page
4. Sign in → add to cart → checkout start → confirm (stub)

## Cursor terminal

- [ ] Workspace opened at `C:\AgileForum\mybmadproj` (not deleted OneDrive path)
- [ ] `terminal.integrated.cwd` matches canonical root (see `docs/fix-cursor-old-path.md`)
