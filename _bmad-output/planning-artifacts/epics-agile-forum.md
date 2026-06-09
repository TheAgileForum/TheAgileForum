---

## stepsCompleted:

- requirements-extracted
- epics-designed
- stories-defined
inputDocuments:
- "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/prd-agile-forum.md"

# mybmadproj - Epic Breakdown (Agile Forum MVP)

## Overview

This document translates `prd-agile-forum.md` into implementable MVP epics and stories with testable acceptance criteria.

## Requirements Inventory

### Functional Requirements

- Source of truth: `FR-1` to `FR-160` in `prd-agile-forum.md`.
- Key clusters included in MVP plan:
  - Identity/profile and diagnosis
  - Role X -> Role Y planner and roadmap
  - Learner dashboard, assessments, bookmarks
  - AI chat, feedback, and quality loop
  - Commerce and checkout variants
  - Course/service catalog detail completeness
  - Webinars, certificates, recordings/gallery
  - Community/social trust and engagement
  - Automation/notifications (including scholarships)
  - Admin command center and AI-native operations
  - Search visibility (SEO + AI-answer engines)
  - Tracking, observability, governance, cutover continuity

### Non-Functional Requirements

- Source of truth: `NFR-P1..P5`, `NFR-R1..R6`, `NFR-S1..S3`, `NFR-C1..C4`, `NFR-A1..A8`.
- MVP quality bars:
  - Mobile-first responsive UX
  - Reliable checkout/notification flows
  - Security/consent/compliance controls
  - AI safety guardrails and auditable quality improvements
  - Search-critical reliability (sitemap/canonical/schema jobs)

### Additional Requirements

- Role-specific AI enablement across all courses/services.
- Exam monetization policy: free skill assessments, paid mock certification exams.
- Schedule-bound offerings require schedule selection before cart add.
- Organization payment/reimbursement checkout path for eligible SAFe offerings.

### UX Design Requirements

- Current-state dashboard with bar/radar options, out-of-10 scoring, and accessible non-visual views.
- Trust surfaces and conversion CTAs across journey stages.
- Footer completeness for legal/policy/affiliate/partnership/contact/social.

### FR Coverage Map


| Epic    | FR Coverage (primary)                                     |
| ------- | --------------------------------------------------------- |
| Epic 1  | FR-1..3, FR-151                                           |
| Epic 2  | FR-4..7, FR-61..64, FR-158..160                           |
| Epic 3  | FR-8..11, FR-131, FR-132                                  |
| Epic 4  | FR-12..16, FR-85..87, FR-157                              |
| Epic 5  | FR-20..22, FR-88..91, FR-126..130                         |
| Epic 6  | FR-108..116, FR-140..143, FR-136..139                     |
| Epic 7  | FR-30..34, FR-79..84, FR-49..51                           |
| Epic 8  | FR-17..19, FR-23..29, FR-35..41, FR-121..125, FR-144..146 |
| Epic 9  | FR-52..60, FR-133..135, FR-147..150, FR-154..156          |
| Epic 10 | FR-65..78, FR-92..95                                      |
| Epic 11 | FR-96..107                                                |
| Epic 12 | FR-42..45, FR-46..48, NFR clusters                        |


### PRD Recheck Result (Coverage Status)

- Recheck complete against `prd-agile-forum.md` FR/NFR inventory.
- Previously under-traced areas were `FR-17..19`, `FR-35..41`, and explicit `FR-108..111` mapping.
- This revised epic/story set now includes those gaps via Epic 6 and Epic 8 story expansions and technical tasks.
- NFR coverage remains primarily enforced through Epics 10-12 technical layers.

## Epic List

1. Identity and Access Foundation
2. Diagnosis and Transition Planner
3. Learner Dashboard and Assessments
4. Commerce and Checkout Flows
5. AI Chat, Guidance, and Quality Feedback
6. Role-Based Offerings and Course Detail Experience
7. Webinar Lifecycle and Attendance Artifacts
8. Community, Social Trust, and Public Site Framework
9. Automation, Notifications, and Re-engagement
10. Admin Command Center and AI-Native Operations
11. Search Growth Platform (SEO + GEO)
12. Cutover, Reliability, and Compliance Hardening

