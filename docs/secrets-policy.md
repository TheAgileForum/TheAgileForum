# Secrets Policy (S0.2)

## Purpose

Define minimum secrets-handling rules for Agile Forum environments.

## Rules

1. Never commit real secrets to git.
2. Keep `.env` files local only.
3. Use environment secret stores in shared environments.
4. Restrict production secret access to designated operators.
5. Rotate high-risk secrets on schedule and after incident response.

## Sensitive Variables (Current Baseline)

- `DATABASE_URL`
- `JWT_SECRET`

## Operational Controls

- Use `.env.example` files for placeholders only.
- Validate required variables using `npm run env:check` before starting backend.
- Do not print secret values in logs; only print key presence/state.

## Incident Response Baseline

- If secret leakage is suspected:
  - rotate affected secrets immediately
  - invalidate sessions/tokens as needed
  - record incident and remediation actions
