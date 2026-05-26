---

## stepsCompleted: [1, 2, 3, 4]

workflowType: epics-and-stories
status: complete
completedAt: '2026-04-25'
inputDocuments:

- '{project-root}/_bmad-output/planning-artifacts/prd.md'
- '{project-root}/_bmad-output/planning-artifacts/architecture.md'
- '{project-root}/_bmad-output/planning-artifacts/ux-design-specification.md'

# mybmadproj - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for **mybmadproj**, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: A user can authenticate to the platform within their assigned tenant context.
- FR2: A user can access only data and actions permitted by their role.
- FR3: An Ops Admin can operate across tenants for monitoring and configuration without exposing tenant data inappropriately.
- FR4: A Restaurant Manager can operate only within their restaurant group tenant.
- FR5: A Support Agent can access incident and order investigation views needed to resolve issues within authorized tenants.
- FR6: The platform can record an audit trail for privileged actions (for example: overrides, reroutes, policy changes, inventory corrections).
- FR7: A Customer can browse a menu that reflects current item availability for their selected restaurant context.
- FR8: A Customer can add items to a cart and review the cart before checkout.
- FR9: A Customer can remove or adjust cart items before placing an order.
- FR10: The platform can validate cart items against current inventory before order confirmation.
- FR11: A Customer can be prevented from confirming an order when inventory conflicts exist until resolved through fallback or cart changes.
- FR12: A Restaurant Manager can update inventory quantities and item availability for their restaurant.
- FR13: The platform can reflect inventory updates in customer-facing availability signals.
- FR14: A Customer can place an order after successful pre-confirmation validation.
- FR15: A Customer can receive an order confirmation with an order identifier and fulfillment status entry point.
- FR16: The platform can operate without real payment processing in the demo while still completing an order lifecycle.
- FR17: The platform can detect inventory disruption during checkout before the order is confirmed.
- FR18: The platform can propose a substitution option when a selected item becomes unavailable.
- FR19: The platform can propose rerouting fulfillment to an alternate restaurant when substitution is insufficient or unavailable.
- FR20: A Customer can accept or reject a proposed substitution or reroute before the order proceeds.
- FR21: When automation confidence is low, the platform can require explicit Customer confirmation or route the decision to Ops/Admin approval.
- FR22: An Ops Admin can approve or reject a pending automated decision when human oversight is required.
- FR23: A Customer can view order status progression from placement through fulfillment milestones.
- FR24: A Customer can view an ETA that updates when fulfillment conditions change.
- FR25: The platform can generate customer-facing communications for disruption events (for example: substitution offers, delays, compensations) using demo-safe delivery mechanisms.
- FR26: A Restaurant Manager can view incoming orders for their restaurant.
- FR27: A Restaurant Manager can accept or reject an order based on operational constraints.
- FR28: A Restaurant Manager can identify orders that were rerouted or created through fallback orchestration.
- FR29: A Delivery Partner can view assigned deliveries relevant to them.
- FR30: A Delivery Partner can update delivery milestone statuses to reflect progress.
- FR31: An Ops Admin can monitor order flow health signals across restaurants (for example: delays, inventory mismatch flags, elevated fallback rates).
- FR32: An Ops Admin can monitor inventory risk signals across restaurants (for example: low stock, frequent stockouts).
- FR33: An Ops Admin can configure operational policies that constrain automated fallback behavior (for example: eligibility rules, priority rules).
- FR34: An Ops Admin can override an automated fallback outcome when required.
- FR35: An Ops Admin can reassign fulfillment responsibility between restaurants when supported by the demo workflow.
- FR36: A Support Agent can view incident-oriented context for a disrupted order (root cause category, impacted entities, recommended recovery path).
- FR37: A Support Agent can trigger proactive customer communication for a disrupted order using demo-safe delivery mechanisms.
- FR38: A Support Agent can execute approved recovery actions that change fulfillment routing or restart a decision workflow when authorized.
- FR39: An Ops Admin or Support Agent can view a structured explanation of why an automated decision was proposed (sufficient for demo trust and auditing).
- FR40: The platform can synchronize inventory state via a pluggable integration boundary (demo may use simulated sources).
- FR41: The platform can compute ETA adjustments via a pluggable integration boundary (demo may use simulated routing inputs).
- FR42: The platform can dispatch notifications via a pluggable integration boundary (demo may use manual or simulated dispatch).
- FR43: A Customer can acknowledge a consent notice for operational communications and data processing required for the demo.
- FR44: The platform can support a minimal data retention posture appropriate for demo datasets.

### NonFunctional Requirements

