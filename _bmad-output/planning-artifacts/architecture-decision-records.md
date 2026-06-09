# Architecture Decision Records (ADR Pack)

**Project:** The Agile Forum  
**Date:** 2026-05-27  
**Status:** Proposed baseline for implementation

---

## ADR-001: Hybrid Delivery Architecture (Wix + Product Services)

**Decision**  
Use Wix for public discovery/trust surfaces and a custom backend + product web app for diagnosis, dashboard, paid service flows, and AI orchestration.

**Why**  
- Preserve SEO/content velocity.
- Keep product intelligence and commerce logic in controlled services.
- Minimize MVP replatforming risk.

**Consequences**  
- Integration boundary must be explicit.
- Need consistent routing and analytics across channel split.

---

## ADR-002: Service-Oriented Domain Split over Monolithic Feature Handlers

**Decision**  
Implement domain-focused services (`diagnosis`, `recommendation`, `checkout`, `mentor-booking`, `webinar`, `ai-coach`, etc.) behind a single API gateway/BFF.

**Why**  
- Matches UX journey ownership.
- Reduces coupling across independent evolution tracks.
- Enables targeted scaling for high-load paths.

**Consequences**  
- Requires stable contract governance and cross-service observability.

---

## ADR-003: Single Source Pricing Resolver

**Decision**  
All payable surfaces must call a centralized pricing resolver service.

**Why**  
- Prevents pricing drift between recommendation, offer page, and checkout.
- Supports geo-aware consistency.

**Consequences**  
- Checkout must reject stale or mismatched client-side pricing.

---

## ADR-004: Paid Mentor Booking with Geo Pricing

**Decision**  
Mentor/discovery call booking is a paid flow:
- US: `USD 9`
- India: `INR 49`
with auto-detect and user override, validated server-side.

**Why**  
- Updated business requirement.
- Aligns mentor call with paid value framing and commerce instrumentation.

**Consequences**  
- Adds payment dependency to booking flow.
- Requires quote validation and fraud-safe pricing enforcement.

---

## ADR-005: Async Orchestration for Analysis/Notifications

**Decision**  
Use queue-based workers for long-running and fan-out work (analysis jobs, reminders, confirmations, webhooks, certificate tasks).

**Why**  
- Protects user-facing latency.
- Improves reliability with retries and DLQ.

**Consequences**  
- Must implement idempotency and replay procedures.

---

## ADR-006: Primary Action Contract

**Decision**  
Recommendation/result payloads must always return a deterministic `primary_action` plus optional alternatives.

**Why**  
- Core UX principle: reduce decision fatigue and dead ends.

**Consequences**  
- Recommendation service requires ranking/priority rules and fallback handling.

---

## ADR-007: Resumable Journey State

**Decision**  
Persist journey state for diagnosis, dashboard tasks, mentor booking, and checkout so users can resume cross-session.

**Why**  
- Directly supports UX requirement "continue where you left off".

**Consequences**  
- Requires state model and recovery-safe transitions.

---

## ADR-008: Accessibility Baseline at WCAG 2.2 AA

**Decision**  
Adopt WCAG 2.2 AA as non-negotiable baseline for all MVP core journeys.

**Why**  
- Required by UX/NFR baseline.
- Reduces later retrofit costs.

**Consequences**  
- Stories must include keyboard, focus, contrast, and assistive-tech evidence in DoD.

---

## ADR-009: AI Guardrail Gateway

**Decision**  
All AI responses route through policy/guardrail middleware enforcing claims, compliance, confidence scoring, and escalation hooks.

**Why**  
- Prevent unsafe or non-compliant guidance.
- Required for trust and operational governance.

**Consequences**  
- Increased response processing complexity; requires quality telemetry.

---

## ADR-010: Event Contract Governance

**Decision**  
Adopt canonical event envelope and strict schema validation for product and ops events.

**Why**  
- Ensures analytics reliability and automation determinism.

**Consequences**  
- Event schema changes must be versioned and reviewed.

---

## ADR-011: Incremental Rollout with Feature Flags

**Decision**  
High-risk capabilities (AI behavior changes, automation policies, new checkout branches) release behind feature flags.

**Why**  
- Safer deployment and rollback.

**Consequences**  
- Requires flag lifecycle management and cleanup discipline.

---

## ADR-012: Contract-First Development for Core Journeys

**Decision**  
For diagnosis, recommendation, paid mentor booking, and checkout, API and event contracts are defined before UI completion.

**Why**  
- Reduces FE/BE integration churn.
- Enables parallel implementation.

**Consequences**  
- Requires contract review cadence in sprint rituals.

---

## Change Control

When an ADR is superseded:
1. Add new ADR with superseding reference.
2. Mark old ADR as `Superseded`.
3. Update impacted docs (`solution-architecture-aligned-to-ux.md`, `api-contract-matrix.md`, sprint backlog).
