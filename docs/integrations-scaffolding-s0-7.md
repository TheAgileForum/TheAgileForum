# Integrations Scaffolding Runbook (S0.7)

## Purpose

Establish provider-agnostic integration contracts with deterministic stub mode for safe MVP development.

## Adapter Contracts

Defined in `server/src/integrations/contracts.ts`:

- `StripeAdapter`
- `EmailAdapter`
- `TelegramAdapter`
- `WebinarAdapter`

## Provider Modes

- `stub` (default): deterministic local behavior, no live provider dependency
- `live`: production-path adapter stubs with timeout/retry wrapper

Configured by:

- `INTEGRATION_PROVIDER_MODE=stub|live`

Adapter factory:

- `server/src/integrations/factory.ts`

## External Call Safety

Wrapper:

- `server/src/integrations/external-call.ts`

Provides:

- timeout
- retry with backoff
- normalized success/failure result

## Stripe Webhook Skeleton

Route:

- `POST /api/v1/integrations/stripe/webhook`

Implemented in:

- `server/src/routes/stripe-webhook.routes.ts`

Behavior:

1. Verify signature via adapter
2. Parse event
3. Publish event into event/queue pipeline
4. Return `202` accepted (or error code)

## Smoke Test Coverage

- `server/src/integrations/factory.test.ts`
- `server/src/integrations/external-call.test.ts`
- `server/src/routes/stripe-webhook.routes.test.ts`

## Next Upgrade Path

- Replace live adapter placeholders with real SDK/API calls.
- Add Stripe SDK signature verification using `STRIPE_WEBHOOK_SECRET`.
- Add provider-specific observability for delivery failures and retries.