- **NFR-P1 (Ordering throughput):** A representative customer can complete the browse-to-order confirmation path in under 2 minutes under demo load.
- **NFR-P2 (Inventory validation latency):** Inventory validation for a typical cart completes in under 2 seconds under demo load.
- **NFR-P3 (Fallback decision latency):** Automated fallback proposals (substitution or reroute path) are produced in under 5 seconds after disruption detection under demo load.
- **NFR-P4 (ETA refresh responsiveness):** When fulfillment conditions change in the demo scenarios, customer-visible ETA/status updates reflect the change within the same session without requiring a full reload (exact mechanism is implementation-flexible).
- **NFR-S1 (Tenant isolation):** Cross-tenant data access is prevented for all roles except explicitly authorized cross-tenant operational views, and any cross-tenant action is auditable.
- **NFR-S2 (Least privilege):** Role permissions are enforced server-side for all privileged capabilities (inventory changes, approvals, overrides, reroutes, policy edits).
- **NFR-S3 (Auditability):** Audit logs capture who performed privileged actions, what changed, and which order/incident context was affected.
- **NFR-S4 (Demo data protection):** Sensitive demo data is protected at rest and in transit using standard transport encryption for web traffic and reasonable storage protection for the chosen demo datastore.
- **NFR-S5 (Consent):** Customer consent acknowledgment is stored in a way that supports demo review (who consented, when).
- **NFR-I1 (Mock determinism):** Mock inventory, ETA, and notification integrations support repeatable demo outcomes for the primary success and edge-case scenarios.
- **NFR-I2 (Adapter replaceability):** Integration boundaries can be swapped from mocks to real providers without changing core business workflows (ordering, validation, fallback orchestration).
- **NFR-I3 (Failure behavior):** When a mock integration fails, the system fails safely with operator-visible signals (no silent order corruption).

### Additional Requirements

*From Architecture — technical and structural constraints for implementation.*

- **Starter / repo layout:** Scaffold **Vite** `react-ts` client and **Express + TypeScript** server per architecture doc; optional `docker-compose` for PostgreSQL.
- **Data:** **PostgreSQL** system of record; **Prisma** schema-first migrations; Zod at API boundaries; UUIDs in public API JSON; DB columns snake_case, API JSON camelCase.
- **Auth:** Passwords hashed (bcrypt); **signed JWT in httpOnly cookie** (or documented alternative: DB session) — finalize in first auth story; never trust client-supplied `tenantId`.
- **API:** REST under `/api/v1`; structured errors `{ error: { code, message, details? } }` with central mapping; no Prisma in route handlers.
- **Security middleware:** Request id, auth, tenant context, RBAC, error handler; audit service for privileged actions.
- **Adapters only:** Inventory, ETA, and notification behavior implemented only under `server/src/adapters/` (mock implementations first); services depend on interfaces (NFR-I2).
- **Domain events:** Stable event type constants (e.g. `Order.FallbackProposed`); payloads include `tenantId`, `actorId`, `orderId`, `occurredAt`, `payloadVersion`; timeline/explainability from `OrderEvent` + audit.
- **Frontend:** **React Router** route groups (customer / restaurant / ops); **TanStack Query** with keys including `tenantId` for scoped data; MUI + MUI X DataGrid per UX.
- **Observability:** Structured JSON logs with `requestId`, `tenantId`, `userId`; no PII in info logs.
- **Implementation sequence (architecture handoff):** Env + Prisma + health + CORS/proxy → auth + tenant middleware → core domains (menu/cart/inventory/order/validation/fallback) → mock adapters → React shells + themes → audit/explainability DTOs.

### UX Design Requirements

*Actionable UX work items derived from the UX specification (for story-level acceptance criteria).*

