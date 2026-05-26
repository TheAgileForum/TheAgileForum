---

## stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: architecture
lastStep: 8
status: complete
completedAt: '2026-04-25'
inputDocuments:
  - '{project-root}/_bmad-output/planning-artifacts/prd.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-design-specification.md'
project_name: mybmadproj
user_name: Dhirender
date: '2026-04-25'

# Architecture Decision Document

*This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together.*

## Project Context Analysis

### Requirements Overview

**Functional requirements**

The PRD defines **44 functional requirements (FR1–FR44)** grouped into capability areas that map cleanly to architectural boundaries:


| Area                           | FR range  | Architectural implication                                                              |
| ------------------------------ | --------- | -------------------------------------------------------------------------------------- |
| Tenant & access / RBAC / audit | FR1–FR6   | AuthN/AuthZ middleware, tenant context on every request, audit persistence             |
| Menu, cart, browsing           | FR7–FR9   | Catalog + cart services; availability projection to customer UI                        |
| Inventory-aware ordering       | FR10–FR13 | Inventory source of truth (or projection), real-time validation API, manager mutations |
| Checkout & order confirmation  | FR14–FR16 | Pre-confirm orchestration, order write model, no real payments in demo                 |
| Disruption & AI fallback       | FR17–FR22 | Decision workflow: detect → propose → consent/approval → persist outcome               |
| Ops approval path              | FR22      | Human-in-the-loop queue/state machine when confidence is low                           |
| Tracking, ETA, comms           | FR23–FR25 | Order read model + milestone updates; mock notification dispatcher                     |
| Restaurant fulfillment         | FR26–FR28 | Manager queue; explicit reroute/fallback flags in order views                          |
| Delivery partner (demo)        | FR29–FR30 | Narrow task/milestone API                                                              |
| Ops monitoring & rules         | FR31–FR35 | Signals aggregation, policy store, override/reassign with audit                        |
| Support & recovery             | FR36–FR38 | Incident-oriented read model + authorized actions                                      |
| Explainability                 | FR39      | Structured decision/rationale payload (not raw logs)                                   |
| Integration boundaries         | FR40–FR42 | Pluggable adapters (inventory, ETA, notifications)                                     |
| Governance / privacy (demo)    | FR43–FR44 | Consent capture, minimal retention posture                                             |


**Non-functional requirements**

- **Performance (NFR-P1–P4):** End-to-end ordering speed, **<2s** inventory validation, **<5s** fallback proposal, session-visible ETA/status updates—implies a **responsive API**, **async-friendly** fallback path with clear UX loading states, and avoidance of blocking chains on mock I/O.
- **Security (NFR-S1–S5):** **Tenant isolation** and **server-side RBAC** are non-negotiable; **audit** for privileged actions; transport + reasonable **at-rest** protection for demo data; **consent** stored for review.
- **Integration (NFR-I1–I3):** **Deterministic mocks**, **adapter replaceability**, **safe failure** (operator-visible, no silent corruption).

**Scale and complexity**

- **Primary domain:** **Full-stack web** — React customer + internal SPAs (or route-grouped app) per UX; **Node/Express** (or equivalent) API tier per MVP intent; optional separate **worker** later for heavy jobs (demo may stay synchronous).
- **Complexity level:** **High** — multi-tenant SaaS, five role types, orchestrated fallback with human approval, cross-cutting audit and explainability.
- **Estimated major architectural components (initial):** identity/session + **tenant context**; **catalog/menu**; **cart**; **inventory**; **order** (command/query); **fallback/decision** orchestration; **policy** (ops rules); **integrations** (3 adapters + mocks); **audit/event** trail; **notification** mock; **customer BFF/API** vs **internal API** (could be one API with RBAC, or split later).

### Technical constraints and dependencies

- **Greenfield**, **problem-solving MVP**: optimize for **deterministic demo** and **observable state transitions**, not full marketplace scale.
- **No real payments, GPS, or live POS** in MVP; **mock** inventory, ETA, notifications with **clear interfaces** (NFR-I2).
- **Multi-tenant logical isolation** required from day one; cross-tenant ops views explicitly constrained and auditable (FR3, NFR-S1).
- **Human oversight** when automation is uncertain (FR21–FR22) implies **workflow states** and **pending approval** artifacts, not only synchronous API calls.
- **UX constraints:** **MUI** + **MUI X DataGrid**; **light/dark** themes; **WCAG 2.2 AA** target; **mobile-first** customer, **desktop-first** ops, **tablet-first** restaurant; recovery **Drawer/Dialog** with strong **focus/a11y** behavior.