---

## Epic 1: Identity and Access Foundation

Establish secure onboarding, authentication, and checkout-gating identity patterns.

### Story 1.1: Email and OAuth Authentication

As a visitor, I want to sign up/login with email, Google, or LinkedIn so that I can access personalized flows.

**Acceptance Criteria**

- Given a new visitor, when they choose signup, then they can complete email registration with verification.
- Given a returning user, when they choose OAuth login, then session is created successfully.

### Story 1.2: Consent and Session Governance

As a platform operator, I want consent capture and active session control so that security/compliance requirements are met.

**Acceptance Criteria**

- Given a user onboarding flow, when consent is presented, then acceptance is stored with timestamp.
- Given an authenticated session, when token expires, then secure re-authentication is required.

### Story 1.3: Checkout Authentication Gate

As a non-logged-in visitor, I want to be prompted to sign in before checkout so that my order is correctly tied to my profile.

**Acceptance Criteria**

- Given a guest at checkout, when they proceed, then login/signup gate appears.
- Given successful auth, when checkout resumes, then cart context is preserved.

---

## Epic 2: Diagnosis and Transition Planner

Deliver resume/JD intelligence and Role X -> Role Y planning with actionable 4-8 week roadmaps.

### Story 2.1: Resume + JD Skill Gap Engine

As a learner, I want resume/JD comparison so that I can see my role-gap clearly.

**Acceptance Criteria**

- Given resume and optional JD input, when analysis runs, then system outputs skill-gap summary.
- Given output is generated, then recommendation-ready fields are persisted.

### Story 2.2: Resume Keyword and Skill Suggestions

As a learner, I want keyword/skill suggestions so that I can improve role-fit quickly.

**Acceptance Criteria**

- Given a target role, when analysis completes, then missing keywords and skills are suggested.
- Given user is not registered, when preview is shown, then detailed report is registration-gated.

### Story 2.3: Role X -> Role Y Planner

As a transition-focused learner, I want predefined role-path options so that I can choose a clear direction.

**Acceptance Criteria**

- Given selected current and target role, when planner loads, then predefined pathway options are shown.
- Given selected pathway, when plan renders, then training/exams/certs and todo tasks are sequenced.

### Story 2.4: 4-8 Week Roadmap and Progress Tracking

As a registered learner, I want a 4-8 week plan with task tracking so that I can execute consistently.

**Acceptance Criteria**

- Given a confirmed pathway, when roadmap is generated, then 4-8 week timeline is visible.
- Given user actions, when tasks are updated, then progress status persists over time.

---

## Epic 3: Learner Dashboard and Assessments

Create role-aware learner cockpit for current state, progress, and saved decisions.

### Story 3.1: Current-State Dashboard Visuals

As a learner, I want current-state skill views so that I can understand readiness at a glance.

**Acceptance Criteria**

- Given learner profile data, when dashboard loads, then out-of-10 ratings are shown.
- Given visualization preference, when toggled, then bar/radar mode updates with accessible equivalents.

### Story 3.2: Free Skill Assessment Micro-Exams

As a learner, I want free skill assessment exams so that I can validate progress.

**Acceptance Criteria**

- Given skill-assessment catalog, when learner starts exam, then no payment is required.
- Given exam completion, when scored, then profile and recommendations update.

### Story 3.3: Bookmarking Courses and Services

As a learner, I want to bookmark offerings so that I can revisit options later.

**Acceptance Criteria**

- Given listing/dashboard cards, when bookmark is clicked, then item appears in saved list.
- Given saved list entry, when removed, then bookmark state updates everywhere.

---

## Epic 4: Commerce and Checkout Flows

Implement conversion-focused cart/checkout behaviors with policy-compliant variants.

### Story 4.1: Core Cart and Payment Flow

As a learner, I want a consistent cart/checkout so that I can purchase confidently.

**Acceptance Criteria**

