# Sprint Execution Backlog (S1-S3): UX Wireframes -> Implementation

**Project:** The Agile Forum  
**Date:** 2026-05-27  
**Source Artifacts:** `wireframe-screen-specs.md`, `wireframe-ascii-pack.md`, `ux-design-specification.md`, `prd-agile-forum.md`

---

## 1) Scope and Planning Assumptions

- This backlog translates approved wireframes into implementation-ready work.
- Sprint 0 enablers are assumed complete (`S0.1` to `S0.10`).
- Story format includes:
  - Story ID + goal
  - FR/NFR traceability
  - Acceptance criteria
  - Tasks by discipline (FE/BE/QA/Analytics)
  - Dependencies

---

## 2) Sprint Sequencing

### Sprint 1 (Core Conversion Loop)

- EPIC-UX-01 Public Experience and Diagnosis Flow
- EPIC-UX-02 Diagnosis Results and Recommendation Actioning
- EPIC-UX-03 Checkout Confidence Path (MVP subset)

### Sprint 2 (Retention and Learning Loop)

- EPIC-UX-04 Learner Dashboard and Micro-Exam Experience
- EPIC-UX-05 Webinar and Mentor Support Flows

### Sprint 3 (Intelligence and Consistency Hardening)

- EPIC-UX-06 AI Coach Journey Integration
- EPIC-UX-07 Profile, Preferences, and UX Consistency + A11y hardening

---

## 3) Epic Breakdown

## EPIC-UX-01: Public Experience and Diagnosis Flow

**Goal:** Ship Home -> Diagnosis Step 1-4 with high completion and low friction.  
**Primary FR Traceability:** FR-4, FR-5, FR-6, FR-61, FR-62, FR-63, FR-3, FR-20, FR-46  
**NFR:** NFR-P1, NFR-C1, NFR-C2

### Story UX-01.1 Home Outcome-Led Landing

**As a** visitor, **I want** a clear outcome-focused homepage **so that** I start diagnosis confidently.

**Acceptance Criteria**

- Hero section has one primary CTA (`Start Diagnosis`) and one secondary CTA (`Book Mentor Call`).
- Proof strip, role pathways, webinar module, and trust footer are visible.
- Logged-in users see continuation CTA when resumable state exists.

**Tasks**

- FE: Build homepage layout sections from wireframe spec.
- FE: Implement sticky mobile CTA and bottom nav behavior.
- FE: Implement reusable trust footer module.
- BE: Expose pathway and webinar teaser APIs.
- Analytics: Track hero CTA click, pathway card click, webinar module interactions.
- QA: Responsive regression (mobile/tablet/desktop) + CTA hierarchy validation.

**Dependencies:** S0 auth/session context, webinar adapter stub.

### Story UX-01.2 Diagnosis Step 1 (Intent + Consent)

**As a** visitor, **I want** to set my role goal and consent **so that** diagnosis is personalized and compliant.

**Acceptance Criteria**

- Role goal and timeline are mandatory.
- Consent checkbox is mandatory before continuation.
- Inline and summary validation errors are shown.

**Tasks**

- FE: Build stepper frame and form controls.
- FE: Form validation (field and submit-level).
- BE: Save step-1 draft + consent timestamp.
- QA: Validation paths, consent persistence, keyboard navigation.
- Analytics: Track step started/completed and validation failures.

**Dependencies:** S0 consent contract and auth middleware.

### Story UX-01.3 Diagnosis Step 2 (Resume + Optional JD)

**As a** user, **I want** upload/paste input options **so that** analysis quality is strong and flexible.

**Acceptance Criteria**

- Upload and paste modes supported.
- Target role required; JD optional.
- Retry paths for invalid file/network issues.
- Draft state is preserved.

**Tasks**

- FE: Build dual input tabs, drag/drop, paste editor, helper text.
- FE: Add local file validation (type/size) and error state rendering.
- BE: Resume/JD ingestion endpoint with draft autosave.
- BE: Upload sanitization and scan hook integration.
- QA: Negative test matrix for file types, timeout, and retry.
- Analytics: Capture upload success/failure reasons.

**Dependencies:** S0 upload validation and security baseline.

### Story UX-01.4 Diagnosis Step 3 Processing State

**As a** user, **I want** transparent progress **so that** I trust the system while waiting.

**Acceptance Criteria**

- Progress stage labels visible (parsing/mapping/insights).
- Timeout fallback provides retry and support options.
- Transition to results happens automatically on success.

**Tasks**

- FE: Processing state UI and polling/subscription logic.
- BE: Job status endpoint with structured stage states.
- QA: Happy path, timeout path, and interrupted session resume.
- Analytics: Time-to-result and drop-off telemetry.

**Dependencies:** S0 queue/event baseline.

---