- **UX-DR1:** Implement **MUI + Emotion** with **two themes**: light for customer routes, dark for internal (restaurant/ops/support), sharing spacing/shape/semantic tokens per spec.
- **UX-DR2:** Implement **customer app shell** (simple header, cart access) vs `**WorkspaceShell`** for internal apps: persistent side nav, **tenant/restaurant scope** in app bar on every internal detail view.
- **UX-DR3:** Implement `**ChangeSummary`**: before/after columns, delta chips (ETA, price, promo), full (Drawer/Dialog) and compact variants, `aria-live="polite"` on updates, focus trap, explicit CTA labels (“Accept substitution,” not “OK”).
- **UX-DR4:** Implement `**DecisionRationale`**: collapsible (`Accordion`/`Collapse`), customer plain-language vs internal structured + policy link; expand control is a button with `aria-expanded`; customer view may redact internal signals.
- **UX-DR5:** Implement `**OrderTimeline`**: sparse milestones + large targets for customer; dense timeline with automation vs human override for internal; consistent event vocabulary across surfaces.
- **UX-DR6:** Implement **recovery sheet** per journey spec: block confirm until resolved; primary forward + secondary escape (edit cart, cancel); **bottom Drawer ~90vh on mobile**; `DialogTitle` + `aria-modal` where modal used.
- **UX-DR7:** Apply **button hierarchy**: one primary per surface; destructive/error styling without overpowering primary unless destructive confirm step; full-width primary on customer mobile (min ~44px height).
- **UX-DR8:** Apply **feedback pattern**: checkout/pre-confirm failures use **inline `Alert` + ChangeSummary**, not toast-only; **Snackbar** only for non-blocking confirmations.
- **UX-DR9:** Implement **MUI X DataGrid** for ops/restaurant queues: **compact density**, keyboard-accessible headers/sort, readable in dark theme.
- **UX-DR10:** Define **single semantic mapping module** for order/incident **Chip** colors and icons (status + severity); reuse everywhere.
- **UX-DR11:** Meet **WCAG 2.2 AA** targets for text/controls on primary actions and warning/error in fallback flows; visible focus rings on both themes; keyboard-complete checkout/recovery and one representative DataGrid screen.
- **UX-DR12:** Implement **responsive behavior** per breakpoints table: customer mobile-first single column; internal `md+` persistent nav, temporary drawer below; sticky checkout/cart where specified.
- **UX-DR13:** Implement **form pattern** for overrides/rejects: **reason required** before enabling primary; `helperText` / `aria-describedby` for errors; read-only detail as Typography+chips not disabled inputs.
- **UX-DR14:** Implement **modal/overlay rules**: focus heading first when appropriate; escape/backdrop close only when not dirty; return focus on close.
- **UX-DR15:** Implement **empty/loading/error** for lists: DataGrid skeleton rows; **Alert + retry** on fetch failure; last-updated hint on internal lists where useful.
- **UX-DR16:** Implement **internal search/filter toolbar**: debounced search, filter chips, optional clear-all; announce result count where practical.
- **UX-DR17:** Respect `**prefers-reduced-motion`**; no motion as sole state indicator.

### FR Coverage Map


| FR        | Epic   | Notes                                        |
| --------- | ------ | -------------------------------------------- |
| FR1       | Epic 1 | Auth within tenant context                   |
| FR2       | Epic 1 | Server-side RBAC                             |
| FR3       | Epic 1 | Ops cross-tenant monitoring (safe)           |
| FR4       | Epic 1 | Restaurant manager tenant scope              |
| FR5       | Epic 1 | Support investigation scope                  |
| FR6       | Epic 1 | Audit trail                                  |
| FR7       | Epic 2 | Menu reflects availability                   |
| FR8       | Epic 2 | Cart add/review                              |
| FR9       | Epic 2 | Cart adjust/remove                           |
| FR10      | Epic 3 | Pre-confirm validation                       |
| FR11      | Epic 3 | Block confirm until resolved                 |
| FR12      | Epic 2 | Manager inventory updates                    |
| FR13      | Epic 2 | Availability signals to customer             |
| FR14      | Epic 3 | Place order after validation                 |
| FR15      | Epic 3 | Order confirmation                           |
| FR16      | Epic 3 | No real payments (demo)                      |
| FR17–FR22 | Epic 4 | Disruption, proposals, consent, ops approval |
| FR39      | Epic 4 | Structured explainability (operator)         |
| FR41      | Epic 4 | ETA adapter used in proposals/updates        |
| FR23      | Epic 7 | Order status progression                     |
| FR24      | Epic 7 | ETA presentation                             |
| FR25      | Epic 7 | Customer-facing disruption comms             |
| FR42      | Epic 7 | Notification adapter                         |
| FR26–FR28 | Epic 5 | Restaurant queue & reroute visibility        |
| FR29–FR30 | Epic 6 | Delivery partner demo scope                  |
| FR31–FR35 | Epic 8 | Ops signals, policies, overrides             |
| FR36–FR38 | Epic 9 | Support incident & recovery                  |
| FR40      | Epic 2 | Inventory adapter boundary                   |
| FR43      | Epic 1 | Consent acknowledgment                       |
| FR44      | Epic 1 | Minimal retention posture                    |


**NFRs:** Addressed across epics — **NFR-S, NFR-I** especially Epic 1 (security/adapters); **NFR-P1–P3** Epic 3–4 (latency paths); **NFR-P4** Epic 7; mock determinism **NFR-I1** validated in adapter stories.