- Given an eligible paid offering, when added to cart, then localized pricing is shown consistently.
- Given successful payment, when confirmed, then invoice and enrollment artifacts are generated.

### Story 4.2: Schedule-Bound Cart Enforcement

As a learner, I want to attach schedule before cart add for schedule-bound services.

**Acceptance Criteria**

- Given schedule-bound offering, when add-to-cart is attempted without schedule, then action is blocked.
- Given selected schedule, when add-to-cart completes, then schedule reference is stored in cart payload.

### Story 4.3: Exam Access Policy Enforcement

As a product owner, I want free-vs-paid exam rules enforced so that pricing policy is clear and correct.

**Acceptance Criteria**

- Given skill assessment exam, when user accesses, then it is free.
- Given mock certification exam, when user accesses, then paid checkout is required first.

### Story 4.4: Organization Payment Checkout Variant

As a SAFe buyer, I want organization reimbursement checkout option so that enterprise-funded purchases are supported.

**Acceptance Criteria**

- Given eligible SAFe item in cart, when checkout loads, then org-payment option is visible.
- Given org-payment flow selected, when form submitted, then company/billing/reference details are captured and routed to ops.

---

## Epic 5: AI Chat, Guidance, and Quality Feedback

Ship conversion-capable AI assistant with guardrails and closed-loop quality improvement.

### Story 5.1: AI Assistant Across Key Surfaces

As a visitor/learner, I want contextual AI help wherever I need it.

**Acceptance Criteria**

- Given landing/discovery/dashboard/support pages, when opened, then AI assistant is available.
- Given low-confidence answer case, when detected, then escalation path is offered.

### Story 5.2: Conversion-Oriented AI with Compliance Guardrails

As a business owner, I want AI to recommend paid services responsibly.

**Acceptance Criteria**

- Given high-intent context, when AI responds, then paid service recommendations are role-relevant.
- Given outcome claims, when mentioned, then compliant non-guarantee framing is enforced.

### Story 5.3: End-User Answer Quality Feedback

As a user, I want to mark answers as correct/helpful or not so that chatbot quality improves.

**Acceptance Criteria**

- Given any assistant response, when feedback is submitted, then signal is captured with optional comments.
- Given negative feedback, when submitted, then clarification + escalation options are offered.

### Story 5.4: AI Quality Intelligence Dashboard

As an admin, I want topic/role-level AI quality metrics so that I can prioritize improvements.

**Acceptance Criteria**

- Given collected feedback, when dashboard viewed, then helpfulness/unresolved metrics are segmented.
- Given low-performing response clusters, when reviewed, then corrective actions can be approved.

---

## Epic 6: Role-Based Offerings and Course Detail Experience

Ensure every offering is role-aware, complete, and decision-ready.

### Story 6.1: Role-Specific Offer Metadata and Mapping

As an admin, I want role-to-offering mappings managed centrally so recommendations stay accurate.

**Acceptance Criteria**

- Given a course/service, when configured, then target role metadata is required.
- Given new/updated offerings, when published, then mapping validation passes.

### Story 6.2: Role-Specific Mock Interview Services

As a learner, I want role-wise mock interviews so that prep is specific to my target role.

**Acceptance Criteria**

- Given target roles (SM/PO/PM/RTE), when catalog viewed, then role-specific mock interview services are available.
- Given booking completion, when tracked, then role-wise funnel metrics update.

### Story 6.3: Complete Course Details Package

As a buyer, I want brochure, schedule, fees, and details for each course.

**Acceptance Criteria**

- Given any course page, when opened, then downloadable brochure is available.
- Given schedule-bound courses, when viewed, then upcoming schedule + timezone + mode details are shown.
- Given pricing section, when viewed, then fees/inclusions/payment details are transparent.

### Story 6.4: Popularity and Best Seller Signals

As a visitor, I want uptake counts and bestseller tags so that trust improves.

**Acceptance Criteria**

- Given offering cards, when rendered, then learner uptake counts are displayed from verified analytics.
- Given ranking rules met, when evaluated, then bestseller tags appear with governance controls.