### Cross-cutting concerns identified

1. **Tenant context propagation** — Every privileged path must carry and enforce `tenantId` (and restaurant scope where applicable).
2. **RBAC and server-side authorization** — UI routing is insufficient; mirror PRD matrix in policy layer.
3. **Auditability** — Overrides, reroutes, policy edits, inventory corrections, approvals (FR6, NFR-S3).
4. **Pre-confirmation orchestration** — Single conceptual pipeline: validate → propose fallback → consent/approval → commit order.
5. **Explainability payloads** — Structured “what/why/recommended” for operators (FR39) and customer-safe summaries.
6. **Adapter pattern** — Inventory, ETA, notifications swappable without rewriting core workflows (NFR-I2).
7. **Demo reliability** — Mock determinism and safe degradation (NFR-I1, NFR-I3).
8. **Consistency of domain language** — Order/incident/fallback events shared between customer **OrderTimeline** and internal views (UX alignment).

## Starter Template Evaluation

### Primary technology domain

**Full-stack web:** **React (TypeScript)** for all browser clients per UX (MUI + MUI X), with a **Node.js API** using **Express** and TypeScript, matching the PRD/MVP stack and adapter-friendly service boundaries.

No `project-context.md` or repo prefs were found; stack is inferred from PRD + UX.

### Starter options considered


| Option                                         | Role       | Pros                                                                          | Cons                                                                     |
| ---------------------------------------------- | ---------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Vite + `react-ts*`* (official `create-vite`) | Frontend   | Fast HMR, minimal opinions, MUI drops in cleanly, SPA fits role-based routing | No SSR (not required for demo); add router + MUI manually                |
| **Next.js App Router**                         | Frontend   | Routing, layouts, API routes                                                  | Heavier than needed if API stays on Express; PRD already centers Express |
| **Redwood / Blitz / T3**                       | Full-stack | Integrated patterns                                                           | Opinionated stacks diverge from “React + Express” demo plan              |
| **Express from `npm init`** + TypeScript       | Backend    | Exact PRD fit, full control of tenancy/RBAC middleware                        | No single “official” CLI; first story scaffolds `src/` layout            |


**UX-driven filters:** MUI + DataGrid need a **standard React** host (any works); **Storybook** optional add-on. No requirement for SSR, PWA, or WebSockets in MVP.

### Selected starter

**Frontend:** **Vite**, scaffolded with `**npm create vite@latest`** using the `**react-ts**` template (resolves to current `**create-vite**` / Vite line on npm at init time—re-run or check `package.json` after scaffold for exact pinned versions).

**Backend:** **Express + TypeScript** initialized with `**npm init`**, then `**typescript**`, `**ts-node-dev**` (or `**tsx**`) for dev, `**express**`, and `**@types/***`—no third-party “mega boilerplate” required for demo scope.

**Rationale:** Minimizes framework surface area, keeps **clear separation** between UI and API (helps mock adapters and future split), aligns with **intermediate** team profile in config, and matches documented **React + Express** intent.

### Initialization commands

**Client (from repo root or monorepo folder):**

```bash
npm create vite@latest client -- --template react-ts
cd client && npm install
```

**Server:**

```bash
mkdir server && cd server && npm init -y
npm install express
npm install -D typescript ts-node-dev @types/node @types/express
npx tsc --init
```

Then add `src/index.ts`, `dev`/`build`/`start` scripts, and `rootDir`/`outDir` in `tsconfig.json` (first implementation story).

**MUI (client, after Vite scaffold):**

```bash
cd client && npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install @mui/x-data-grid
```

### Architectural decisions provided by the starter

**Language & runtime:** TypeScript on **client and server**; Node LTS for API (use current LTS per Node release notes at setup).

**Styling solution:** Vite template ships minimal CSS; **MUI + Emotion** becomes the primary styling system (aligned with UX spec).