## Epic List

### Epic 1: Secure access, tenancy, and governance

Users and operators can sign in with correct **tenant context**, **role permissions** are enforced on the server, **cross-tenant ops** works without inappropriate data exposure, and **consent/retention** meet the demo baseline. **FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR43, FR44.

### Epic 2: Trustworthy catalog, cart, and inventory signals

Customers can **browse** and **manage a cart** against **real inventory signals**; restaurant managers can **update stock**; inventory flows through a **pluggable adapter**. **FRs covered:** FR7, FR8, FR9, FR12, FR13, FR40.

### Epic 3: Validated checkout and order confirmation

Customers complete **pre-confirm validation**, cannot confirm on conflict without resolution, and receive **order confirmation** without real payments. **FRs covered:** FR10, FR11, FR14, FR15, FR16.

### Epic 4: Checkout disruption and governed fallback

When stock or fulfillment breaks at checkout, the system **detects**, **proposes** substitution or reroute, supports **customer consent** or **ops approval**, and exposes **structured rationale** and **ETA** via adapters. **FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR39, FR41.

### Epic 5: Restaurant fulfillment desk

Managers see **incoming orders**, **accept/reject** with accountability, and **spot rerouted/fallback** orders. **FRs covered:** FR26, FR27, FR28.

### Epic 6: Delivery partner tasking (demo)

Partners see **assigned deliveries** and post **milestone** updates. **FRs covered:** FR29, FR30.

### Epic 7: Customer visibility, ETA, and notifications

Customers track **status**, see **ETA** updates in-session, and receive **demo-safe communications** through the notification boundary. **FRs covered:** FR23, FR24, FR25, FR42.

### Epic 8: Ops monitoring, policies, and intervention

Ops admins monitor **order and inventory signals**, **configure policies**, **override** automation, and **reassign** fulfillment when supported. **FRs covered:** FR31, FR32, FR33, FR34, FR35.

### Epic 9: Support incident response

Support agents view **incident context**, **trigger communications**, and run **authorized recovery** actions. **FRs covered:** FR36, FR37, FR38.

---

## Epic 1: Secure access, tenancy, and governance

Operators and customers can use the platform with **correct tenant isolation**, **role enforcement**, **auditability**, and **demo-appropriate consent and retention**.

### Story 1.0: Initialize client and server from architecture starters

As a **member of the delivery team**,
I want **the Vite React client and Express TypeScript API scaffolded per `architecture.md`**,
So that **all subsequent stories run on a consistent foundation** (Additional Requirements: starter commands).

**Acceptance Criteria:**

**Given** an empty or designated repo folder
**When** the team runs the documented `npm create vite@latest` and server `npm init` / TypeScript setup
**Then** `client/` and `server/` start in dev with health check route and CORS or Vite proxy configured.

**Given** the scaffold exists
**When** env examples are copied
**Then** `server/.env.example` and `client/.env.example` document required variables (no secrets committed).

### Story 1.1: Sign in with tenant context

As a **user** (any role),
I want **to authenticate and have my tenant membership established on the session**,
So that **I only access data for organizations I belong to**.

**Acceptance Criteria:**

**Given** valid demo user credentials for a tenant
**When** I submit login on the client
**Then** the API establishes an authenticated session (e.g. httpOnly cookie + server-side session or JWT per architecture) including `userId` and `tenantId` (or tenant list for ops)
**And** subsequent API calls resolve tenant context from the session, never from an unrestricted client body field (FR1, NFR-S2).

**Given** invalid credentials
**When** I attempt login
**Then** I receive a structured error with stable `code` and no tenant context is set.

### Story 1.2: Role-based access enforcement on APIs

As a **user**,
I want **the server to reject actions outside my role**,
So that **privilege escalation is impossible via crafted requests** (FR2).

**Acceptance Criteria:**

**Given** a user with role `CUSTOMER`
**When** they call an endpoint reserved for `RESTAURANT_MANAGER` or `OPS_ADMIN`
**Then** the API returns 403 with a stable error code (NFR-S2).

**Given** middleware order per architecture (request id → auth → tenant → RBAC)
**When** any protected route runs
**Then** RBAC runs before the handler and is covered by at least one automated test per role class.

### Story 1.3: Ops cross-tenant monitoring without inappropriate exposure

As an **Ops Admin**,
I want **aggregated cross-tenant views where required**,
So that **I can operate the platform without seeing raw cross-tenant PII beyond what the workflow needs** (FR3, NFR-S1).

**Acceptance Criteria:**