### Story 6.5: Role-Specific AI Enablement Across Offerings and Journeys

As a learner, I want all courses/services to provide role-specific AI guidance so that recommendations are relevant to my target role.

**Acceptance Criteria**

- Given any service/course offering, when published, then target role, prerequisites, outcomes, and recommended sequence metadata are present.
- Given learner role intent, when AI guidance runs across diagnosis/dashboard/webinar/assessment/service pages, then role-specific next-best-actions are returned.
- Given catalog updates, when admin validates mappings, then role-to-offering AI enablement remains complete and auditable.

---

## Epic 7: Webinar Lifecycle and Attendance Artifacts

Manage webinar discovery, participation, post-session feedback, and artifacts.

### Story 7.1: Webinar Discovery and Registration

As a user, I want to discover/register webinars easily from key surfaces.

**Acceptance Criteria**

- Given homepage and key pages, when loaded, then upcoming webinar module is visible.
- Given registration action, when completed, then confirmation/reminder notifications are sent.

### Story 7.2: Attendance Code and Certificate Self-Service

As an attendee, I want to mark attendance and receive certificates in dashboard.

**Acceptance Criteria**

- Given webinar completion, when user enters end-code in dashboard, then attendance is verified.
- Given eligibility met, when certificate requested, then status and downloadable certificate are available.

### Story 7.3: Feedback and Next-Session Recommendations

As an attendee, I want to give feedback and get next-session recommendations.

**Acceptance Criteria**

- Given post-session flow, when survey submitted, then rating/comments are stored.
- Given survey + profile context, when processed, then recommended next sessions are shown.

### Story 7.4: Recording Library and Photo Gallery

As a prospect/learner, I want to browse webinar recordings and event galleries.

**Acceptance Criteria**

- Given webinar hub/homepage surfaces, when viewed, then recording and gallery modules are discoverable.
- Given content interactions, when tracked, then conversion attribution to downstream journeys is available.

---

## Epic 8: Community, Social Trust, and Public Site Framework

Strengthen trust and discovery through community and social channels.

### Story 8.1: Community Discovery and Benefits

As a learner, I want to join official communities and receive member benefits.

**Acceptance Criteria**

- Given high-intent surfaces, when viewed, then official community links are visible.
- Given membership join, when completed, then benefit visibility and re-entry CTAs are shown.

### Story 8.2: Social Trust Modules and Routing

As a visitor, I want to verify active social presence before buying.

**Acceptance Criteria**

- Given trust pages, when loaded, then official social profiles and curated proof modules are displayed.
- Given social CTA click, when user returns, then conversion path resumes with attribution.

### Story 8.3: Footer and Public Information Completeness

As a visitor, I want complete legal/policy/contact/footer links so trust is clear.

**Acceptance Criteria**

- Given any public page, when footer loads, then policy/T&C/affiliate/partnership/contact/social links are present.
- Given footer links, when clicked, then destinations are valid and trackable.

### Story 8.4: Core Public Pages and Inquiry Forms

As a visitor, I want complete About/Contact/FAQ and inquiry forms so that I can trust the platform and ask questions easily.

**Acceptance Criteria**

- Given website navigation, when user opens core info pages, then About, Contact Us, and FAQ pages are accessible and searchable where applicable.
- Given inquiry intent, when forms are submitted (general/coaching/partnership/webinar), then submissions are tracked and routed for follow-up.
- Given form-origin leads, when reviewed in ops, then attribution data links form submission to downstream funnel outcomes.

### Story 8.5: Discovery Call Booking and Interview-Question Hubs

As a registered learner, I want paid discovery/mentor call booking with geo-priced fees and role-tagged interview-question pages so that I can plan my next steps.

**Acceptance Criteria**

- Given an authenticated learner, when discovery-call booking is opened, then slot-based scheduling with geo-priced fee display is available (`$9` for USA, `INR 49` for India).
- Given booking confirmation, when payment is submitted, then the system validates geo/currency and records a paid booking.
- Given interview-question content, when published via blogs, then pages are organized by role/certification/difficulty and remain discoverable from conversion surfaces.

