# Complete UI/UX Blueprint — mybmadproj

**Author (UX):** Sally (UX Designer agent)  
**For:** Dhirender  
**Date:** 2026-04-25  
**Sources:** `ux-design-specification.md`, `prd.md`, `architecture.md`, `epics.md`, `ux-design-directions.html`

---

## Why this document exists

Your teams already have a rich **UX Design Specification** (principles, patterns, journeys, components). This blueprint is the **build-facing layer**: *every major surface* named with **routes**, **layouts**, **MUI building blocks**, **states**, and **traceability* to FRs and UX-DRs—so design and engineering don’t improvise different apps.

**Design direction (locked):** Customer experience follows **Direction D1** (calm, credible); internal tools follow **D2** (dark, dense); restaurant queue/inventory layout borrows **D7** information architecture inside the **D2** shell.

---

## 1. Information architecture

### 1.1 Workspaces (React route groups)


| Workspace               | Theme               | Primary device   | Base path (suggested) |
| ----------------------- | ------------------- | ---------------- | --------------------- |
| Customer                | Light (MUI)         | Mobile-first     | `/` or `/c`           |
| Restaurant manager      | Dark (MUI)          | Tablet / desktop | `/restaurant`         |
| Ops admin               | Dark                | Desktop          | `/ops`                |
| Support                 | Dark                | Desktop          | `/support`            |
| Delivery partner (demo) | Dark or light strip | Phone            | `/delivery`           |


Use **one SPA** with `React Router` layouts; **WorkspaceShell** (UX-DR2) wraps all non-customer routes.

### 1.2 Suggested route map

**Customer**


| Route              | Screen                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| `/`                | Home / restaurant picker (if multi-restaurant demo)                    |
| `/menu`            | Menu browse                                                            |
| `/cart`            | Cart review                                                            |
| `/checkout`        | Checkout & place order                                                 |
| `/recovery`        | Full-screen or deep-linked recovery (often modal/Drawer from checkout) |
| `/orders/:orderId` | Order tracking & timeline                                              |
| `/consent`         | Consent acknowledgment (first-run or gate)                             |


**Restaurant**


| Route                    | Screen                                           |
| ------------------------ | ------------------------------------------------ |
| `/restaurant`            | Dashboard: queue + inventory snapshot (D7-style) |
| `/restaurant/orders`     | Incoming orders (DataGrid)                       |
| `/restaurant/orders/:id` | Order detail + timeline + actions                |
| `/restaurant/inventory`  | Inventory editor                                 |


**Ops**


| Route             | Screen                                           |
| ----------------- | ------------------------------------------------ |
| `/ops`            | Signals overview (order health + inventory risk) |
| `/ops/policies`   | Policy list / edit                               |
| `/ops/decisions`  | Pending automation approvals (FR22)              |
| `/ops/orders/:id` | Deep order / override / reassign                 |


**Support**


| Route                    | Screen                             |
| ------------------------ | ---------------------------------- |
| `/support`               | Incident inbox                     |
| `/support/incidents/:id` | Incident + order context + actions |


**Delivery**


| Route           | Screen                   |
| --------------- | ------------------------ |
| `/delivery`     | My deliveries list       |
| `/delivery/:id` | Task detail + milestones |


**Shared**

| `/login` | Role-aware login (redirect by role after auth) |

---

## 2. Global UI foundations

### 2.1 MUI theming (UX-DR1)

- **Customer:** light background (warm off-white per spec), primary teal/green, secondary amber for attention; comfortable density.
- **Internal:** dark surfaces, same semantic mapping for success/warning/error/info; **compact** density on DataGrid (UX-DR9).
- **Single source:** `theme/customer-theme.ts`, `theme/internal-theme.ts`; wrap route layouts with correct `ThemeProvider`.

### 2.2 Scope & trust (UX-DR2, FR1–FR6)

Every internal **detail** view header shows:

- **Tenant** (name or id chip)
- **Restaurant** when applicable
- **User role** subtle indicator (optional)

Prevents “wrong kitchen” panic—managers and ops feel *grounded*.

### 2.3 Status vocabulary (UX-DR10)

One module maps order/incident/fallback states → **Chip** color + icon + label. **No ad-hoc** reds/greens per screen.

### 2.4 Motion (UX-DR17)

Use MUI transitions sparingly; honor `prefers-reduced-motion`.

---

## 3. Screen specifications (by persona)

Each block lists: **Purpose · Layout · Key components · States · Requirements**.

### 3.1 Customer

#### Screen: Login (`/login`)

- **Purpose:** Establish session with tenant context (Story 1.1).
- **Layout:** Centered card on light theme; logo + product name.
- **Components:** `TextField` (email), `TextField` password, `Button` primary, `Alert` for errors (structured message).
- **States:** default, loading (disable + `CircularProgress`), error (inline, no toast-only for failure).
- **Refs:** FR1; UX-DR8; UX-DR11 (labels, focus).