**Build tooling:** Vite (esbuild-powered dev, Rollup production build); `tsc` compile for API.

**Testing framework:** Not included by default—add **Vitest** + **React Testing Library** on the client and a test runner for API in a later story if needed.

**Code organization:** Vite gives `src/` + entry `main.tsx`; **Express** structure is defined by the team (recommended: `src/routes/`, `src/middleware/`, `src/services/`, `src/adapters/`).

**Development experience:** Fast HMR on client; `ts-node-dev` (or `tsx watch`) for API reload.

**Note:** Running the client and server scaffolds (and committing a minimal health route + CORS) should be the **first implementation story** after architecture sign-off.

**Version note:** Pin exact `vite`, `react`, and `typescript` versions when the scaffold is generated (`package.json`); upgrade on a schedule rather than hardcoding majors in this document.

## Core Architectural Decisions

### Decision priority analysis

**Critical (block implementation without these):**

- Primary datastore + access pattern (tenant isolation).
- Authentication and server-side RBAC enforcement strategy.
- API style and validation at boundaries.
- How pre-confirm validation and fallback orchestration live in backend modules.

**Important (shape the build):**

- ORM/migrations, audit/event modeling.
- Frontend server-state and routing.
- Integration adapter interfaces (mock + real later).

**Deferred (post-MVP):**

- Real POS, live maps, payment capture, horizontal scale, advanced analytics, full SSO.

### Data architecture

- **Database:** **PostgreSQL** for all non-demo-prototype deployments; use **Docker Compose** or a managed dev instance (e.g. Neon/Local) so multi-tenant queries and constraints behave like production. *Rationale:* aligns with SaaS isolation, relational orders/inventory/policies, and audit rows; avoids SQLite-only footguns for concurrency demos.
- **ORM / migrations:** **Prisma** (`prisma` + `@prisma/client`) with schema-first migrations. Pin the **exact versions from npm at install** (`npm info prisma version`).
- **Modeling:** Explicit `**Tenant`**, `**User**`, `**Role**`, `**Restaurant**`, `**MenuItem**`, `**InventoryItem**`, `**Cart**`, `**Order**`, `**OrderEvent**`, `**AuditLog**`, `**Policy**`, `**PendingDecision**` (or equivalent) — names TBD in schema design story; **order lifecycle + fallback** stored as events for timeline/explainability (FR39).
- **Validation:** **Zod** (or Prisma + Zod generation) at API boundaries; DB constraints for invariants (FK, unique per tenant where needed).
- **Caching:** None required for MVP beyond HTTP caching headers for static assets; optional in-memory rate limits later.

### Authentication & security

- **Auth:** Email + password (demo) or **dev login** fixture; passwords hashed with **bcrypt**. Issue **signed JWT** in **httpOnly, Secure, SameSite** cookie (short TTL) + optional refresh strategy; avoids localStorage token XSS. *Alternative acceptable for fastest demo:* server session in DB with cookie session id — document if chosen.
- **Authorization:** **RBAC middleware** on Express: every route declares required roles; **tenant scope** from JWT/session + membership table; **FR3** cross-tenant ops endpoints explicitly coded and audited.
- **Transport:** **HTTPS** in any shared/staging deploy; dev HTTP acceptable locally.
- **Audit:** Append-only `**AuditLog`** (or event table) for overrides, policy changes, approvals (NFR-S3, FR6).

### API & communication patterns

- **Style:** **REST + JSON** resource routes (`/api/v1/...`); **no GraphQL** for MVP (simpler for mock adapters and OpenAPI).
- **Errors:** Structured JSON `{ code, message, details? }`; map to HTTP status; never leak stack in production.
- **Docs:** Optional **OpenAPI** generated from Zod schemas or hand-maintained for demo routes.
- **Rate limiting:** Defer; add if exposing publicly.
- **BFF:** Single API with RBAC; **role-tuned responses** instead of separate BFF services for MVP.

### Frontend architecture

- **Routing:** **React Router** (current stable from npm at install) with layouts: **customer**, **restaurant**, **ops/support** route groups; theme toggle per UX (light customer / dark internal).
- **Server state:** **TanStack Query** for API calls, caching, mutations, loading/error alignment with MUI.
- **Local UI state:** React component state + context sparingly (e.g. theme, auth snapshot).
- **Forms:** React Hook Form optional where heavy; MUI `TextField` sufficient for many screens.
- **Performance:** Route-level code splitting (`React.lazy`); MUI tree-shaking; avoid over-fetching on DataGrid (server pagination for large mocks).