### Story 8.6: Editorial, Claims, and Proof Governance

As a content/compliance operator, I want editorial and claims governance so that trust statements remain evidence-backed and compliant.

**Acceptance Criteria**

- Given conversion-page copy updates, when published, then approved terminology and copy quality checks pass.
- Given outcome/claims content, when rendered publicly, then evidence links or compliant disclaimers are enforced.
- Given testimonial/proof assets, when reused across pages, then governed asset references and approval history are maintained.

---

## Epic 9: Automation, Notifications, and Re-engagement

Build always-on personalized engagement and operational messaging.

### Story 9.1: Interest-Based Always-On Campaigns

As a user, I want relevant notifications based on selected interests.

**Acceptance Criteria**

- Given user interests/preferences, when campaigns run, then content/channel/frequency align with preferences.
- Given preference updates, when saved, then downstream campaigns adapt.

### Story 9.2: Re-engagement and Cart Recovery

As a non-converting learner, I want relevant nudges to return and complete action.

**Acceptance Criteria**

- Given abandoned cart or inactivity, when trigger rules match, then reminders are sent with deep links.
- Given 3-day no-action window, when configured, then limited-time offer nudges can be sent.

### Story 9.3: Scholarship and Financial Aid Campaigns

As an eligible non-buyer, I want scholarship/aid outreach options.

**Acceptance Criteria**

- Given eligible segment rules, when campaign runs, then scholarship/aid email is sent.
- Given aid email CTA, when clicked, then intake flow starts and conversion is tracked.

### Story 9.4: Enrollment Notifications to Ops (Email + Telegram)

As an ops/admin team, I want immediate enrollment alerts with payment details.

**Acceptance Criteria**

- Given successful enrollment, when event occurs, then notifications go to configured admin emails and Telegram.
- Given delivery failures, when detected, then retry/status visibility is available.

### Story 9.5: Student Order Confirmation with Resources

As a learner, I want post-order resources and group links.

**Acceptance Criteria**

- Given successful order, when confirmation is sent, then curated resources and official group join links are included.
- Given offering type, when assembling content, then resources are context-relevant.

---

## Epic 10: Admin Command Center and AI-Native Operations

Give operations teams governed AI-assisted control of growth, quality, and content.

### Story 10.1: Unified Admin Command Center

As an admin, I want one place to monitor journeys, campaigns, and funnel health.

**Acceptance Criteria**

- Given admin dashboard, when opened, then key health/conversion metrics are visible.
- Given anomalies, when detected, then probable-cause insights are surfaced.

### Story 10.2: Campaign Governance and Human-in-the-Loop Controls

As an admin, I want controlled automation approvals for high-impact actions.

**Acceptance Criteria**

- Given high-impact campaign, when configured, then approval workflow is required before execution.
- Given approved changes, when deployed, then audit trail is recorded.

### Story 10.3: Knowledge Base Evolution and Validation

As an admin, I want AI-suggested KB updates with human validation.

**Acceptance Criteria**

- Given new learnings/research signals, when AI proposes updates, then proposals require review/approval.
- Given approved update, when published, then provenance/version metadata is stored and rollback is possible.

### Story 10.4: Prompt/Policy and Experiment Governance

As an AI operator, I want versioned prompt/policy management and safe experiments.

**Acceptance Criteria**

- Given prompt/policy changes, when submitted, then versioning + review workflow applies.
- Given experiment rollout, when enabled, then flags and rollback controls are available.

---

## Epic 11: Search Growth Platform (SEO + GEO)

Operationalize organic discoverability across search and AI-answer engines.

### Story 11.1: Search Command Center and Diagnostics

As a growth operator, I want indexing/diagnostic visibility.

**Acceptance Criteria**

- Given search integrations, when data syncs, then crawl/index/schema issues are visible.
- Given critical issue detection, when triggered, then alerting workflow activates.

### Story 11.2: Structured Data and AI-Citable Content

As a content team, I want schema + answer blocks to improve visibility.