**Given** an authenticated Ops Admin
**When** they use a designated cross-tenant API (e.g. health/signals list)
**Then** responses include only fields approved for that surface and omit sensitive fields from other tenants’ private contexts.

**Given** an authenticated non-ops user
**When** they attempt the same cross-tenant endpoints
**Then** they receive 403 and the attempt is audit-eligible.

### Story 1.4: Restaurant and support scoped workspaces

As a **Restaurant Manager** or **Support Agent**,
I want **APIs scoped to restaurants/tenants I am authorized for**,
So that **I cannot mutate or read another group’s operational data** (FR4, FR5).

**Acceptance Criteria:**

**Given** a Restaurant Manager for tenant A
**When** they request inventory or orders for tenant B
**Then** the API returns 403 or empty per security policy (NFR-S1).

**Given** a Support Agent with explicit tenant grants (or global read per product rules)
**When** they open an incident context endpoint
**Then** they receive data only for authorized tenants.

### Story 1.5: Audit privileged actions

As the **platform**,
I want **an append-only audit record for sensitive operations**,
So that **overrides and policy changes are traceable** (FR6, NFR-S3).

**Acceptance Criteria:**

**Given** a privileged action (e.g. policy save stub, inventory correction stub)
**When** the action completes successfully
**Then** an `AuditLog` row exists with actor, tenant scope, action type, target ids, and timestamp.

**Given** a normal customer browse call
**When** it completes
**Then** no audit row is required (only privileged paths).

### Story 1.6: Consent acknowledgment and minimal retention posture

As a **Customer**,
I want **to acknowledge consent for demo communications and processing**,
So that **the demo meets the governance baseline** (FR43, FR44, NFR-S5).

**Acceptance Criteria:**

**Given** a first-time customer session path
**When** they submit the consent acknowledgment
**Then** the system stores who consented and when retrievable for demo review.

**Given** retention configuration in env
**When** operators query retention posture documentation or config endpoint
**Then** minimal retention rules are described for demo datasets (implementation may be config + documentation in MVP).

---

## Epic 2: Trustworthy catalog, cart, and inventory signals

Customers experience **accurate availability**; managers maintain **inventory** through a **clean adapter boundary**.

### Story 2.1: Inventory adapter interface and deterministic mock

As the **platform**,
I want **inventory reads and writes to go through an `InventoryAdapter` with a mock implementation**,
So that **demos are repeatable and real providers can be swapped later** (FR40, NFR-I1, NFR-I2, NFR-I3).

**Acceptance Criteria:**

**Given** the mock adapter configured for demo scenarios
**When** services request availability for SKUs
**Then** results are deterministic for scripted demos.

**Given** the mock adapter forced to error
**When** a service calls it
**Then** the error surfaces as a safe, operator-visible failure without corrupting orders (NFR-I3).

### Story 2.2: Restaurant manager updates inventory

As a **Restaurant Manager**,
I want **to update quantities and item availability**,
So that **customers see honest stock** (FR12).

**Acceptance Criteria:**

**Given** I manage restaurant R in tenant T
**When** I PATCH availability for a menu item
**Then** persisted inventory reflects the change and is scoped to R (FR4, NFR-S2).

**Given** I attempt to update another restaurant’s inventory
**Then** I receive 403.

### Story 2.3: Customer menu reflects live availability

As a **Customer**,
I want **to browse a menu that shows what I can actually order**,
So that **I am not misled before the cart** (FR7, FR13, NFR-P2).

**Acceptance Criteria:**

**Given** inventory marks an item unavailable
**When** I load the menu
**Then** that item is visibly unavailable or hidden per product rules (FR13).

**Given** inventory validation is invoked for displayed items
**When** measured under demo load
**Then** menu fetch + availability projection meets NFR-P2 targets for typical cart sizes (document test approach).

### Story 2.4: Cart — add, review, adjust

As a **Customer**,
I want **to add items, review my cart, and change quantities or remove lines**,
So that **I can build an order confidently** (FR8, FR9).

**Acceptance Criteria:**

**Given** an empty cart session
**When** I add available items
**Then** cart persists server-side or client+server per design with correct totals.

**Given** items in cart
**When** I change quantity or remove a line
**Then** cart state updates and validates availability on checkout preparation (FR9).

**And** customer UI uses **light MUI theme**, mobile-first layout, cart entry visible (UX-DR1, UX-DR7, UX-DR12).

---

## Epic 3: Validated checkout and order confirmation

Customers **cannot confirm** invalid carts; they receive a **confirmed order** without payment processing.

### Story 3.1: Pre-confirmation cart validation API

As a **Customer**,
I want **the system to validate my cart against inventory before I confirm**,
So that **I do not hit surprise stockouts at the last tap** (FR10, NFR-P2).