### Infrastructure & deployment

- **Local dev:** Vite proxy to Express API or CORS; env via `.env` (never commit secrets).
- **Deploy (flexible):** Any Node-friendly host (**Render, Fly.io, Railway**, etc.) with **PostgreSQL** addon; container optional.
- **CI:** Add lint/test pipeline when tests exist; not blocking for first vertical slice.
- **Observability:** Structured logs (JSON) from API; request id middleware; metrics deferred.

### Decision impact analysis

**Implementation sequence**

1. Monorepo or `client/` + `server/` folders; env + DB connection + Prisma schema + migrations.
2. Auth + tenant middleware + RBAC helpers.
3. Core domains: menu/inventory/cart/order + **pre-confirm validate** + **fallback proposal** services.
4. Mock adapters (inventory, ETA, notify) behind interfaces (NFR-I2).
5. React shells + MUI themes + first customer + one internal queue screen.
6. Audit + explainability payloads on fallback path.

**Cross-component dependencies**

- Tenant + RBAC must exist before any order/inventory routes.
- Fallback orchestration depends on inventory adapter + policy store.
- UI **ChangeSummary** depends on stable DTOs from validation/fallback APIs.
- Audit depends on stable “actor + tenant + order/incident id” context from middleware.

## Implementation Patterns & Consistency Rules

### Pattern categories defined

**Critical conflict points (agents could diverge here):** naming (DB, REST, files), API envelope and errors, tenant header vs JWT claims, date/ID formats, where domain logic vs routes live, TanStack Query key shapes, audit/event payloads, and mock adapter interfaces.

### Naming patterns

**Database (Prisma / PostgreSQL)**

- **Model names in schema:** PascalCase singular (`User`, `Order`, `OrderEvent`).
- **Table names:** use `@@map("...")` so physical tables are **snake_case plural** (`users`, `orders`, `order_events`).
- **Columns:** **snake_case** in DB (`tenant_id`, `created_at`); Prisma **field names camelCase** in code with `@map("snake_case")` where they differ.
- **Foreign keys:** `{referenced_table_singular}_id` (e.g. `restaurant_id`).
- **Indexes:** `idx_{table}_{columns}` (e.g. `idx_orders_tenant_created_at`).

**REST API**

- **Plural resource segments:** `/api/v1/orders`, `/api/v1/menu-items` (kebab-case multi-word resources).
- **IDs in path:** `/api/v1/orders/:orderId` (Express); param name `orderId` (camelCase).
- **Query params:** **camelCase** (`restaurantId`, `pageSize`).
- **Custom headers:** avoid unless needed; use `**Authorization`** / cookies per auth decision.

**Code (TypeScript / React)**

- **React components:** PascalCase files matching export (`ChangeSummary.tsx` exports `ChangeSummary`).
- **Hooks:** `use` prefix, camelCase (`useTenantScope`).
- **Server files:** **kebab-case** (`order-service.ts`, `tenant-middleware.ts`).
- **Constants:** `SCREAMING_SNAKE` for true constants; env vars **UPPER_SNAKE** in `.env`.

### Structure patterns

**Repository layout**

- `client/` — Vite app; `src/features/{customer|restaurant|ops}/`, `src/components/`, `src/api/`, `src/theme/`.
- `server/` — `src/routes/`, `src/middleware/`, `src/services/`, `src/adapters/`, optional `src/domain/`; `prisma/`.

**Tests**

- Co-located `*.test.ts` next to source; optional `server/test/integration/` for API tests. Do not mix client tests under `server/`.

**Config**

- `server/.env.example` and `client/.env.example` (`VITE_*` only on client).

### Format patterns

**JSON API**

- **Wire format:** **camelCase** in HTTP JSON.
- **Dates:** **ISO 8601** UTC strings; fields `createdAt`, `updatedAt`.
- **IDs:** string **UUIDs** in public API JSON.
- **Success:** direct resource body for 200 (no redundant double wrapping).
- **Errors:** `{ "error": { "code": "STABLE_CODE", "message": "...", "details": {} } }`; map `code` → HTTP in central middleware.