## EPIC-UX-02: Diagnosis Results and Recommendation Actioning

**Goal:** Deliver clear results and one dominant next-best-action.  
**Primary FR Traceability:** FR-7, FR-12, FR-158, FR-159, FR-160, FR-110  
**NFR:** NFR-P2, NFR-C2, NFR-A1

### Story UX-02.1 Results Summary and Gap Insights

**As a** learner, **I want** plain-language skill-gap output **so that** I understand my position quickly.

**Acceptance Criteria**

- Readiness summary, strengths/gaps, and roadmap preview appear in one coherent layout.
- Summary-first hierarchy precedes detailed metrics.
- Accessible text/table alternatives exist for visual components.

**Tasks**

- FE: Build results screen layout blocks and content hierarchy.
- BE: Provide normalized insight payload (summary, gaps, priorities, confidence).
- FE: Implement accessible alternatives toggle.
- QA: Content hierarchy and accessibility checks.

**Dependencies:** Diagnosis engine outputs.

### Story UX-02.2 Recommendation Rationale + Action Module

**As a** learner, **I want** to see why a recommendation fits **so that** I can act with confidence.

**Acceptance Criteria**

- Rationale card includes fit signals and next-step explanation.
- One primary CTA only; secondary actions are available but visually subordinate.
- If confidence is low, escalation options appear.

**Tasks**

- FE: Implement recommendation rationale component.
- FE: Implement next-best-action component with state variants.
- BE: Include explanation metadata and confidence score.
- QA: Verify CTA hierarchy and low-confidence behavior.
- Analytics: Track recommendation impression -> primary CTA conversion.

**Dependencies:** Role-offer mapping and explainability fields.

---

## EPIC-UX-03: Checkout Confidence Path

**Goal:** Implement recommendation -> checkout with schedule, auth, and org reimbursement branches.  
**Primary FR Traceability:** FR-13, FR-14, FR-151, FR-152, FR-153, FR-157  
**NFR:** NFR-R1, NFR-C1

### Story UX-03.1 Offer Detail and Schedule Enforcement

**As a** buyer, **I want** transparent offer details and required schedule selection **so that** checkout is unambiguous.

**Acceptance Criteria**

- Offer page shows outcomes, inclusions, trust block, and policy links.
- Add/proceed is blocked if schedule-required item has no schedule selected.
- Currency display and pricing remain consistent with checkout.

**Tasks**

- FE: Build offer detail layout and schedule selector.
- BE: Expose schedule-required flag and valid schedule list.
- FE/BE: Enforce schedule validation before checkout transition.
- QA: Schedule enforcement and pricing consistency tests.

**Dependencies:** Catalog metadata and pricing source-of-truth.

### Story UX-03.2 Checkout Standard + Org Reimbursement Branch

**As a** buyer, **I want** checkout options aligned to my payment context **so that** I can complete purchase reliably.

**Acceptance Criteria**

- Auth gate preserves cart context and returns user to checkout.
- Eligible SAFe carts display reimbursement branch with required org fields.
- Successful payment routes to confirmation with resources/community links.

**Tasks**

- FE: Implement checkout layout (summary, billing, payment, branch logic).
- BE: Branch eligibility logic and org reimbursement intake endpoint.
- BE: Payment success webhook -> order confirmation pipeline.
- QA: End-to-end test for standard and org branch.
- Analytics: checkout start/completion/branch selection events.

**Dependencies:** Stripe adapter, auth gate middleware, notification services.

---

## EPIC-UX-04: Dashboard and Micro-Exam Loop

**Goal:** Build return-user cockpit and skill validation loop.  
**Primary FR Traceability:** FR-8, FR-9, FR-10, FR-11, FR-131, FR-132  
**NFR:** NFR-P3, NFR-C2

### Story UX-04.1 Dashboard Core and Continuation Rail

**As a** returning learner, **I want** immediate progress visibility **so that** I continue without friction.

**Acceptance Criteria**

- Continuation rail appears when pending task/session exists.
- Skill cards, roadmap tasks, saved items, and next action module are present.
- View preference persists (chart/table).

**Tasks**

- FE: Compose dashboard shell and cards.
- FE: Implement continuation rail behavior.
- BE: Dashboard aggregation endpoint.
- QA: Saved-state resume and preference persistence tests.

**Dependencies:** User progress model and bookmark persistence.

### Story UX-04.2 Micro-Exam Start/Attempt/Result

**As a** learner, **I want** a timed micro-exam flow **so that** I can validate and refresh readiness.

**Acceptance Criteria**

- Start screen shows duration, instructions, and competency.
- Attempt screen supports one-question focus with timer and nav.
- Result screen updates recommendations and suggests next action.

**Tasks**