#### Screen: Menu browse (`/menu`)

- **Purpose:** Trust-building browse—availability honest (Stories 2.3, 2.4).
- **Layout:** `AppBar` (brand, cart icon with `Badge`), single column list; categories as `Tabs` or `Chip` filters.
- **Components:** `Card` or list rows with item, price, **availability** chip/disabled state; `Fab` or sticky bar for cart on mobile (UX-DR12).
- **States:** loading skeleton; empty menu; item unavailable; API error with retry.
- **Refs:** FR7, FR13; UX-DR1, UX-DR7, UX-DR10, UX-DR12.

#### Screen: Cart (`/cart`)

- **Purpose:** Review and adjust lines (Story 2.4).
- **Layout:** `List` + quantity `TextField` / steppers; summary footer sticky.
- **Components:** `IconButton` remove, `Button` proceed to checkout.
- **States:** empty cart CTA back to menu; validation warnings inline.
- **Refs:** FR8, FR9; UX-DR7.

#### Screen: Checkout (`/checkout`)

- **Purpose:** Pre-validate and confirm (Epic 3).
- **Layout:** Sections: items, modeled ETA strip, legal/consent link, primary **Place order**.
- **Components:** `Stepper` optional; `LinearProgress` during validate; `Alert` for conflicts.
- **States:** validating; blocked (409) opens **recovery** path; success navigates to confirmation.
- **Refs:** FR10, FR11, FR14, FR16; NFR-P1, NFR-P2; UX-DR8, UX-DR11.

#### Screen: Recovery sheet (modal / `Drawer`)

- **Purpose:** Hero moment—disruption recovery (Epic 4).
- **Layout (mobile):** `Drawer` ~90vh bottom; (desktop) `Dialog` wide enough for before/after.
- **Components:** `**ChangeSummary`** (UX-DR3), `**DecisionRationale`** collapsed (UX-DR4), primary **Accept**, secondary **Edit cart**, tertiary **Cancel** (UX-DR6, UX-DR7).
- **States:** loading proposal; ready; low-confidence expanded rationale; pending ops approval message (FR21).
- **Refs:** FR17–FR20; NFR-P3; UX-DR3–8, UX-DR11, UX-DR14.

#### Screen: Order confirmation (`/checkout/success` or `/orders/:id/confirmed`)

- **Purpose:** Reinforce trust with order id and next step (Story 3.3).
- **Layout:** Success `Alert` or illustration region; order id in monospace; CTA **Track order**.
- **Refs:** FR15; UX-DR8 (non-blocking snackbar optional for copy id).

#### Screen: Order tracking (`/orders/:orderId`)

- **Purpose:** Status + ETA + timeline (Epic 7).
- **Layout:** Header with ETA chip; `**OrderTimeline`** (UX-DR5 customer variant).
- **States:** loading; live updates (polling or SSE later—session refresh acceptable for demo NFR-P4).
- **Refs:** FR23, FR24; UX-DR5, UX-DR12.

#### Screen: Consent (`/consent`)

- **Purpose:** FR43; store acknowledgment.
- **Layout:** Short copy + `Checkbox` + **Continue**; link to minimal privacy text.
- **Refs:** FR43, FR44; UX-DR11.

---

### 3.2 Restaurant manager

#### Screen: Operations hub (`/restaurant`)

- **Purpose:** D7-style “glance” — queue pressure + inventory risk teaser (optional widgets).
- **Layout:** `Grid` cards or split: **Incoming** summary + **Stock alerts** summary; nav to full views.
- **Refs:** Epic 5 prelude; UX-DR2, UX-DR12.

#### Screen: Orders queue (`/restaurant/orders`)

- **Purpose:** Scannable incoming orders (Story 5.1).
- **Layout:** `**DataGrid`** compact (UX-DR9); toolbar search/filter (UX-DR16).
- **Columns:** id, time, status, **flags** (reroute/fallback chip FR28), actions.
- **States:** skeleton loading; empty; error + retry (UX-DR15).
- **Refs:** FR26, FR28; UX-DR9, UX-DR10, UX-DR15, UX-DR16.

#### Screen: Order detail (`/restaurant/orders/:id`)

- **Purpose:** Accept/reject with reason (Story 5.2).
- **Layout:** Header scope chips; `**OrderTimeline`** internal variant; action bar.
- **Components:** `TextField` reason on reject; `Dialog` confirm accept.
- **Refs:** FR27; UX-DR5, UX-DR13, UX-DR14.

#### Screen: Inventory (`/restaurant/inventory`)

- **Purpose:** Update quantities / 86 items (Story 2.2).
- **Layout:** Editable table or row edit pattern; save bar.
- **Refs:** FR12; UX-DR9 optional; UX-DR13.