**Nulls:** Prefer explicit `null` for “known empty” where it simplifies UI; document per resource once.

### Communication patterns

**Domain events (internal)**

- **Event type** string constants in one module (e.g. `Order.FallbackProposed`).
- **Payload:** `tenantId`, `actorId`, `orderId`, `occurredAt`, `payloadVersion`.

**TanStack Query**

- **Query keys:** `['orders', tenantId, filters]` — always include `**tenantId`** when scoped.

**Logging (server)**

- Structured JSON: `level`, `msg`, `requestId`, `tenantId`, `userId`, `path`. No PII in `info` logs.

### Process patterns

**Validation:** Zod at HTTP boundary; services receive typed DTOs.

**Errors:** Domain errors with stable `code`; single error middleware maps to HTTP.

**Loading / UX:** TanStack Query + MUI skeletons / Alerts per UX spec.

### Enforcement guidelines

**All AI agents MUST:**

- Never trust client-supplied `tenantId`; use auth context.
- Route all external integrations through `**server/src/adapters/`** interfaces.
- Keep **explainability** payloads structured (FR39), not raw LLM text in operator views.

**Verification:** PR review for RBAC + tenant on new routes; Zod on new write DTOs.

### Pattern examples

**Good:** `GET /api/v1/orders?restaurantId=...` with tenant enforced in middleware; `Order.FallbackProposed` written to `OrderEvent` and `AuditLog` with shared `correlationId`.

**Anti-patterns:** snake_case JSON without agreement; stack traces on 500; mock inventory SQL inside route handlers.

## Project Structure & Boundaries

### Complete project directory structure

Target repo root `**mybmadproj/`** (or your chosen name) with `**client/**` + `**server/**`:

```
mybmadproj/
├── README.md
├── .gitignore
├── .editorconfig
├── docker-compose.yml              # optional: postgres for local dev
├── docs/                           # optional; project-knowledge target from BMAD config
├── _bmad-output/                   # planning artifacts (existing)
│   └── planning-artifacts/
├── client/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── package.json
│   ├── .env.example
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── vite-env.d.ts
│       ├── theme/
│       │   ├── customer-theme.ts
│       │   └── internal-theme.ts
│       ├── api/
│       │   ├── http-client.ts
│       │   └── query-keys.ts
│       ├── features/
│       │   ├── customer/
│       │   │   ├── routes.tsx
│       │   │   ├── pages/
│       │   │   └── components/
│       │   ├── restaurant/
│       │   │   ├── routes.tsx
│       │   │   ├── pages/
│       │   │   └── components/
│       │   └── ops/
│       │       ├── routes.tsx
│       │       ├── pages/
│       │       └── components/
│       ├── components/
│       │   ├── change-summary/
│       │   ├── order-timeline/
│       │   ├── decision-rationale/
│       │   └── workspace-shell/
│       └── hooks/
│           └── use-auth.ts
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── src/
        ├── index.ts
        ├── app.ts
        ├── config/
        │   └── env.ts
        ├── middleware/
        │   ├── request-id.ts
        │   ├── auth.ts
        │   ├── tenant-context.ts
        │   ├── rbac.ts
        │   └── error-handler.ts
        ├── routes/
        │   ├── index.ts
        │   ├── health.ts
        │   ├── auth.routes.ts
        │   ├── menu.routes.ts
        │   ├── cart.routes.ts
        │   ├── inventory.routes.ts
        │   ├── orders.routes.ts
        │   ├── checkout.routes.ts
        │   ├── fallback.routes.ts
        │   ├── ops.routes.ts
        │   ├── support.routes.ts
        │   └── policies.routes.ts
        ├── services/
        │   ├── auth-service.ts
        │   ├── menu-service.ts
        │   ├── cart-service.ts
        │   ├── inventory-service.ts
        │   ├── order-service.ts
        │   ├── validation-service.ts
        │   ├── fallback-service.ts
        │   ├── policy-service.ts
        │   ├── audit-service.ts
        │   └── notification-service.ts
        ├── adapters/
        │   ├── inventory-adapter.ts
        │   ├── inventory-mock-adapter.ts
        │   ├── eta-adapter.ts
        │   ├── eta-mock-adapter.ts
        │   ├── notify-adapter.ts
        │   └── notify-mock-adapter.ts
        ├── domain/
        │   └── domain-events.ts
        └── lib/
            ├── prisma.ts
            └── errors.ts
```