**Acceptance Criteria**

- Given page templates, when rendered, then required schema is generated and validated.
- Given priority pages, when authored, then concise Q&A/summary blocks are present.

### Story 11.3: Keyword-to-Page Intent Mapping

As an SEO owner, I want priority keyword cluster coverage with CTA mapping.

**Acceptance Criteria**

- Given target keyword clusters, when mapped, then each keyword has target page + CTA + fallback CTA.
- Given reporting interval, when measured, then rankings/CTR/conversion are available per cluster.

### Story 11.4: Programmatic Landing and Optimization Loop

As a growth team, I want scalable landing pages and snippet experiments.

**Acceptance Criteria**

- Given high-intent variants, when generated, then canonical/duplication rules are enforced.
- Given experiments, when run, then impact on traffic and conversion is measurable.

---

## Epic 12: Cutover, Reliability, and Compliance Hardening

Ensure safe launch, operational resilience, and policy compliance.

### Story 12.1: URL, SEO, and Migration Continuity

As a migration lead, I want redirect/canonical continuity so traffic and trust are preserved.

**Acceptance Criteria**

- Given legacy URLs, when accessed, then mapped redirects resolve with no dead ends.
- Given migration period, when monitored, then 404/5xx spikes trigger alerting and response.

### Story 12.2: Reliability and Notification Resilience

As an operator, I want retry-safe notification/automation and monitored critical assets.

**Acceptance Criteria**

- Given notification failures, when encountered, then retries and dead-letter handling are applied.
- Given search-critical assets and checkout endpoints, when unhealthy, then alerts and recovery runbooks execute.

### Story 12.3: Compliance, Accessibility, and AI Guardrails

As a governance owner, I want legal/consent/accessibility and AI safety controls enforced.

**Acceptance Criteria**

- Given user interactions, when communications occur, then consent/unsubscribe and preference controls are respected.
- Given AI messaging, when outcome claims are generated, then disallowed guarantee language is blocked and disclaimers are enforced.

---

## Architecture, Enabler, and Technical Stories (MVP Detailed)

This section adds non-functional delivery work that must run alongside product stories.

## Epic 1 Technical Layer (Identity and Access Foundation)

### Architecture Story A1.1: Auth Architecture Baseline

As a solution architect, I want a standardized auth/session architecture so that all user journeys use one secure identity model.

### Enabler Story E1.1: Identity Integration Enabler

As an engineering team, we need reusable auth middleware and guards so that features can enforce auth consistently.

### Technical Tasks

- T1.1 Create auth service contract (signup/login/OAuth/session/refresh/logout).
- T1.2 Implement JWT/session lifecycle policy with expiry and refresh semantics.
- T1.3 Implement RBAC primitives (visitor, learner, admin, mentor, support, super-admin).
- T1.4 Add consent capture + audit columns to user/auth tables.
- T1.5 Add route guards for checkout-auth requirement.
- T1.6 Add integration tests for auth happy path and failure states.

## Epic 2 Technical Layer (Diagnosis and Transition Planner)

### Architecture Story A2.1: Career Intelligence Data Model

As an architect, I want a normalized role/skill/pathway model so that planners and recommendations are explainable.

### Enabler Story E2.1: Transition Pathway Catalog Enabler

As product+engineering, we need seedable Role X->Y pathway definitions so that roadmap generation is deterministic.

### Technical Tasks

- T2.1 Define entities: roles, skills, pathway templates, tasks, certs, exams, trainings.
- T2.2 Implement resume/JD ingestion pipeline interface and result storage.
- T2.3 Build pathway selection API returning predefined options with metadata.
- T2.4 Build 4-8 week timeline generation logic with ordered todo items.
- T2.5 Build progress tracking state machine for roadmap tasks.
- T2.6 Add explainability fields (why recommended) for pathway items.

## Epic 3 Technical Layer (Learner Dashboard and Assessments)

### Architecture Story A3.1: Dashboard View-Model Service

As an architect, I want a composable dashboard view-model API so UI can render charts/accessibility views consistently.

