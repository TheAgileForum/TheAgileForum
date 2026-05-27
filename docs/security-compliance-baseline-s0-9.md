# Security and Compliance Baseline Runbook (S0.9)

## Scope

Baseline controls implemented for Sprint 1 readiness:

- request body validation standard
- secure error response shape
- rate-limiting for sensitive routes
- resume upload policy validators
- consent/unsubscribe enforcement hooks
- security headers and CORS policy
- privileged action audit logging

## Technical Controls

### Validation and error handling

- `server/src/middleware/validation.ts`
- `server/src/middleware/error-handler.ts`

Request bodies are validated using Zod and return normalized `VALIDATION_ERROR` payloads.

### Rate limiting

- `server/src/middleware/rate-limit.ts`

Applied on:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/consent`
- `POST /api/v1/auth/unsubscribe`
- `POST /api/v1/integrations/stripe/webhook`

### Security headers and CORS

- `server/src/middleware/security.ts`

Headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

CORS is allowlist-driven via `CORS_ALLOWED_ORIGINS`.

### Upload policy

- `server/src/security/upload-policy.ts`

Resume upload baseline:

- allowed mime: PDF, DOC, DOCX
- max size from `RESUME_UPLOAD_MAX_MB`
- scan hook to be integrated at storage ingestion layer in Sprint 1

### Consent / unsubscribe enforcement

- `POST /api/v1/auth/unsubscribe` stores opt-out as `consent_events` records
- source format: `unsubscribe:<channel>`

### Privileged action audit coverage

- `server/src/security/audit.ts`
- admin-check route logs `privileged_action` events with actor and request context

## Compliance Mapping (PRD / NFR alignment)

- **Data protection baseline**: cookie/session hardening + CORS allowlist + upload restrictions
- **Auditability**: privileged action logs with actor identity and requestId correlation
- **Consent enforceability**: consent + unsubscribe persisted in canonical consent table
- **Abuse protection**: per-route rate limiting on sensitive endpoints

## Checklist Result

- High-severity open findings: **0** (baseline scope)
- Medium-severity follow-ups:
  - integrate malware scanning on resume upload pipeline
  - move rate-limit storage to Redis for horizontally scaled deployments