Add `*.test.ts` beside modules as tests are introduced.

### Architectural boundaries

**API boundaries**

- **Single Express app** listening on `server/src/index.ts`; versioned JSON under `**/api/v1`**.
- **Public (customer)** vs **internal** routes share one process but **must** differ by **RBAC** and **response shape** (no privilege data on customer JSON).
- **Adapters** (`server/src/adapters/`) are the **only** place that call mock ETA/inventory/notify implementations; **services** depend on **interfaces**, not concrete mocks.

**Component boundaries (client)**

- `**features/{customer|restaurant|ops}`** owns route tables and page composition.
- **Shared UX primitives** (`ChangeSummary`, `OrderTimeline`, etc.) live under `**client/src/components/`**; consume **stable DTOs** from `client/src/api/types` (hand-maintain or generate later).
- **TanStack Query** hooks: one convention per feature (prefer `features/*/api/` if the codebase grows).

**Service boundaries (server)**

- **Routes** = HTTP + Zod parse + service call + error mapping.
- **Services** = business rules, transactions, orchestration (validate → fallback → commit).
- **No Prisma in route handlers**; services use `lib/prisma` (or thin repositories if added later).

**Data boundaries**

- **PostgreSQL** is the system of record; **Prisma** is the only application DB access in MVP.
- **Order timeline / explainability** reads from `**OrderEvent`** (or equivalent), not ad hoc logs.

### Requirements → structure mapping


| PRD / FR area                    | Primary location                                                          |
| -------------------------------- | ------------------------------------------------------------------------- |
| FR1–FR6 Tenant, RBAC, audit      | `server/src/middleware/*`, `audit-service.ts`, Prisma models              |
| FR7–FR9 Menu & cart              | `menu.routes.ts`, `cart.routes.ts`, `client/.../features/customer/`       |
| FR10–FR13 Inventory-aware        | `inventory-service.ts`, `validation-service.ts`, `inventory-*-adapter.ts` |
| FR14–FR16 Checkout / no payment  | `checkout.routes.ts`, `order-service.ts`                                  |
| FR17–FR22 Fallback & approval    | `fallback-service.ts`, `fallback.routes.ts`, `ops.routes.ts`              |
| FR23–FR25 Tracking & comms       | `orders.routes.ts`, `notification-service.ts`, `notify-*-adapter.ts`      |
| FR26–FR28 Restaurant             | `client/.../features/restaurant/`, restaurant-scoped APIs                 |
| FR29–FR30 Delivery partner       | e.g. `delivery.routes.ts` when implemented                                |
| FR31–FR35 Ops monitoring & rules | `ops.routes.ts`, `policies.routes.ts`, `policy-service.ts`                |
| FR36–FR38 Support recovery       | `support.routes.ts`, incident read models in services                     |
| FR39 Explainability              | DTOs + `OrderEvent`; `decision-rationale` UI                              |
| FR40–FR42 Integration            | `adapters/*` only                                                         |
| FR43–FR44 Consent / retention    | auth/user flows + Prisma; `config/env.ts`                                 |


### Integration points

**Internal:** `client` `http-client.ts` → Express `/api/v1`; cookies/JWT per auth decision; Vite **proxy** in dev.

**External (MVP):** None live—all via **mock adapters**; swap implementations without changing service method signatures.

**Data flow (checkout disruption):** Client checkout → validate → `inventory-adapter` → on failure `fallback-service` → proposal DTO → **ChangeSummary** → on accept confirm → order + `OrderEvent` + `AuditLog`.

### File organization patterns

- **Config:** `server/src/config/env.ts` (Zod-validated env); client `import.meta.env.VITE_*`.
- **Tests:** co-located `*.test.ts`; optional `server/test/integration/`.
- **Assets:** `client/public/` for static files only.

### Development workflow integration