- FE: Build 3-screen micro-exam experience.
- BE: Exam session lifecycle API (start, answer, submit, score).
- FE/BE: Recommendation refresh trigger after scoring.
- QA: Timer, submission guards, interrupted-session behavior.
- Analytics: exam started/completed and post-result CTA conversion.

**Dependencies:** Assessment engine baseline.

---

## EPIC-UX-05: Webinar and Mentor Support Flows

**Goal:** Implement support/re-entry channels with conversion continuity.  
**Primary FR Traceability:** FR-30, FR-31, FR-32, FR-79, FR-81, FR-82, FR-39  
**NFR:** NFR-R4, NFR-C4

### Story UX-05.1 Webinar Hub + Booking + Post-Attendance

**As a** learner, **I want** to discover and register webinars **so that** I can progress and re-enter the funnel.

**Acceptance Criteria**

- Webinar listing supports role/topic/date filters.
- Booking confirmation sent for authenticated users.
- Attendance code, feedback, and certificate status are available post-session.

**Tasks**

- FE: Webinar listing and filter UI.
- FE/BE: Registration workflow and confirmation state.
- BE: Attendance code verification and certificate status endpoint.
- QA: Registration, attendance, and feedback workflow tests.

**Dependencies:** Webinar adapter and notification service.

### Story UX-05.2 Mentor Call Booking

**As a** learner, **I want** paid mentor call booking with geo-priced fees **so that** I can get human guidance quickly with transparent pricing.

**Acceptance Criteria**

- Slot selection + goal intake + payment confirmation in <= 3 minutes.
- Geo-pricing is enforced: USA users see `$9`; India users see `INR 49`.
- Location/currency is auto-detected with user override before payment confirmation.
- Follow-up recommendations displayed after booking.
- Return links to diagnosis/dashboard are preserved.

**Tasks**

- FE: Slot picker, geo-pricing display, and payment confirmation UI.
- BE: Slot availability API + booking endpoint + geo pricing resolver.
- BE: Location/currency override handling and price validation at booking submit.
- QA: Time-to-book benchmark, geo-pricing validation, and edge cases (slot conflict, incorrect geo detection).
- Analytics: mentor booking started/completed with geo + currency context.

**Dependencies:** Calendar/booking integration stub.

---

## EPIC-UX-06: AI Coach Integration Across Journeys

**Goal:** Provide contextual AI support and escalation in all high-friction steps.  
**Primary FR Traceability:** FR-20, FR-21, FR-22, FR-127  
**NFR:** NFR-A1, NFR-A2, NFR-A6

### Story UX-06.1 Contextual AI Coach Panel

**As a** user, **I want** AI help aware of my current journey context **so that** guidance is relevant and actionable.

**Acceptance Criteria**

- AI panel shows context-aware prompts per page.
- Responses include actionable next-step suggestions.
- Low-confidence responses expose escalation path.

**Tasks**

- FE: Persistent AI coach entry and panel UI.
- BE: Context envelope injection for chat requests.
- BE: Low-confidence detector and escalation actions.
- QA: Context switching and escalation route tests.

**Dependencies:** AI orchestration service and policy layer.

---

## EPIC-UX-07: Profile, Preferences, and UX Quality Hardening

**Goal:** Finalize profile controls, communication preferences, and UX consistency/A11y governance.  
**Primary FR Traceability:** FR-2, FR-56, FR-156, FR-145/146 (trust surfaces)  
**NFR:** NFR-C1, NFR-C2, NFR-C4, NFR-P4

### Story UX-07.1 Profile and Preference Controls

**As a** learner, **I want** to manage role goals and communication preferences **so that** recommendations and nudges are relevant.

**Acceptance Criteria**

- Profile screen includes role goal, interests, and channel preferences.
- Consent and unsubscribe controls are explicit and enforceable.
- Preference changes update campaign relevance inputs.

**Tasks**

- FE: Profile/preferences screen implementation.
- BE: Preference persistence and update API.
- QA: Consent/unsubscribe enforceability checks.

**Dependencies:** Consent data model and automation preference contract.

### Story UX-07.2 UX Consistency + Accessibility Pass

**As a** product team, **we want** all screens to conform to shared UX and a11y patterns **so that** experience quality is predictable.

**Acceptance Criteria**

- Button hierarchy and feedback patterns are consistent across screens.
- WCAG 2.2 AA baseline verified for all shipped journeys.
- Responsive behavior validated for mobile/tablet/desktop breakpoints.

**Tasks**

- FE: Cross-screen consistency fixes (CTA hierarchy, feedback patterns, state components).
- QA: Accessibility audit (keyboard, screen reader, contrast, focus order).
- QA: Responsive regression suite for defined breakpoints.
- Analytics: Ensure all core events fire from final UI states.

**Dependencies:** Core screens complete.

---

## 4) Cross-Epic Technical Task Set (Mandatory)

