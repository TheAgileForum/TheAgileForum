# Auth, RBAC, and Consent Contracts (S0.5)

## Purpose

Define baseline authentication, authorization, and consent contracts so Sprint 1 features use a single secure pattern.

## Auth Contracts

## `POST /api/v1/auth/login`

- Request:
  - `email` (string, email)
  - `password` (string)
- Response `200`:
  - `user.id`
  - `user.email`
  - `user.role`
  - `user.tenantId`
  - `user.tenantIds`
- Error:
  - `400 VALIDATION_ERROR`
  - `401 INVALID_CREDENTIALS`

## `POST /api/v1/auth/logout`

- Response `204` and clears auth cookie.

## `GET /api/v1/auth/me`

- Requires authenticated cookie.
- Response `200` user session context.
- Error `401 UNAUTHENTICATED`.

## Placeholder Contracts

- `POST /api/v1/auth/register` currently returns `501 NOT_IMPLEMENTED`.
- This reserves endpoint shape for Sprint 1 implementation.

## RBAC Contracts

## Middleware

- `requireAuth`:
  - validates session cookie
  - attaches `req.auth`
- `requireRoles([...])`:
  - enforces route-level role permissions
  - returns `403 FORBIDDEN` if role not allowed

## Protected route example

- `GET /api/v1/auth/admin-check`
  - requires `OPS_ADMIN` role

## Consent Contract

## `POST /api/v1/auth/consent`

- Requires authenticated cookie.
- Request:
  - `policyVersion` (string)
  - `accepted` (boolean)
  - `source` (string; default `web`)
- Behavior:
  - upserts by `userId + policyVersion + source`
  - records tenant context where available
- Response `201`:
  - `consent.id`
  - `consent.policyVersion`
  - `consent.accepted`
  - `consent.source`
  - `consent.createdAt`

## Error Contract

All auth and consent endpoints use:

```json
{
  "error": {
    "code": "STABLE_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## S0.5 Exit Signal

S0.5 baseline is complete when:

- route-level auth + RBAC patterns are reusable
- consent persistence contract is active
- integration tests validate role-allow/deny paths and consent flow