**Acceptance Criteria:**

**Given** a cart with all items available
**When** I request pre-confirm validation
**Then** the API returns success within NFR-P2 and lists validated lines.

**Given** a cart with a conflict
**When** I request validation
**Then** the API returns a structured conflict descriptor usable by Epic 4 (FR11 precursor).

### Story 3.2: Block order creation when conflicts are unresolved

As a **Customer**,
I want **confirmation blocked until I resolve inventory conflicts**,
So that **I am not committed to impossible orders** (FR11).

**Acceptance Criteria:**

**Given** validation reports unresolved conflicts
**When** I attempt `POST` confirm order
**Then** the API rejects with 409 and stable `code` (e.g. `INVENTORY_CONFLICT`).

**Given** conflicts cleared (cart edit or accepted fallback from Epic 4)
**When** I confirm
**Then** confirmation proceeds (integration stub ok).

### Story 3.3: Place order and show confirmation (no payment)

As a **Customer**,
I want **to place an order after successful validation and see an order id**,
So that **I trust the order exists without paying in the demo** (FR14, FR15, FR16, NFR-P1).

**Acceptance Criteria:**

**Given** successful validation
**When** I confirm the order
**Then** an order record is created with id, tenant, restaurant context, and initial status (FR14–FR16).

**Given** confirmation succeeds
**When** I view the confirmation screen
**Then** I see order id and a link/entry to tracking (FR15).

---

## Epic 4: Checkout disruption and governed fallback

The **differentiator**: disruption is handled **before** confirmation with **transparent proposals**, **consent**, and **ops oversight**.

### Story 4.1: Detect inventory disruption at checkout

As the **platform**,
I want **to detect stock/fulfillment disruption during checkout before confirm**,
So that **we can recover instead of failing post-commit** (FR17).

**Acceptance Criteria:**

**Given** a cart that becomes invalid between validation and confirm (simulated)
**When** confirm is attempted
**Then** disruption is detected before order persistence and returned as structured response (FR17).

### Story 4.2: Propose substitution path

As a **Customer**,
I want **a clear substitution offer when an item is unavailable**,
So that **I can continue with an understandable alternative** (FR18, NFR-P3).

**Acceptance Criteria:**

**Given** a substitution-eligible disruption
**When** the fallback service runs
**Then** a proposal DTO returns within NFR-P3 with before/after item summary.

**Given** the proposal
**When** rendered in UI
**Then** **ChangeSummary** shows before/after and delta chips (UX-DR3, UX-DR6, UX-DR8).

### Story 4.3: Propose reroute to alternate restaurant

As a **Customer**,
I want **a reroute proposal when substitution is insufficient**,
So that **I can still complete a meal order with transparent restaurant change** (FR19).

**Acceptance Criteria:**

**Given** reroute is the best path per policy stub
**When** fallback runs
**Then** proposal includes previous vs proposed restaurant context and ETA delta fields (FR19).

**And** **DecisionRationale** can expand policy-safe bullets (UX-DR4).

### Story 4.4: Customer accept or reject proposal

As a **Customer**,
I want **to accept or reject a proposal before the order proceeds**,
So that **I stay in control** (FR20).

**Acceptance Criteria:**

**Given** an open proposal
**When** I reject
**Then** I return to cart/edit path without order creation (FR20).

**Given** I accept
**When** confirm re-validation passes
**Then** order creation proceeds (FR20).

**And** recovery UI meets **WCAG 2.2 AA** for focus, labels, and touch targets on primary/secondary actions (UX-DR11).

### Story 4.5: Low-confidence automation and ops approval

As the **platform**,
I want **to require stronger confirmation or ops approval when confidence is low**,
So that **we do not silently automate risky decisions** (FR21, FR22).

**Acceptance Criteria:**

**Given** a low-confidence flag on a proposal
**When** the customer flow runs
**Then** either expanded confirmation is required or status moves to **pending ops approval** per rules (FR21).

**Given** pending approval
**When** an Ops Admin approves or rejects
**Then** audit entries are written and customer/session can proceed or cancel (FR22, FR6).

### Story 4.6: Structured explainability for operators

As an **Ops Admin or Support Agent**,
I want **to read a structured explanation of why automation proposed a path**,
So that **I can trust and audit decisions** (FR39).

**Acceptance Criteria:**

**Given** a completed or pending proposal
**When** an authorized operator opens the decision detail
**Then** they see structured fields (inputs, rule ids, confidence, outcome) not raw LLM dumps (FR39).

### Story 4.7: ETA adjustments via adapter in fallback flow