### Enabler Story E3.1: Visualization and Accessibility Enabler

As frontend engineering, we need reusable chart + accessibility components for bar/radar + text/table fallbacks.

### Technical Tasks

- T3.1 Implement dashboard aggregate endpoint (scores, trends, saved items, recommendations).
- T3.2 Build chart adapter supporting bar/radar mode switches.
- T3.3 Build accessible summary/table fallback component.
- T3.4 Implement bookmark persistence and sync endpoints.
- T3.5 Implement micro-exam session service for free assessments.
- T3.6 Add dashboard performance caching strategy.

## Epic 4 Technical Layer (Commerce and Checkout Flows)

### Architecture Story A4.1: Commerce Workflow Architecture

As an architect, I want clear checkout state transitions so standard and org-reimbursement flows are reliable.

### Enabler Story E4.1: Payments and Schedule Validation Enabler

As engineering, we need reusable validators for schedule-bound add-to-cart and payment route branching.

### Technical Tasks

- T4.1 Define cart schema including attached schedule reference.
- T4.2 Implement schedule-required validation on add-to-cart.
- T4.3 Implement paid/free exam gating middleware.
- T4.4 Implement SAFe org reimbursement checkout branch.
- T4.5 Implement Stripe webhook idempotency and retry handling.
- T4.6 Implement invoice + enrollment event publication.

## Epic 5 Technical Layer (AI Chat, Guidance, Quality Feedback)

### Architecture Story A5.1: AI Orchestration and Safety Layer

As an architect, I want a central AI orchestration layer so prompt policy, guardrails, and routing are controlled.

### Enabler Story E5.1: Feedback Intelligence Enabler

As AI operations, we need a closed-loop feedback ingestion and triage workflow for response quality evolution.

### Technical Tasks

- T5.1 Build chat orchestration API with context retrieval + response policy enforcement.
- T5.2 Implement conversion-safe claim templates and disclaimer injection.
- T5.3 Implement per-message helpful/correct feedback capture.
- T5.4 Implement unresolved detection and escalation routing.
- T5.5 Build AI quality dashboard query model by topic/role/journey.
- T5.6 Add prompt versioning and approval hooks.

## Epic 6 Technical Layer (Role-Based Offerings and Course Detail)

### Architecture Story A6.1: Offering Metadata and Catalog Model

As an architect, I want a role-aware catalog schema so recommendations and page rendering remain consistent.

### Enabler Story E6.1: Course Detail Publishing Enabler

As content ops, we need a standard course detail schema (brochure/schedule/fees/etc.) enforced by CMS workflows.

### Technical Tasks

- T6.1 Define offering metadata schema (role tags, prerequisites, outcomes, sequence).
- T6.2 Build role-mapping validation checks at publish time.
- T6.3 Implement course detail schema validator (brochure/schedule/fees/details).
- T6.4 Implement popularity metrics ingestion and bestseller rule engine.
- T6.5 Implement role-specific mock interview service templates.
- T6.6 Add admin override/audit log for tags and mappings.
- T6.7 Implement role-aware AI recommendation resolver across diagnosis/dashboard/webinar/assessment/offer surfaces.
- T6.8 Build admin completeness checker for role AI-enablement coverage of all active offerings.

## Epic 7 Technical Layer (Webinar Lifecycle)

### Architecture Story A7.1: Webinar Event and Artifact Architecture

As an architect, I want one webinar domain model for schedule, attendance, feedback, certificates, recordings.

### Enabler Story E7.1: Attendance Verification Enabler

As operations, we need secure attendance-code verification in dashboard self-service.

### Technical Tasks

- T7.1 Implement webinar schedule and registration services.
- T7.2 Implement attendance code issue/verify pipeline.
- T7.3 Implement certificate eligibility and generation job.
- T7.4 Implement post-session feedback + recommendation service.
- T7.5 Implement recording/gallery publishing service with moderation fields.
- T7.6 Add webinar analytics event producers.

## Epic 8 Technical Layer (Community and Social Trust)

### Architecture Story A8.1: Trust Surface Composition Architecture

