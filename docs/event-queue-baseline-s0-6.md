# Event and Queue Baseline Runbook (S0.6)

## Purpose

Define canonical event and queue contracts for automation foundations in Sprint 0.

## Event Envelope Contract

Every event must include:

- `eventName`
- `source`
- `idempotencyKey`
- `payload`

Validation is enforced in `server/src/events/contracts.ts`.

## Queue Taxonomy

- `q_critical`: checkout/order/enrollment critical flows
- `q_notifications`: campaign and messaging flows
- `q_reporting`: reporting and rollup flows
- `q_ai_processing`: AI/resume processing flows

Routing logic is in `server/src/events/dispatcher.ts`.

## Retry and DLQ Policy Baseline

Each queue has a policy in `queueRetryPolicies`:

- max attempts
- base delay
- exponential multiplier

If attempts are exhausted, job status should transition to `dead_letter` (next iteration of worker processing).
Transition logic is implemented in `server/src/events/processor.ts`:

- `transitionOnJobFailure(...)`
- `calculateBackoffDelayMs(...)`

## Idempotent Publish and Dispatch

`publishEvent(...)` in `server/src/events/publisher.ts`:

1. validates envelope
2. upserts event by `idempotencyKey`
3. resolves queue
4. creates queued job
5. updates event status to `dispatched`

## Synthetic Flow Verification

Run:

```bash
cd server
npx tsx scripts/synthetic-event-flow.ts
```

Expected output includes:

- published event id
- job id
- queue assignment
- `event.status = dispatched`
- `job.status = queued`

## Replay Procedure (Baseline)

For failed events/jobs:

1. Inspect `events` + `jobs` tables by status/time window.
2. Identify retriable items (`failed`, not `dead_letter`).
3. Re-publish with same `idempotencyKey` to avoid duplicate event records.
4. Confirm new queued job exists and monitor completion.

## Contract Test Coverage

- `server/src/events/contracts.test.ts`
  - envelope schema validation
  - queue-routing correctness
  - retry policy completeness
- `server/src/events/publisher.test.ts`
  - idempotency key behavior in publisher upsert path
- `server/src/events/processor.test.ts`
  - requeue vs dead-letter transition behavior