- TECH-01 Event instrumentation for all CTA/state transitions in wireframes.
- TECH-02 Shared component library implementation (`DiagnosisStepper`, `SkillGapPanel`, `RecommendationCard`, `NextActionModule`, `TrustBlock`, `ContinuationRail`).
- TECH-03 Error/loading/empty/success state framework.
- TECH-04 Feature flag controls for staged rollout of new flows.
- TECH-05 E2E smoke suite for conversion loop (Home -> Diagnosis -> Recommendation -> Checkout).

---

## 5) Dependency Map (Execution-Critical)

- UX-01.* must complete before UX-02.*.
- UX-02.* must complete before UX-03.2.
- UX-04.1 depends on shared components from TECH-02.
- UX-05.* can run parallel with UX-04 after auth/session baseline.
- UX-06.1 can start after UX-01.3 and UX-02.1 context payloads exist.
- UX-07.2 is final hardening gate before release candidate.

---

## 6) Release Gate for Sprint 3 Completion

- Core conversion loop E2E pass rate >= agreed threshold.
- No P1 accessibility defects open on primary journeys.
- Pricing/schedule/auth/checkout branch behavior verified.
- Analytics events available for funnel reporting across key milestones.
- Consent and preference controls validated by QA/compliance review.

---

## 7) Recommended Task Board Columns

- Backlog
- Ready
- In Progress
- FE Review
- BE Review
- QA
- Done
- Blocked

---

## 8) Suggested Jira/Tracker Ticket Prefixes

- `UXE-EPIC-`* for epics
- `UXE-STORY-`* for stories
- `UXE-TASK-`* for engineering tasks
- `UXE-TEST-`* for QA suites

---

## 9) Definition of Done (Required for Every Story)

Use this checklist on every story ticket. A story is **not Done** until required items are complete with evidence attached.

### 9.1 UI Behavior (Required)

- UI matches approved wireframe/screen spec for story scope.
- Primary CTA behavior implemented as specified (including blocked/disabled states).
- Required states implemented: default, loading, success, error, empty (if applicable).
- Validation and error copy is clear, plain-language, and actionable.
- Responsive behavior validated at mobile/tablet/desktop breakpoints.
- UX consistency rules respected (button hierarchy, feedback pattern, navigation pattern).

**Evidence to attach**

- Screenshots or short recording of core flow.
- PR link showing changed UI/components.

### 9.2 API Contract (Required for API-touching Stories)

- Request/response schema matches story acceptance criteria.
- Error responses are explicit (status + typed payload).
- Edge cases handled (invalid input, unauthorized, timeout, missing state).
- Backward compatibility assessed (or migration plan documented).
- Contract/integration tests added or updated and passing.

**Evidence to attach**

- Schema/OpenAPI diff or contract snippet.
- Contract test results.

### 9.3 Analytics Event Instrumentation (Required)

- Required events implemented with agreed naming conventions.
- Event payload includes required context keys (user/session/journey/screen/state).
- Trigger points align to intended user actions and states.
- Events verified in dev/stage telemetry pipeline.
- Tracking documentation updated for new/changed events.

**Evidence to attach**

- Event names + payload schema in ticket comments.
- Telemetry/debug logs or screenshot proof.

### 9.4 Accessibility Checks (Required, WCAG 2.2 AA Baseline)

- Keyboard navigation works across all interactive controls in story scope.
- Focus order and visible focus states are correct.
- Semantic structure and labels are valid.
- Contrast meets AA requirements for text and controls.
- Dynamic content is announced correctly for assistive technologies.
- Mobile touch targets meet 44x44 minimum.
- Status communication is not color-only.

**Evidence to attach**

- Automated accessibility scan output.
- Manual keyboard + screen-reader test notes.

### 9.5 QA Evidence (Required)

- Test cases mapped to acceptance criteria and executed.
- Happy path, negative path, and edge-case scenarios covered.
- Regression checks for adjacent critical flows completed.
- No open Sev-1/Sev-2 defects linked to story scope.
- QA owner sign-off recorded.

**Evidence to attach**

- Test execution report.
- Defect links and closure notes.
- QA sign-off comment (name/date).

### 9.6 Engineering Quality (Required)

- PR reviewed and approved by required reviewers.
- CI checks pass (lint/test/build).
- Feature flags/config updates documented (if applicable).
- Observability added for critical failure points.
- Security/compliance checks in scope validated (auth/consent/PII).

**Evidence to attach**

- CI run link.
- PR approval link.
- Notes for flags/logging/compliance checks.

### 9.7 Story Closure Rule

A story can move to `Done` only when:

- All required checklist items are complete,
- Evidence links are attached in the ticket, and
- Product + QA acceptance is explicitly recorded.

If any required item is missing, the story remains in `Review`, `QA`, or `Blocked` (not `Done`).