- **Dev:** `server` `npm run dev`; `client` `npm run dev`; CORS or Vite proxy.
- **Build:** `client` `vite build`; `server` `tsc` → `dist/`; `node dist/index.js`.
- **Deploy:** provision **PostgreSQL**; `prisma migrate deploy` before start.

## Architecture Validation Results

### Coherence validation

**Decision compatibility:** **React + Vite + MUI** (UX) and **Express + Prisma + PostgreSQL** (API/data) fit together without contradiction. Pre-confirm validation and fallback orchestration live in **server services**; the client uses **TanStack Query** + shared DTOs—aligned with latency and transparency goals. Mock integrations are isolated in `**adapters/`**, matching NFR-I2.

**Pattern consistency:** Naming rules (DB snake / API camelCase JSON), error envelope, and tenant enforcement match the structure (middleware + services). Dual MUI themes map to `**client/src/theme/`** and route groups.

**Structure alignment:** Directories under `client/` and `server/` support RBAC surfaces, adapter swap, and audit/event modeling. Requirements→path mapping covers **FR1–FR44** at the intended granularity.

### Requirements coverage validation

**Epic/feature coverage:** No separate epics document was listed in `inputDocuments`; coverage is by **PRD FR categories** (see structure mapping table)—all groups have a home.

**Functional requirements:** **FR1–FR44** are architecturally supportable: tenancy/RBAC/audit, menu/cart/inventory, checkout without payments, fallback + ops approval, tracking/mocks, ops policies, support actions, explainability, adapter boundaries, consent/retention posture.

**Non-functional requirements:** **NFR-P*** addressed via responsive API design, fast validation/fallback paths, and session-visible updates; **NFR-S*** via server-side RBAC, tenant isolation, audit, TLS in deploy; **NFR-I*** via deterministic mocks and safe failure behavior in adapters and error middleware.

### Implementation readiness validation

**Decision completeness:** Stack, data store, API style, auth approach, and frontend state/routing are documented; exact package versions remain **pin-at-scaffold** (intentional).

**Structure completeness:** Concrete tree lists primary files; new routes (e.g. delivery partner) can extend the same patterns.

**Pattern completeness:** Naming, API errors, events, Query keys, and the adapters-only rule reduce agent conflict risk.

### Gap analysis results

**Important (non-blocking):**

- **Shared types:** Add `packages/shared` or OpenAPI codegen later so client/server DTOs stay in sync; until then, duplicate minimally with comments.
- **Auth detail:** Final choice between **JWT cookie** vs **DB session** should be fixed in the first auth story (both are compatible with this architecture).
- **AI engine:** “Fallback proposal” can be rule-based mock first; document an interface for a future LLM provider without coupling to routes.

**Nice-to-have:** Storybook for `ChangeSummary`; OpenAPI from Zod; Docker Compose checked in for Postgres.

### Validation issues addressed

No **critical** blockers identified; gaps above are tracked for first implementation stories.

### Architecture completeness checklist

- **Requirements analysis:** context, scale, constraints, cross-cutting concerns — documented in **Project Context Analysis**.
- **Architectural decisions:** data, auth, API, frontend, infra — documented in **Core Architectural Decisions**.
- **Implementation patterns:** naming, structure, formats, communication, process — documented.
- **Project structure:** tree, boundaries, FR mapping, integration — documented.

### Architecture readiness assessment

**Overall status:** **READY FOR IMPLEMENTATION** (demo MVP scope).

**Confidence level:** **High** for vertical slice; **medium** for long-term scale (post-MVP hardening not in scope).

**Key strengths:** Clear **tenant + RBAC** story, **adapter** boundary for mocks, **event/audit** path for explainability, UX-aligned **split themes** and components.

**Areas for future enhancement:** Shared type package, workflow engine for approvals if rules grow, real auth/SSO, horizontal scaling and read replicas.

### Implementation handoff

**AI agent guidelines**

- Follow this document for stack, boundaries, and patterns.
- Enforce **tenant context** and **RBAC** on every new API route.
- Never bypass **adapters** for external behavior.

**First implementation priority:** Run starter commands from **Starter Template Evaluation** (Vite `client`, TypeScript `server`), add **PostgreSQL** + **Prisma** schema stub, **health** route, **CORS/proxy**, then **auth + tenant middleware** skeleton.