As the **platform**,
I want **ETA recalculation to flow through the ETA adapter**,
So that **demo routing can be swapped later** (FR41, NFR-I2).

**Acceptance Criteria:**

**Given** a substitution or reroute proposal
**When** ETA is computed
**Then** the service calls `EtaAdapter` (mock) and returns ETA fields in the proposal DTO.

**Given** mock ETA failure
**Then** failure is visible and safe (NFR-I3).

---

## Epic 5: Restaurant fulfillment desk

Managers run the **line**: queue, **accept/reject**, **reroute visibility**.

### Story 5.1: Incoming orders queue

As a **Restaurant Manager**,
I want **to see incoming orders for my restaurant**,
So that **I can plan fulfillment** (FR26).

**Acceptance Criteria:**

**Given** new orders for restaurant R
**When** I open the queue
**Then** I see scannable rows with status and time (FR26).

**And** internal UI uses **dark theme**, **DataGrid** compact density, optional filters (UX-DR1, UX-DR9, UX-DR15, UX-DR16).

### Story 5.2: Accept or reject orders with reason

As a **Restaurant Manager**,
I want **to accept or reject with a reason**,
So that **operations stay accountable** (FR27, UX-DR13).

**Acceptance Criteria:**

**Given** a pending order
**When** I reject without a reason
**Then** primary action stays disabled (UX-DR13).

**Given** I accept
**When** I confirm
**Then** order status updates and audit/event records the transition (FR27, FR6).

### Story 5.3: Highlight rerouted and fallback-sourced orders

As a **Restaurant Manager**,
I want **to immediately see orders created by reroute/fallback**,
So that **I am not surprised by demand source** (FR28, UX-DR10).

**Acceptance Criteria:**

**Given** an order created via fallback orchestration
**When** it appears in the queue
**Then** it shows a distinct chip/badge using shared semantic mapping (FR28, UX-DR10).

---

## Epic 6: Delivery partner tasking (demo)

Partners complete a **thin** milestone workflow.

### Story 6.1: View assigned deliveries

As a **Delivery Partner**,
I want **to see deliveries assigned to me**,
So that **I know what to fulfill** (FR29).

**Acceptance Criteria:**

**Given** assignments exist for partner P
**When** P opens their task list
**Then** they see only their assignments (NFR-S2).

### Story 6.2: Update delivery milestones

As a **Delivery Partner**,
I want **to post milestone updates**,
So that **customers see progress** (FR30, supports FR23).

**Acceptance Criteria:**

**Given** an active assignment
**When** I mark a milestone (picked up, en route, delivered — product-defined)
**Then** status persists and is visible to authorized readers (FR30).

---

## Epic 7: Customer visibility, ETA, and notifications

Customers **track** orders, see **ETA**, and get **demo notifications**.

### Story 7.1: Order status and timeline (customer)

As a **Customer**,
I want **to see my order’s milestones**,
So that **I trust fulfillment progress** (FR23, UX-DR5).

**Acceptance Criteria:**

**Given** an order for customer C
**When** C opens tracking
**Then** **OrderTimeline** shows sparse milestones with large touch targets (UX-DR5, UX-DR12).

### Story 7.2: ETA display with in-session refresh

As a **Customer**,
I want **an ETA that updates when conditions change**,
So that **I am not stuck with stale promises** (FR24, NFR-P4).

**Acceptance Criteria:**

**Given** ETA changes after fulfillment updates
**When** I am on the tracking view in the same session
**Then** ETA refreshes without full page reload (NFR-P4, implementation-flexible per PRD).

### Story 7.3: Disruption communications via notification adapter

As the **platform**,
I want **to generate customer-facing disruption messages through a pluggable notifier**,
So that **demo comms are repeatable and swappable** (FR25, FR42, NFR-I1, NFR-I2).

**Acceptance Criteria:**

**Given** a disruption event (substitution, delay stub)
**When** notification dispatch runs
**Then** `NotifyAdapter` mock records the payload and supports deterministic replay (FR42, NFR-I1).

---

## Epic 8: Ops monitoring, policies, and intervention

Ops **sees signals**, **tunes rules**, and can **override/reassign**.

### Story 8.1: Order flow health signals

As an **Ops Admin**,
I want **cross-restaurant order health indicators**,
So that **I can spot delays and fallback spikes** (FR31).

**Acceptance Criteria:**

**Given** demo seed data with incidents
**When** I open the ops dashboard
**Then** I see summarized signals (counts, flags) without leaking unauthorized tenant detail (FR31, FR3).

### Story 8.2: Inventory risk signals