---

### 3.3 Ops admin

#### Screen: Ops dashboard (`/ops`)

- **Purpose:** Cross-tenant signals (Story 8.1–8.2).
- **Layout:** Cards or charts (simple counts for demo); link to policies, approvals queue.
- **Components:** `Chip` for severity; last-updated text (UX-DR15).
- **Refs:** FR31, FR32, FR3; UX-DR2, UX-DR10.

#### Screen: Policies (`/ops/policies`)

- **Purpose:** Configure fallback constraints (Story 8.3).
- **Layout:** List + editor `Drawer` or full page form.
- **Refs:** FR33; UX-DR13.

#### Screen: Pending decisions (`/ops/decisions`)

- **Purpose:** Approve/reject automation (Story 4.5, 8.4).
- **Layout:** **DataGrid** or master-detail; detail shows **structured rationale** (FR39).
- **Refs:** FR22, FR34, FR39; UX-DR4, UX-DR9, UX-DR13.

#### Screen: Order intervention (`/ops/orders/:id`)

- **Purpose:** Override / reassign (Story 8.4–8.5).
- **Layout:** Same family as support incident but ops-centric actions.
- **Refs:** FR34, FR35; UX-DR2, UX-DR13, UX-DR14.

---

### 3.4 Support agent

#### Screen: Incident inbox (`/support`)

- **Purpose:** Triage list (Story 9.x).
- **Layout:** DataGrid with severity, age, blast radius hints.
- **Refs:** FR36; UX-DR9, UX-DR16.

#### Screen: Incident detail (`/support/incidents/:id`)

- **Purpose:** Context + comms + recovery (Stories 9.1–9.3).
- **Layout:** Three columns optional: context | timeline | actions; or stacked on narrow.
- **Components:** `**DecisionRationale`**, `**OrderTimeline`** internal; `Button` trigger comms; recovery with reason.
- **Refs:** FR36, FR37, FR38, FR39; UX-DR4, UX-DR5, UX-DR8, UX-DR13.

---

### 3.5 Delivery partner

#### Screen: My deliveries (`/delivery`)

- **Purpose:** Simple task list (Story 6.1).
- **Layout:** `List` of cards; minimal chrome.
- **Refs:** FR29; UX-DR12.

#### Screen: Task detail (`/delivery/:id`)

- **Purpose:** Milestone buttons (Story 6.2).
- **Layout:** Status chips + `Button` group for milestones.
- **Refs:** FR30; UX-DR7, UX-DR11.

---

## 4. Component → implementation checklist


| Component             | MUI base                                    | Custom wrapper | UX-DR              |
| --------------------- | ------------------------------------------- | -------------- | ------------------ |
| ChangeSummary         | `Dialog`/`Drawer`, `Grid`, `Chip`, `Button` | Yes            | UX-DR3, 6, 8, 11   |
| DecisionRationale     | `Accordion`, `Typography`                   | Yes            | UX-DR4             |
| OrderTimeline         | `Stepper` or custom `Stack`                 | Yes            | UX-DR5             |
| WorkspaceShell        | `Drawer`, `AppBar`, `Toolbar`               | Yes            | UX-DR2, 12         |
| Status chips          | `Chip`                                      | Mapper module  | UX-DR10            |
| Ops/Restaurant tables | `DataGrid`                                  | Column defs    | UX-DR9, 11, 15, 16 |


---

## 5. Edge cases & empty states (cross-screen)


| Situation                | UX pattern                                                  |
| ------------------------ | ----------------------------------------------------------- |
| No orders                | Illustration optional; one line + CTA “Refresh” (UX-DR15)   |
| Integration mock failure | `Alert` + retry; support ops visibility (NFR-I3)            |
| Pending ops approval     | Customer sees clear waiting state; not a dead end (FR21)    |
| Cross-tenant ops         | Never show raw other-tenant PII in aggregates (FR3, NFR-S1) |


---

## 6. Demo narrative script (for stakeholders)

1. **Customer** opens menu—sees unavailable dish greyed out (*trust*).
2. Adds to cart, checks out—**fast** validation feedback.
3. Trigger **disruption**: recovery **Drawer** slides up—**before/after**, explicit accept.
4. **Restaurant** queue shows **reroute** badge—manager accepts with confidence.
5. **Ops** glances at signals; opens **rationale** on a decision; **Support** closes loop with a recovery action.

This is the story your UI should let you *tell live* without apologizing for the product.

---

## 7. Relationship to other artifacts

- **Authoritative UX principles & patterns:** `ux-design-specification.md`  
- **Visual directions reference:** `ux-design-directions.html`  
- **Build order:** `epics.md` + `architecture.md`  
- **Capability contract:** `prd.md` (FR/NFR)

When engineering diverges, update **this blueprint** or the UX spec so agents stay aligned.

---

*— Sally*