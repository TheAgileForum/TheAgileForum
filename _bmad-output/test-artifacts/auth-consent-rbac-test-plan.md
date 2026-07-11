# Auth, Consent & RBAC QA Plan (FR-1..3, FR-151, FR-180)

**Status:** Active — routes in `server/src/routes/auth.routes.ts`  
**Target:** Epic 1, Epic 10.5  
**API matrix:** validation rules 4 and 15

## FR mapping

| FR | Requirement | Automated coverage |
|----|-------------|-------------------|
| FR-1 | Register/login (email + OAuth) | `auth.integration.test.ts`, `auth.oauth.test.ts`, `auth.contract.test.ts` |
| FR-2 | Profile create/update | `auth.integration.test.ts` (`/me`); profile prefs API (pending) |
| FR-3 | Consent before diagnosis | `diagnosis.integration.test.ts` (IT-02); `auth.integration.test.ts` (consent upsert) |
| FR-151 | Checkout requires auth | `commerce.integration.test.ts` |
| FR-180 | Admin/ops routes admin-RBAC only | `auth.integration.test.ts` (admin-check); full `/admin/*` gate (pending) |

## Unit / contract tests (implemented)

| File | Scope |
|------|-------|
| `server/src/auth.contract.test.ts` | Error shapes, unauthenticated admin-check 401 |
| `server/src/auth.oauth.test.ts` | OAuth start redirect (stub + Google path) |
| `server/src/middleware/security.test.ts` | Security headers, CORS |
| `server/src/security/audit.test.ts` | Admin access audit payload |

## Integration tests (implemented)

| Scenario | File |
|----------|------|
| Register + session cookie | `auth.integration.test.ts` |
| Duplicate email 409 | `auth.integration.test.ts` |
| Login valid / invalid credentials | `auth.integration.test.ts` |
| GET `/me` 401/200 | `auth.integration.test.ts` |
| Tenant spoof ignored on context-check | `auth.integration.test.ts` |
| OPS_ADMIN spans all tenants | `auth.integration.test.ts` |
| Consent upsert + unsubscribe + rate limits | `auth.integration.test.ts` |
| CUSTOMER blocked from admin-check (403) | `auth.integration.test.ts` |
| OPS_ADMIN allowed on admin-check | `auth.integration.test.ts` |
| Google OAuth stub callback + session | `auth.integration.test.ts` |
| Email verification token link | `auth.integration.test.ts` |

## Integration tests (pending)

- [ ] LinkedIn OAuth live callback (token exchange + profile fetch)
- [ ] Malformed session cookie rejected with standard error contract
- [ ] `PUT /profile/preferences` saves `currency_preference` (FR-178 hook)
- [ ] Learner JWT rejected on `GET /v1/admin/*` routes (403) — FR-180
- [ ] Unauthenticated rejected on `GET /v1/admin/*` (401)
- [ ] Admin funnel/analytics endpoints require `OPS_ADMIN` or equivalent
- [ ] Customer shell routes never mount admin nav links (FE e2e)
- [ ] Password reset flow (if in Sprint 1 scope)
- [ ] Session expiry / logout clears cart merge token safely

## Manual / E2E scenarios

1. Register → verify email → login → start diagnosis with consent gate.
2. Login page: Google + LinkedIn buttons; error states on OAuth failure.
3. Learner attempts direct URL to admin command center → redirect or 403.
4. Admin logs in → command center loads; learner token cannot access analytics API.
5. Checkout redirect to login preserves guest cart for merge (FR-165/166 + FR-151).

## Commands

```powershell
cd C:\AgileForum\mybmadproj\server
npm run test -- src/auth src/middleware/security.test.ts src/security
npm run test:integration -- src/auth.integration.test.ts
```