As an **Ops Admin**,
I want **inventory risk indicators across restaurants**,
So that **I can preempt stockout cascades** (FR32).

**Acceptance Criteria:**

**Given** low-stock rules stubbed
**When** I view risk panel
**Then** at-risk SKUs/restaurants appear per mock data (FR32).

### Story 8.3: Configure fallback policies

As an **Ops Admin**,
I want **to configure policies that constrain automated fallback**,
So that **automation behaves predictably** (FR33, UX-DR13).

**Acceptance Criteria:**

**Given** a policy edit form
**When** I save changes
**Then** policies persist and audit entry is written (FR33, FR6).

**And** reason/confirm pattern applies for destructive policy changes if applicable (UX-DR13).

### Story 8.4: Override automated fallback outcome

As an **Ops Admin**,
I want **to override a proposed or applied fallback** when required,
So that **I can correct bad automation safely** (FR34).

**Acceptance Criteria:**

**Given** an override action
**When** I confirm with reason
**Then** audit captures before/after and order state reflects override (FR34, FR6).

### Story 8.5: Reassign fulfillment between restaurants (demo workflow)

As an **Ops Admin**,
I want **to reassign fulfillment when the demo supports it**,
So that **I can recover operations manually** (FR35).

**Acceptance Criteria:**

**Given** reassignment enabled for scenario
**When** I execute reassignment with reason
**Then** order routing updates and stakeholders see consistent status (FR35).

**And** **WorkspaceShell** shows tenant/restaurant scope on detail views (UX-DR2).

---

## Epic 9: Support incident response

Support **triages** incidents and runs **authorized recoveries**.

### Story 9.1: Incident-oriented order context

As a **Support Agent**,
I want **incident context with root-cause category and recommended path**,
So that **I can decide quickly** (FR36, FR39).

**Acceptance Criteria:**

**Given** a disrupted order
**When** I open the incident view
**Then** I see impacted entities, category, recommendation stub, and structured rationale (FR36, FR39).

### Story 9.2: Trigger proactive customer communication

As a **Support Agent**,
I want **to trigger templated customer comms for a disrupted order**,
So that **customers stay informed** (FR37, FR42).

**Acceptance Criteria:**

**Given** authorized support user
**When** they trigger comms
**Then** notifier mock receives payload and audit records action (FR37).

### Story 9.3: Execute authorized recovery actions

As a **Support Agent**,
I want **to run approved recovery actions (reroute/restart decision) when authorized**,
So that **I can close incidents** (FR38).

**Acceptance Criteria:**

**Given** authorized recovery
**When** I execute with reason
**Then** order/incident state updates per workflow and audit+events capture the change (FR38, FR6).

**And** internal **OrderTimeline** shows automation vs human override distinctly (UX-DR5).

---

### UX coverage note (UX-DR1–UX-DR17)

UX requirements are **embedded in story acceptance criteria** above (themes, shells, ChangeSummary, rationale, timeline, recovery sheet, buttons, feedback, DataGrid, chips, a11y, responsive, forms, modals, list states, search/filter, motion). No separate epic required; if gaps appear during build, add a polish story under Epic 8 or Epic 1.

---

## Final validation (workflow Step 4)

### FR coverage

- **FR1–FR44:** Each appears in the **FR Coverage Map** and is addressed by acceptance criteria in the mapped epic stories. No orphaned FRs identified.

### Architecture alignment

- **Starter:** **Story 1.0** matches the architecture handoff (Vite `react-ts` + Express/TS + env examples).
- **Incremental data model:** Stories introduce persistence as needed (auth/tenant before RBAC; inventory adapter before manager updates; order create in Epic 3) rather than “all tables in Story 1.0.”

### Story quality

- Stories use **Given/When/Then** ACs, name **FR/NFR/UX-DR** where relevant, and are scoped for a **single-agent** slice where possible.
- **Within-epic ordering:** Each story builds on earlier numbered stories in the same epic; cross-epic dependency follows epic number (Epic 2 before 3, etc.).

### Epic independence (sequential delivery)

- Epics are **user-outcome** oriented; later epics **extend** earlier ones (e.g. Epic 4 extends checkout from Epic 3) but earlier epics remain coherent slices for incremental release.

### Outstanding risks (for implementation)

- **Cross-epic integration tests** (e.g. Epic 4 → Epic 7 notifications) should be added when vertical slices meet; not every story lists E2E—acceptable for planning doc.

**Validation outcome:** **PASS** — ready for sprint planning / story picking.

---

**Workflow status:** Epics and stories document complete. Reply **[C]** to acknowledge closure (no further file changes required), or ask questions about specific stories.