As an architect, I want composable trust widgets so social/community proof remains consistent sitewide.

### Enabler Story E8.1: Social Channel Governance Enabler

As marketing ops, we need controlled management of official social links and embeds.

### Technical Tasks

- T8.1 Implement global trust widget registry (social links, proofs, footer links).
- T8.2 Implement social CTA tracking and return-attribution hooks.
- T8.3 Implement footer link policy validator (legal/policy/T&C/affiliate/partnership/contact).
- T8.4 Implement community link configuration by page context.
- T8.5 Add monitoring for broken social/footer destinations.
- T8.6 Implement core page templates and form-routing pipeline (About/Contact/FAQ/inquiry forms) with attribution IDs.
- T8.7 Implement registered-user discovery call slot-booking workflow with confirmation/reminder events.
- T8.8 Implement editorial/claims governance workflow with evidence-disclaimer enforcement and reusable proof-asset approvals.

## Epic 9 Technical Layer (Automation and Notifications)

### Architecture Story A9.1: Event-Driven Campaign Orchestration

As an architect, I want an event-driven campaign engine so triggers are consistent and extensible.

### Enabler Story E9.1: Multi-Channel Delivery Enabler

As platform engineering, we need unified delivery abstractions for email, Telegram, and future channels.

### Technical Tasks

- T9.1 Define canonical campaign trigger events and payload contracts.
- T9.2 Build orchestration rules engine (cart, inactivity, scholarship, interest, post-order).
- T9.3 Implement notification preference center + enforcement.
- T9.4 Implement admin enrollment alerts (multi-email + Telegram) with retries.
- T9.5 Implement delivery status tracking and dead-letter queue handling.
- T9.6 Build scholarship/aid intake conversion tracking pipeline.

## Epic 10 Technical Layer (Admin Command Center)

### Architecture Story A10.1: Admin Control Plane Architecture

As an architect, I want modular admin domains (campaigns, AI quality, content, alerts) with auditability.

### Enabler Story E10.1: Ops Workbench Enabler

As ops teams, we need triage queues and decision tooling for interventions/approvals.

### Technical Tasks

- T10.1 Build admin command center backend aggregation APIs.
- T10.2 Build anomaly detection and probable-cause scoring pipeline.
- T10.3 Build approval workflow service (high-impact actions).
- T10.4 Build intervention queue (at-risk users, escalations).
- T10.5 Build audit trail storage/query API.
- T10.6 Build role-based admin permissions model and tests.

## Epic 11 Technical Layer (Search Growth Platform)

### Architecture Story A11.1: Search Operations Architecture

As an architect, I want search diagnostics, schema generation, and content optimization in one system.

### Enabler Story E11.1: SEO/GEO Workflow Enabler

As growth/content teams, we need keyword mapping and refresh workflows with operational checks.

### Technical Tasks

- T11.1 Integrate search diagnostics ingestion (GSC/Bing/webmaster sources).
- T11.2 Implement schema generation/validation jobs by template.
- T11.3 Implement keyword-to-page/CTA mapping repository.
- T11.4 Implement content staleness detector and refresh task queue.
- T11.5 Implement snippet experiment framework with attribution.
- T11.6 Implement ranking and AI-answer referral reporting pipelines.

## Epic 12 Technical Layer (Cutover, Reliability, Compliance)

### Architecture Story A12.1: Launch and Reliability Guardrail Architecture

As an architect, I want explicit cutover and rollback control planes for safe migration.

### Enabler Story E12.1: Compliance and Observability Enabler

As platform governance, we need proactive compliance checks and full-stack observability.

### Technical Tasks

- T12.1 Build redirect map validation tool and pre-launch checker.
- T12.2 Implement sitemap/canonical/robots health monitors.
- T12.3 Implement alerting playbooks for 404/5xx/checkout regressions.
- T12.4 Implement security controls baseline checks (rate limit, captcha, upload validation).
- T12.5 Implement consent/unsubscribe compliance audits.
- T12.6 Implement backup/restore + disaster recovery drill tasks for MVP environments.

