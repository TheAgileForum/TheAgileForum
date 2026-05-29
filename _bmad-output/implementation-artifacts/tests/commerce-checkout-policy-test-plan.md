# Commerce and Checkout Policy QA Plan

## Scope

This plan defines the next QA slice for commerce and checkout policy behavior once commerce routes are available in `server/src/routes`.

Target PRD requirements:
- `FR-85` exam monetization policy
- `FR-86` paid access enforcement for mock/practice exams
- `FR-87` explicit free vs paid labeling contract
- `FR-151` checkout auth gate
- `FR-152` org payment/reimbursement option for eligible SAFe carts
- `FR-153` org checkout detail capture contract
- `FR-157` schedule-required add-to-cart behavior

## Current Codebase Readiness

- Current routes include auth, health, and stripe webhook only.
- Commerce/cart/checkout endpoints are not present yet.
- Action: keep this plan test-ready and implement tests immediately when routes merge.

## Test Matrix (API First)

### 1) Schedule-bound add-to-cart enforcement (`FR-157`)

- `POST /api/v1/cart/items` with schedule-bound offering and no `scheduleId` -> `400` with stable policy error code.
- Same request with valid `scheduleId` -> `201/200` and response payload includes persisted `scheduleId`.
- Non schedule-bound offering without schedule -> success path (no false-positive block).

### 2) Exam monetization policy (`FR-85`, `FR-86`, `FR-87`)

- Free skill assessment exam access -> `200` without payment requirement.
- Paid mock/practice exam access without purchase -> `402/403` policy block with stable error code.
- Exam detail/listing payload contains explicit access label values:
  - `FREE_SKILL_ASSESSMENT`
  - `PAID_CERTIFICATION_MOCK`

### 3) Checkout auth gate (`FR-151`)

- Anonymous `POST /api/v1/checkout/start` -> `401/403` auth-gate response.
- Authenticated user with valid cart -> checkout start success response.
- Auth then checkout resume flow preserves cart context identifiers.

### 4) Org reimbursement checkout variant (`FR-152`, `FR-153`)

- Eligible SAFe cart -> checkout response exposes `organizationPaymentAvailable=true`.
- Non-eligible cart -> org payment path not exposed.
- Org payment submit with required fields missing -> `400 VALIDATION_ERROR`.
- Org payment submit with full fields -> accepted status and ops routing reference returned.

## Edge Cases (Must Include)

- Duplicate add-to-cart retries are idempotent (no duplicate cart lines for same offering+schedule tuple).
- Invalid enum values for exam type/channel -> validation errors, not server errors.
- Mixed cart (eligible + non-eligible) follows explicit business rule for org payment visibility.
- Rate limit and auth middleware do not mask business-policy error responses.

## Suggested Test Files

- `server/src/commerce/cart-policy.integration.test.ts`
- `server/src/commerce/exam-access-policy.integration.test.ts`
- `server/src/commerce/checkout-auth-policy.integration.test.ts`
- `server/src/commerce/org-payment-policy.integration.test.ts`

## Execution Order

1. Add contract tests for payload validation and policy error codes.
2. Add integration tests for happy paths + blocking paths.
3. Run `npm run test` and fix failures immediately.
4. Extend summary in `tests/test-summary.md` with pass counts and coverage.
