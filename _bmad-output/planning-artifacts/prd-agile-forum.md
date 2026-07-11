---

## title: "Product Requirements Document: The Agile Forum (AI-Native Career Transformation)"

status: draft
created: "2026-05-25"
updated: "2026-05-25"
owner: "Dhirender"
workflowType: "prd"
inputDocuments:

- "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/product-brief-agile-forum.md"
- "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/product-brief-agile-forum-distillate.md"
- "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/must-have-priorities-agile-forum.md"
- "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/competitive-analysis-agile-forum.md"
- "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/current-state-analysis-theagileforum.md"
- "c:/Users/dhire/OneDrive/Documents/AgileForum/Requirement/The Agile Forum Product Requirements Document Prd.docx"

# Product Requirements Document - The Agile Forum

**Author:** Dhirender  
**Date:** 2026-05-25

## Executive Summary

The Agile Forum will evolve from a high-touch Wix-led training site into an AI-native career transformation platform for Agile and Product professionals. The MVP centers on a single conversion system: diagnose learner gaps fast, show progress in a learner dashboard, validate via timed micro-exams, and guide users to one best-fit paid offer with consistent pricing and trustworthy claims.

This PRD defines a full-site replacement of current public surfaces while preserving acquisition strengths (content, SEO, founder trust) and introducing productized personalization, measurement, and commerce reliability.

## Problem Statement

Current journey quality is constrained by manual counseling and long-form marketing pages. Visitors lack personalized confidence in what to buy next, and operations rely on fragmented flows between content, diagnostics, and purchase.

Key issues:

- No productized resume-to-role diagnosis funnel
- No persistent learner account/dashboard for progress and return visits
- No scalable, time-bound skills check-ins
- Inconsistent pricing/trust signals across surfaces
- Technical hygiene risks (for example sitemap reliability) and weak cutover readiness for a full replacement

## Product Vision

Deliver a guided, data-informed career growth platform where every learner can answer:

1. Where am I right now?
2. What should I do next?
3. Which paid path best matches my goal and constraints?

## Goals and Non-Goals

### Goals (MVP)

- Increase diagnosis completion, checkout starts, and paid conversions
- Create a repeatable post-diagnosis engagement loop (dashboard + micro-exam)
- Build a trust-first purchase experience with pricing and claims consistency
- Replace legacy pages with continuity controls (SEO redirects, legal parity, rollback safety)
- Establish event instrumentation for funnel truth and iteration
- Increase organic discoverability across Google, Bing, and AI-answer engines through structured content and technical quality.

### Non-Goals (MVP)

- Full LMS and course-authoring suite
- Community platform and webinar automation stack
- Heavy exam proctoring and anti-cheat infrastructure
- Enterprise SSO and multi-tenant enterprise controls
- Deep recruiter API ecosystem integrations

## Personas

- **Career switcher:** needs fast clarity and an actionable path into Agile/Product roles
- **Practicing Agile professional:** needs role advancement and measurable skill growth
- **IT professional pivoting:** needs confidence in certification and program fit
- **Entry-level learner:** needs guided progression and interview-oriented outcomes
- **Internal ops/marketing:** needs measurable funnels and fewer manual handoffs

## Project Classification

- **Project Type:** AI-enabled learning and career transformation platform (D2C first)
- **Domain:** Agile, Scrum, SAFe, Product/Program transformation careers
- **Complexity:** High (hybrid stack, AI integration, commerce, cutover)
- **Project Context:** Brownfield replacement of existing public website and business flows

## Success Criteria

### Business KPIs

- Increase paid enrollment conversion rate from diagnosis entrants
- Improve checkout completion rate
- Improve lead quality (diagnosis completion + profile completeness)

### Product KPIs

- Number of new users registered
- Diagnosis started/completed rate
- Resume upload rate
- Skills dashboard return usage
- Timed micro-exam completion rate
- Recommendation click-through rate
- Organic search impressions/clicks for priority intent pages
- AI-answer referral traffic and citation-attributed sessions
- Total services booked (overall and by service type)
- Total certifications/courses booked
- Visitor-to-customer conversion rate
- Webinar-attendee-to-customer conversion rate
- Total 1:1 coaching/discovery calls booked
- Total mock interviews booked (overall and by role)
- Social-channel click-through rate from trust surfaces
- Social-return conversion rate (users visiting social channels and returning to convert)
- AI chatbot answer helpfulness/accuracy score from end-user feedback
- AI chatbot unresolved-rate after first response

### Operational KPIs

- Checkout reliability (error and abandonment reduction)
- Sitemap/SEO health (200 availability, crawl integrity)
- Post-cutover 404/5xx incident rate
- AI and automation observability coverage
- Search indexing health (coverage, crawl errors, and rich-result validity)

## Scope

### MVP (Release 1)

1. Identity and profile (email + OAuth, consent-aware onboarding)
2. Productized diagnosis flow (goals, resume upload/paste, optional target role/JD)
3. Skill-gap output and program recommendation mapping
4. Learner dashboard with current-state skill views (bar chart and optional radar chart), out-of-10 scoring, accessible progress alternatives, and bookmarking for courses/services
5. Time-based micro-exams tied to skill model
6. Single guided purchase path and pricing consistency
7. Commerce integration (Stripe and/or migration bridge from existing flows)
8. Trust and quality layer (claims, copy, policy, pricing parity)
9. AI chatbot across key surfaces (marketing, discovery, support, learner guidance)
10. Community discovery and member-benefit layer (Meetup/WhatsApp/community links + perks)
11. Free sessions and webinar discovery module (homepage + all customer-facing pages)
12. Webinar registration and invite workflow for registered users (email confirmations/reminders)
13. Core trust and support pages (About, Contact Us, FAQ) with structured inquiry forms
14. Registered-user paid discussion/discovery call booking with coach (geo-priced: `$9` USA, `INR 49` India)
15. Webinar recording library + photo gallery with discovery surfaces for visitors and users
16. Interview-questions content pages via Wix blogs and category hubs
17. Funnel and event instrumentation
18. Full replacement cutover requirements (redirects, legal, continuity, rollback)
19. Resume intelligence suggestions funnel (skills + keyword optimization, registration-gated deep report, resume upgrade service offers)
20. Admin command center baseline (journey monitoring, campaign controls, human-in-the-loop approvals)
21. Search growth foundation (SEO + AI-engine discoverability) including schema, content structures, and indexing observability
22. Role-specific AI enablement across all courses and services (personalized guidance, recommendations, and outcomes by target role)
23. Role-specific mock interview services (Scrum Master, Product Owner, Product Manager, RTE, and related pathways) with booking and conversion tracking
24. Social trust and discovery layer (official social profile visibility, active social proof modules, and cross-channel conversion routing)
25. Role X -> Role Y transition planner with predefined pathways, suggested training/exams/certifications, actionable todos, and a 4-8 week roadmap timeline view

### Post-MVP (Release 2+)

- Bounded AI copilot expansion (deeper contextual assistance and memory)
- WhatsApp transactional/nurture orchestration
- Structured social proof engine and partner campaign variants
- Advanced experimentation and recommendation tuning
- AI-native admin copilot and semi-autonomous operations (with policy guardrails and approvals)
- Advanced search optimization automation (programmatic SEO at scale, snippet testing, and AI-citation optimization workflows)

### MVP Growth and Trust Surfaces (mandatory)

- Multiple conversion-focused landing pages for:
  - live project cohort mentorships
  - certification programs
  - skill assessments
  - practice/mock certification exams (paid)
- Dedicated interview-questions content hub using Wix blogs (role/certification categorized)
- Prominent "next free sessions and webinars" surfaces on homepage and all high-intent customer pages
- Webinar recording links and event photo gallery discoverable from homepage, webinar pages, and relevant user surfaces
- Lightweight promo popups/lightboxes for offers and campaigns with clear dismiss controls
- Corporate credibility marquee (logo carousel of target/mentor employer brands with approval controls)
- Outcome-led success story system (mentee transitions, role upgrades, salary-growth narratives with compliant proof framing)
- Beginner activation campaigns (coupon/freebie programs, contest or reward mechanics for free online sessions and 1:1 resume reviews linked to skill assessments)
- Pricing/access policy: only skill assessment exams are free; certification practice/mock exams are paid offerings.
- Priority keyword-cluster coverage for role training and career-transition intents (Scrum Master, Product Owner, Product Manager, and RTE pathways).

### Explicitly Out of Scope for MVP

- Full LMS platform, community, webinar automation
- Heavy proctoring, enterprise SSO, enterprise multi-tenant architecture

## Mandatory Must-Haves

### Tier A (must-have for first revenue-ready release)

- **A1 Productized diagnosis:** fast, low-friction flow producing personalized skill-gap and recommended offers
- **A2 Learner account + dashboard:** persistent skills snapshot and progress with accessibility fallbacks
- **A3 Time-based micro-exams:** short timed attempts to refresh skill profile and recommendations
- **A4 Single guided path to purchase:** one primary CTA with transparent, consistent pricing (INR/USD governance)
- **A5 Trust and quality layer:** terminology/copy hygiene, claims framework, testimonial-proof alignment
- **A6 Technical hygiene:** sitemap, mobile performance baseline, stable checkout, consent clarity

### Tier B (should-have soon after Tier A)

- **B1 Bounded AI assist:** RAG-grounded chat for FAQ, fit explanations, and report interpretation
- **B2 Email + staged WhatsApp:** consented nurture and transactional messaging with unsubscribe parity
- **B3 Structured social proof system:** reusable outcomes surfaced in post-diagnosis moments
- **B4 Analytics truth layer:** complete event instrumentation and operator reporting

## Full Site Replacement Requirements

These are acceptance-critical requirements for replacing current pages and legacy journeys.

### URL and SEO Continuity

- Maintain an approved redirect map for legacy URLs to new destinations
- Preserve indexability and canonical integrity
- Deliver reliable sitemap endpoints and monitor with Search Console

### Content and Information Architecture Continuity

- Classify each existing page as rewrite, merge, retain, or retire
- Ensure no high-intent page is dropped without mapped replacement
- Preserve core trust assets (founder authority, FAQs, outcomes narrative) with improved clarity

### Customer Continuity

- Define explicit policy for existing learners/customers (account migration vs re-invite)
- Preserve access to relevant receipts, purchase records, and support handoff paths
- Publish support playbooks for transition-related user confusion

### Legal and Policy Continuity

- Publish updated privacy, terms, refund/cancellation, and contact/support paths before cutover
- Ensure consent and policy language aligns with new data practices (resume and diagnostics data)

### Cutover and Rollback

- Define launch checklist for DNS/domain cutover and verification
- Define rollback triggers and a tested rollback procedure
- Set alert thresholds for 404 spikes, 5xx spikes, and checkout degradation

## User Journeys

### Journey Orchestration Rules

- Every journey must expose a clear **next-best-action** CTA to prevent dead ends.
- Anonymous visitors can discover value; registered users can book, save, and continue progress.
- AI chat, FAQ, and Contact support act as persistent fallback paths across all journeys.
- Community, webinars, and content are not side channels; they are connected re-entry points into diagnosis, offers, and coaching.

### Persona Alignment Matrix


| Persona                       | Primary Journeys                           | Secondary Journeys |
| ----------------------------- | ------------------------------------------ | ------------------ |
| Career switcher               | J1-J11                                     | J12-J16            |
| Practicing Agile professional | J1-J9, J11-J16                             | J10                |
| IT professional pivoting      | J1-J11                                     | J12-J16            |
| Entry-level learner           | J1-J11                                     | J12-J16            |
| Internal ops/marketing        | J1-J8, J12-J17 (enablement + optimization) | J9-J11             |


### Journey 1: Awareness Journey (MVP)

1. User discovers Agile Forum through search, social, referral, or partner channels.
2. User lands on role-aligned pages with trust signals (corporate marquee, success stories, founder credibility).
3. User can verify active brand presence through official social profile links and recent social proof highlights.
4. User sees clear CTAs to discovery, webinars, recordings, or social follow actions.

### Journey 2: Discovery and Exploration Journey (MVP)

1. User explores certifications, mentorships, free skill assessments, and paid mock/practice certification exam paths, all with role-specific AI context.
2. User compares options with AI-chat and FAQ support.
3. User moves to diagnosis, webinar registration, or discovery-call CTA.

### Journey 3: Webinar Recordings and Gallery Discovery Journey (MVP)

1. New visitor or registered user discovers recordings/photo gallery from homepage, webinar hub, and content pages.
2. User filters recordings by topic/role/certification.
3. User moves to session registration, diagnosis, or call booking CTA.

### Journey 4: Free Sessions and Webinar Participation Journey (MVP)

1. User sees upcoming free sessions/webinars on homepage and key customer pages.
2. User views session schedule and eligibility.
3. Registered user books and receives email confirmation/reminder invites.
4. After attendance, learner opens student dashboard self-service, enters webinar end-code, and marks attendance.
5. Learner fills feedback survey and can indicate interest in a free certificate of attendance.
6. System recommends next relevant sessions based on attendance topic, survey response, and user goals.
7. Post-session follow-up routes user to diagnosis, mentorship, certification, assessment path, and certificate/download actions where eligible.

### Journey 5: Skill Gap Analysis Journey (MVP)

1. User submits resume and optional target JD/role.
2. System performs analysis and produces skill-gap + roadmap.
3. System surfaces resume skill and keyword suggestions that improve role fit.
4. User can select Role X -> Role Y transition intent and view predefined transition pathway options.
5. System presents a 4-8 week planner view with suggested trainings, exams, certifications, and prioritized todo items.
6. Visitor is encouraged to register to unlock detailed report, saved roadmap, and actionable checklist progress.
7. System routes user to best-fit training, assessment, and resume-upgrade service options.

### Journey 6: Trust and Evaluation Journey (MVP)

1. User reviews outcomes proof, testimonials, FAQs, and coach credibility.
2. User validates recommendation rationale and pricing confidence.
3. User proceeds to purchase or books a discovery call.

### Journey 7: Purchase Decision Journey (MVP)

1. User sees one primary recommendation CTA with localized pricing.
2. For schedule-bound services/courses, user selects a defined schedule before item can be added to cart.
3. User applies eligible coupons/freebies and confirms selection.
4. If user is not logged in, user is prompted to sign up/login before checkout continuation.
5. For eligible SAFe certification carts, user can choose "checkout for organization payment/reimbursement" to enter a separate custom checkout path.
6. User moves to appropriate checkout flow.

### Journey 8: Payment and Order Journey (MVP)

1. User completes payment via reliable checkout.
2. User receives order confirmation, invoice/receipt, and enrollment status.
3. Student order confirmation includes curated resource links and official group/community join links relevant to purchased offering.
4. System sends enrollment and payment notifications to configured admin channels (email and Telegram) for operational follow-through.
5. User is routed into onboarding.

### Journey 9: Onboarding Journey (MVP-lite)

1. Newly enrolled learner reaches welcome dashboard.
2. Learner sees current-state skill ratings (out of 10) via bar/radar visual views with accessible text/table equivalents.
3. Learner can bookmark relevant courses/services for later decision and follow-up.
4. Learner receives recommendations for sessions, assessments, and learning content.

### Journey 10: Discovery Call Booking Journey (MVP)

1. Registered user books a paid discussion/discovery call with coach, with geo-priced fee display (`$9` USA, `INR 49` India).
2. User submits goals/questions and receives invite details by email.
3. Post-call recommendations push the user to next paid or learning action.

### Journey 11: AI Guided Learning Journey (MVP-lite)

1. Learner receives AI-guided next steps.
2. Learner tracks progress and completes timed micro-exams.
3. User is routed to advanced recommendations or support where needed.

### Journey 12: Community and Member Benefits Journey (MVP)

1. User discovers Meetup/WhatsApp/community links from landing and dashboard surfaces.
2. User joins official channels and unlocks member benefits.
3. Community engagement drives re-entry into webinar, diagnosis, and conversion journeys.

### Journey 13: Help and Support Journey (MVP-lite)

1. User seeks help through AI support, FAQ, About, and Contact flows.
2. User submits structured forms when needed; unresolved issues escalate to human support.
3. Resolution flow returns user to active conversion or learning journey.

### Journey 14: Re-engagement and Smart Nudges Journey (MVP)

1. System detects inactivity in funnel or learning progress (including abandoned cart).
2. User receives personalized reminders via consented channels with deep links to resume progress.
3. If no action is taken for 3 days after key intent events, system can send a limited-time discount nudge (for example "valid today only") under campaign guardrails.
4. For non-buying learners in eligible segments, system can trigger scholarship/financial-aid application nudges.
5. User re-enters at the most relevant step (checkout, session, diagnosis, call, offer, or aid-application flow).

### Journey 15: Upsell and Expansion Journey (Post-MVP, Release 2)

1. Learner completes milestone/certification.
2. System recommends next-level pathways and bundled offers.
3. Learner converts to higher-value offerings.

### Journey 16: Advocacy and Referral Journey (Post-MVP, Release 2+)

1. Learner records achievement and transition outcomes.
2. User contributes testimonial/review/referral.
3. Referred users re-enter Journey 1 or Journey 2.

### Journey 17: Cutover-Safe Legacy User Experience (MVP)

1. Legacy URL visits resolve via mapped redirects with no dead ends.
2. Users retain access to trust, policy, support, and key conversion paths.
3. Migration flow preserves continuity for existing users while routing them into current journeys.

### Admin and Management Journeys (AI-Native)

### Journey 18: Admin Funnel Monitoring and Health Journey (MVP)

1. Ops/marketing admin views live funnel health and conversion checkpoints across key journeys.
2. System highlights anomalies (drop in registrations, checkout failures, engagement decay) with AI-generated probable causes.
3. Admin triggers remediation actions (campaign tweak, CTA update, support intervention, escalation).

### Journey 19: Campaign and Notification Orchestration Journey (MVP)

1. Admin configures rules for abandoned cart, inactivity nudges, webinar reminders, and discount campaigns.
2. AI suggests best timing, segment, and channel based on historical performance and consent constraints.
3. Admin approves or edits suggested automation; system executes and reports outcomes.

### Journey 20: Content and Conversion Surface Governance Journey (MVP)

1. Admin manages marquee logos, success stories, webinar schedule cards, recording links, and promo popups.
2. AI flags stale, broken, or low-performing content and suggests replacements.
3. Admin publishes updates and monitors conversion lift.

### Journey 21: Coach and Support Intervention Journey (MVP-lite)

1. System identifies high-intent or at-risk users (for example multiple failed checkouts or repeated help requests).
2. AI recommends priority queue for coach calls and support escalation.
3. Admin/support team takes action and logs resolution outcomes.

### Journey 22: Quality, Trust, and Compliance Oversight Journey (MVP-lite)

1. AI continuously scans copy, claims, pricing consistency, and policy surfaces.
2. System alerts admin on trust/compliance risks (claim mismatch, pricing mismatch, missing disclosures, expired offers).
3. Admin resolves issues with approval logs and audit traceability.

### Journey 23: AI Operations and Prompt Governance Journey (Post-MVP, Release 2+)

1. Admin reviews AI performance (accuracy, hallucination signals, escalation rate, cost/latency).
2. AI suggests prompt/policy updates, retrieval-source changes, and routing optimizations.
3. Admin approves controlled rollout via experiment flags with rollback safety.

## Functional Requirements

### Identity, Consent, and Profile

- FR-1: Users can register/login with email and selected OAuth providers.
- FR-2: Users can create and update profile details needed for personalization.
- FR-3: Users must provide required consent acknowledgments before using diagnosis features.

### Diagnosis and Skill Intelligence

- FR-4: Users can submit goals and upload/paste resume content.
- FR-5: Users can provide optional target role or job description for comparison.
- FR-6: System can produce a structured skill-gap summary from available inputs.
- FR-7: System can map diagnosis outcomes to eligible programs/offers.
- FR-61: Platform can generate resume skill and keyword improvement suggestions based on target role/JD alignment.
- FR-62: Platform can provide a quick pre-registration resume scan preview and gate detailed insights behind registration.
- FR-63: Registered users can receive saved resume-improvement reports and recommended relevant skill-training pathways.
- FR-64: Platform can present resume-upgrade services (for example coached resume rewrite/new resume package) based on detected gaps and confidence signals.
- FR-158: Users can select predefined Role X -> Role Y transition pathways and compare pathway options.
- FR-159: Platform can generate a clear 4-8 week transition planner timeline with recommended trainings, exams, certifications, and ordered todo tasks.
- FR-160: Registered users can save, track, and update transition-roadmap progress by task/status over time.

### Learner Dashboard and Assessments

- FR-8: Authenticated learners can view persistent skills dashboard.
- FR-9: Dashboard can show current-state skill/progress indicators with out-of-10 ratings using bar charts and optional radar charts, with text/table alternatives for accessibility.
- FR-10: Learners can launch timed micro-exams by competency area as free skill-assessment exams.
- FR-11: Assessment outcomes can update displayed skill profile and recommendations.
- FR-131: Learners can switch between supported visualization modes (for example bar and radar) while preserving accessible non-visual progress summaries.
- FR-132: Learners can bookmark courses and services from dashboard and listing surfaces, view saved items in a dedicated dashboard section, and remove bookmarks as needed.

### Offer and Commerce Flow

- FR-12: System can present one primary recommendation CTA after diagnosis.
- FR-13: Pricing for recommendations is consistent across diagnosis, catalog, and checkout surfaces.
- FR-14: Users can complete payment and receive confirmation and basic invoicing artifacts.
- FR-15: System can support currency handling relevant to target geographies.
- FR-16: Platform can detect user geography (with user override) and present localized currency/pricing defaults consistently across landing pages, offers, cart, and checkout.
- FR-178: Platform maintains a single session currency (user override wins over geo default). On first visit, currency resolves from CDN/proxy geo headers (`cf-ipcountry`, `x-vercel-ip-country`, `x-geo`) via `GET /api/v1/pricing/currency-context` with no client override; local/dev may stub geo with `?geo=`. Header currency selection or the `af_session_currency` cookie (30-day, set on explicit override) takes precedence over geo detection on subsequent loads. Launch currencies: USD, INR, CAD, NGN, AUD, IDR, SGD, BRL, EUR (Europe), AED, GBP. Header selector shows `CODE — Region` (e.g. `EUR — Europe`); IDR amounts omit decimals. Pricing resolver is SSOT for catalog, cart, checkout, and EMI preview.
- FR-85: Platform can enforce exam monetization rules where skill-assessment exams are free and certification mock/practice exams are paid.
- FR-86: Certification mock/practice exams must require paid enrollment/checkout before access.
- FR-87: Exam listing and detail pages must clearly label access type ("Free Skill Assessment" vs "Paid Certification Mock Exam") before CTA click.
- FR-151: Checkout must require authenticated users; non-logged-in users must complete sign up/login before checkout proceeds.
- FR-152: For carts containing eligible SAFe certification offerings, checkout can display a dedicated "organization payment/reimbursement" option that routes to a separate custom checkout workflow.
- FR-153: Organization payment/reimbursement checkout flow can capture required organization details (company name, billing contact, approval/reference details) and route to ops/admin follow-up or payment handling process.
- FR-154: On successful order, platform must send student-facing order confirmation containing enrollment details plus relevant resource links and official group/community join links.
- FR-157: For schedule-bound products/services, add-to-cart must require explicit schedule selection; cart item payload must store the attached schedule reference.

### Trust, Quality, and Content Governance

- FR-17: Editorial workflow can enforce approved terminology and copy quality.
- FR-18: Claims displayed on public pages can be tied to evidence or compliant disclaimers.
- FR-19: Testimonials and proof assets can be managed and reused in key conversion contexts.

### AI Chat and Guidance

- FR-20: Users can access an AI chatbot on key surfaces (landing, discovery, diagnosis, support entry points, dashboard).
- FR-21: AI chatbot can answer FAQs, explain program fit, and guide next best action using approved content boundaries.
- FR-22: AI chatbot responses must include safe fallback/escalation path to human support when confidence is low.
- FR-88: AI chatbot can proactively recommend paid professional services (mentorship, resume services, mock interviews, certification pathways) when user context indicates time-to-outcome needs.
- FR-89: Conversion-oriented AI prompts must emphasize value framing (save time, structured quality outcomes, coach support) while avoiding absolute guarantees.
- FR-90: When discussing salary outcomes (including "2x growth" narratives), AI chatbot must use compliant wording tied to evidence/testimonials and include non-guarantee disclaimers.
- FR-91: AI chatbot can personalize paid-service recommendations using profile, diagnosis, and engagement signals and provide clear CTA handoff to checkout or discovery call.
- FR-126: End users can provide per-response AI feedback in chat (for example "Was this correct/helpful?" with optional comments).
- FR-127: When users mark an answer as incorrect/not helpful, chatbot can request clarification and offer immediate escalation to support/coach.
- FR-128: System can aggregate AI feedback signals into quality insights by topic, role, and journey stage.
- FR-129: Admin users can review low-rated chat responses, root-cause categories, and approve corrective actions (prompt/policy/knowledge updates).

### Role-Specific AI Enablement Across Services and Courses

- FR-108: Every service/course page and purchaseable offering must include role-specific AI enablement metadata (target role, prerequisite level, skill outcomes, and recommended sequence).
- FR-109: Platform can generate role-specific learning guidance for all offerings (for example Scrum Master, Product Owner, Product Manager, and RTE pathways) instead of generic recommendations.
- FR-110: AI recommendations and next-best-actions must adapt per target role across diagnosis, dashboard, webinars, assessments, and paid services.
- FR-111: Admin users can manage and validate role-to-offering mappings so all newly published services/courses remain AI-enabled by role.
- FR-112: Platform can offer dedicated role-specific mock interview services (at minimum Scrum Master, Product Owner, Product Manager, and RTE) with clear scope and outcomes.
- FR-113: Users can book role-specific mock interview sessions from relevant journey touchpoints (diagnosis report, dashboard, webinar follow-up, and service pages).
- FR-114: AI can recommend the most relevant mock interview service based on role intent, skill gaps, and interview-readiness signals.
- FR-115: Admin users can configure mock interview service catalogs by role (pricing, coach assignment, session format, and availability).
- FR-116: System can track mock interview funnel metrics (view → booking → completion → downstream conversion) by role.

### Community, Rewards, and Conversion Surfaces

- FR-23: Users can discover and access official Meetup and WhatsApp community links from high-intent pages.
- FR-24: Platform can present community-member benefit badges/offers and eligibility conditions.
- FR-25: Platform can run beginner reward campaigns (coupon/freebie) tied to defined triggers, including skill-assessment participation.
- FR-26: Platform can offer prize-style benefits such as free online sessions and 1:1 resume reviews with coaches, with terms and quota controls.
- FR-27: Marketing system can render corporate credibility marquee with content governance controls.
- FR-28: Marketing system can publish and rotate success stories focused on role transition, salary growth, and career outcomes with claims-compliance checks.
- FR-29: Platform can host multiple SEO-oriented landing page templates for cohorts, certifications, skill assessments, and practice/mock exam offerings.
- FR-30: Platform can display upcoming free sessions/webinars on homepage and all designated customer-facing pages.
- FR-31: Platform can maintain a curated schedule feed (title, topic, date/time, host, seat availability, registration CTA) for free sessions/webinars.
- FR-32: Registered users can book webinar/free-session slots and receive transactional email confirmation and reminder invites.
- FR-33: Platform can trigger post-session follow-up emails with relevant next-step offers (diagnosis, assessments, cohorts, certifications).
- FR-34: Platform can support promotional popups/lightboxes with campaign targeting, frequency caps, and clear close/dismiss behavior on mobile and desktop.
- FR-121: Platform can display official social media links (LinkedIn, YouTube, Instagram, Facebook, and other approved channels) on homepage and high-trust pages.
- FR-122: Platform can show curated social proof modules (recent posts, community highlights, testimonial videos) sourced from official channels.
- FR-123: Platform can instrument social follow/visit CTAs and route users back to conversion surfaces (diagnosis, webinar registration, call booking, and paid services).
- FR-124: Admin users can manage social channel directory, display priority, and campaign-specific social trust widgets with approval controls.
- FR-136: Service/course cards can display learner uptake indicators (for example number of learners who availed/enrolled) with defined data refresh cadence.
- FR-137: Platform can apply and display tags such as "Best Seller" based on configurable ranking rules (for example bookings, conversion rate, and recency window).
- FR-138: Admin users can configure popularity/tagging thresholds and manually override tags with audit logs where needed.
- FR-139: Popularity indicators and badges must be backed by verifiable analytics sources and comply with trust/claims governance.
- FR-140: Each course page can provide a downloadable brochure containing curriculum overview, target audience, outcomes, and trainer information.
- FR-141: Each course page can display structured schedule details (upcoming batches, session dates/times, duration, delivery mode, and timezone).
- FR-142: Each course page can display transparent fee details (base fee, currency, discounts/coupons where applicable, inclusions/exclusions, and payment options).
- FR-143: Course detail pages can provide a standardized details section (syllabus/modules, prerequisites, certification info, FAQ highlights, and support/contact CTA).

### Webinar Feedback, Recommendations, and Attendance Certificates

- FR-79: Webinar attendees can submit a post-session feedback survey (rating, usefulness, topic interest, and open comments).
- FR-80: Platform can recommend next webinar sessions to attendees based on attended topic, learner profile, and survey responses.
- FR-81: Registered webinar attendees can use student dashboard self-service to mark attendance using a code provided at webinar end.
- FR-82: Webinar attendees can express interest in receiving a free certificate of attendance through the post-session dashboard flow.
- FR-83: Platform can generate and deliver/download a certificate of attendance for eligible attendees after attendance-code verification, with basic validation controls.
- FR-84: Student dashboard can show certificate status (eligible, pending verification, issued) and provide download access/history for issued webinar certificates.

### Smart Automation, Monitoring, Tracking, and Notifications

- FR-52: Users can submit any job link (or pasted job description text) to recheck required skills against their profile and goals.
- FR-53: Platform can parse submitted job links/JD content and generate a required-skills gap summary with recommended next actions.
- FR-54: Platform can trigger abandoned-cart reminders with checkout deep links at configurable intervals.
- FR-55: Platform can trigger inactivity nudges and time-bound offers (for example after 3 days of no action) with configurable campaign rules.
- FR-56: Users can manage communication preferences for email/notification categories, including opt-out controls where required.
- FR-57: Automation engine can orchestrate triggers from key events (diagnosis complete, cart abandon, no-show, inactivity, job-link recheck completed).
- FR-58: Ops/marketing can view automation performance metrics (deliveries, opens, clicks, conversions, failures) by campaign and segment.
- FR-59: System can alert operators on automation failures or abnormal engagement drops.
- FR-60: Campaign execution supports frequency caps, quiet hours, and timezone-aware scheduling to reduce notification fatigue.
- FR-133: Platform can trigger scholarship/financial-aid outreach emails to non-buying learners based on configurable eligibility and engagement criteria.
- FR-134: Scholarship/financial-aid emails can route users to a dedicated application/intake form and track downstream conversion impact.
- FR-135: Admin users can configure eligibility rules, campaign copy, and approval controls for scholarship/financial-aid outreach campaigns.
- FR-147: On every successful enrollment, platform can send operational notifications to multiple configured admin email recipients with enrollment and payment details.
- FR-148: Enrollment notification payload can include learner identity, selected service/course, payment reference, amount/currency, coupon/discount applied, and timestamp.
- FR-149: Platform can send enrollment notifications to approved Telegram destinations/channels for real-time ops visibility.
- FR-150: Notification delivery status (sent/failed/retried) for admin email/Telegram enrollment alerts is tracked and visible in ops monitoring.
- FR-155: Platform can run always-on interest-based campaigns for all users so emails/notifications are matched to selected interests, role goals, and engagement behavior.
- FR-156: Users can select and update interest preferences that directly control campaign topic relevance, channel selection, and frequency.

### AI-Native Admin Management and Control Plane

- FR-65: Admin users can access a unified command center for funnel status, journey health, and campaign outcomes.
- FR-66: System can provide AI-generated anomaly detection and probable-cause insights for conversion or engagement regressions.
- FR-67: Admin users can configure and approve automation policies with role-based permissions and change logs.
- FR-68: AI can recommend campaign adjustments (timing, segment, channel, message variant) with confidence indicators before execution.
- FR-69: Admin users can manage lifecycle assets (webinars, recordings, galleries, stories, marquee, popups) through governed workflows.
- FR-70: System can enforce human-in-the-loop approval for high-impact actions (discount blast, pricing changes, broad notification sends).
- FR-71: AI can identify at-risk/high-intent users and suggest prioritized coach/support interventions.
- FR-72: Admin users can track intervention outcomes (booked call, resumed checkout, conversion, churn risk drop).
- FR-73: System can run trust/compliance checks for claims, price consistency, expired offers, and mandatory disclosures.
- FR-74: Admin users can view AI quality dashboards (answer quality signals, escalation rates, cost, latency, and safety incidents).
- FR-75: Admin users can manage prompt/policy versions and retrieval-source configurations with approval workflow.
- FR-76: Platform supports experiment flags and rollback controls for AI behavior and engagement automations.
- FR-77: System retains audit logs for admin actions, AI recommendations, approvals, and overrides.
- FR-78: Platform supports multi-role admin access patterns (marketing ops, support ops, content editor, coach manager, and super-admin).
- FR-92: Platform can maintain a flexible AI-native knowledge base that supports frequent updates from new learnings, market research, and validated user feedback.
- FR-93: AI can propose knowledge-base updates (new entries, edits, deprecations, confidence notes) and route them through mandatory human validation/approval before publishing.
- FR-94: Knowledge-base changes are versioned with provenance metadata (source, author/reviewer, rationale, timestamp) and rollback support.
- FR-95: Admin users can schedule periodic knowledge reviews and approve AI-suggested refreshes to keep recommendations and chat responses market-current.

### Search Visibility and AI-Engine Discoverability (SEO + GEO)

- FR-96: Platform can maintain a search command center for indexing coverage, crawl errors, sitemap health, and priority query tracking.
- FR-97: Platform can generate and maintain structured data (FAQ, Course, Event, Article, Review, Organization, Person) by page template with validation checks.
- FR-98: Platform can support AI-citable answer blocks (concise Q&A, definitions, and summary snippets) on priority pages.
- FR-99: Platform can manage pillar-cluster topical architecture with internal-link recommendations and orphan-page detection.
- FR-100: Platform can support programmatic landing-page templates for high-intent variations with canonical and duplication controls.
- FR-101: Platform can enforce metadata governance (titles, descriptions, canonicals, robots directives) and highlight missing/invalid fields.
- FR-102: Platform can track search-performance metrics per page cluster (impressions, clicks, CTR, average position) and link them to conversion outcomes.
- FR-103: Platform can ingest and surface search-engine diagnostics from webmaster tools for actionable operations.
- FR-104: Platform can support content freshness workflows (staleness alerts, scheduled refreshes, and update approvals).
- FR-105: Platform can run snippet/SEO content experiments with measurable impact tracking on traffic and conversion.
- FR-106: Platform can map search intents to journey CTAs (diagnosis, webinar, call booking, paid services) and monitor intent-to-conversion effectiveness.
- FR-107: Platform must maintain and operationalize priority keyword clusters, including at minimum: "scrum master training", "product owner training", "product manager training", "transition to scrum master", "transition to product manager", "transition to product owner", and "transition to RTE (release train engineer)" via dedicated pages/content blocks with mapped CTAs.

#### Priority Keyword-to-Page Mapping (MVP)


| Keyword / Intent                           | Target Page Type                            | Primary CTA                        | Secondary CTA                  |
| ------------------------------------------ | ------------------------------------------- | ---------------------------------- | ------------------------------ |
| scrum master training                      | Certification + mentorship landing page     | Enroll in paid training/cohort     | Book paid discovery call       |
| product owner training                     | Product Owner training landing page         | Enroll in paid training/cohort     | Take free skill assessment     |
| product manager training                   | Product Manager transition landing page     | Enroll in paid training/cohort     | Upload resume for gap analysis |
| transition to scrum master                 | Career transition pathway page              | Start diagnosis (resume + goals)   | Book paid discovery call       |
| transition to product manager              | Career transition pathway page              | Start diagnosis (resume + goals)   | View webinar + register        |
| transition to product owner                | Career transition pathway page              | Start diagnosis (resume + goals)   | Take free skill assessment     |
| transition to RTE (release train engineer) | RTE transition + certification pathway page | Start diagnosis + recommended path | Book discovery call            |
| release train engineer training            | RTE training/certification landing page     | Enroll in paid training/cohort     | Join free webinar              |


**Execution note:** Each mapped page must include AI-citable Q&A blocks, structured data, and explicit CTA instrumentation for intent-to-conversion tracking.

### Core Pages, Forms, and Discovery Call Booking

- FR-35: Platform can provide a dedicated About page presenting brand story, coach/mentor credibility, and delivery model.
- FR-36: Platform can provide a Contact Us page with structured inquiry forms for user questions and support intent routing.
- FR-37: Platform can provide a dedicated FAQ page with searchable categories and AI-assisted answer discovery.
- FR-38: Platform can support multiple form templates (general inquiry, coaching query, partnership interest, webinar question) with submission tracking.
- FR-39: Registered users can book paid discussion/discovery calls with coaches using a slot-based workflow with geo-priced fees (`$9` for USA, `INR 49` for India) and confirmation emails.
- FR-40: Platform can publish and maintain interview-question pages through Wix blogs, organized by role, certification, and difficulty tags.
- FR-41: Platform can connect inquiry-form and discovery-call submissions to downstream follow-up workflows and conversion attribution.
- FR-144: Global footer must include all relevant navigation and trust links, including core pages, policies, Terms and Conditions, and legal disclosures.
- FR-145: Global footer must include affiliate program and partnership opportunity links with dedicated inquiry paths.
- FR-146: Global footer must display verified contact numbers and official social profile links consistently across public pages.

### Webinar Recordings and Gallery

- FR-49: Platform can publish and maintain a webinar recordings library with links, titles, topics, and speaker metadata.
- FR-50: Platform can publish and maintain an event photo gallery with captions/tags and lightweight moderation controls.
- FR-51: Homepage and key conversion pages can surface recording/gallery modules so new visitors and registered users can discover past sessions easily.

### Replacement and Continuity

- FR-42: Legacy URLs can be redirected to mapped new URLs with no broken high-intent paths.
- FR-43: Core legacy content entities are tracked through rewrite/merge/retire decisions.
- FR-44: Transition support paths are available for existing customers.
- FR-45: Legal/policy pages are available and linked in all required user journeys.

### Analytics and Observability

- FR-46: System emits events for diagnosis start/complete, assessment complete, checkout start/complete, recommendation click-through, chatbot engagement, community-link click, reward redemption, webinar impressions/registrations/attendance markers, attendance-code verification events, webinar feedback submissions, next-session recommendation clicks, certificate-interest submissions, certificate-issued/download events, recording/gallery impressions and clicks, form submissions, discovery-call booking outcomes, localized pricing display, popup interactions (shown, closed, converted), job-link recheck events, resume-scan preview/full-report unlock events, resume-service CTA clicks, paid-service recommendation impressions/clicks/conversions, disclaimer-shown events for outcome claims, exam-type impression/click events (free skill assessment vs paid mock exam), cart-abandon reminder events, inactivity-nudge outcomes, scholarship/financial-aid campaign impressions/clicks/application starts/completions, popularity-badge impressions/clicks, admin intervention actions, AI recommendation acceptance/rejection, campaign-optimization outcomes, knowledge-base update proposal/approval/publish events, search-intent page impressions/clicks, keyword-cluster ranking trends for priority terms, AI-answer referral events, and admin enrollment-notification delivery events (email/Telegram).
- FR-47: Operators can access funnel-level reports for conversion diagnostics.
- FR-48: System exposes operational alerts relevant to cutover and checkout stability.
- FR-125: Analytics can report social trust funnel metrics (social profile clicks, social-return sessions, and social-origin conversions) by channel.
- FR-130: Analytics can report AI answer-quality metrics (helpful vs not-helpful ratio, correctness feedback, unresolved rate, and post-feedback recovery outcomes) by topic and role.

## Non-Functional Requirements

### Performance

- NFR-P1: Landing and diagnosis surfaces are optimized for mobile-first performance.
- NFR-P2: Diagnosis result generation is responsive enough to preserve session continuity expectations.
- NFR-P3: Dashboard updates after assessment completion occur within acceptable interactive latency.
- NFR-P4: All core pages and conversion surfaces are fully responsive across mobile, tablet, and desktop breakpoints, including forms, checkout, and popups/lightboxes.
- NFR-P5: Priority landing pages must meet defined Core Web Vitals thresholds suitable for mobile-first search performance.

### Reliability

- NFR-R1: Checkout flow provides graceful failure handling and retry-safe behavior.
- NFR-R2: Critical public endpoints (including sitemap) maintain high availability targets.
- NFR-R3: Cutover monitoring can detect and alert on abnormal error spikes quickly.
- NFR-R4: Notification and automation workflows are retry-safe and observable, with delivery status tracking and dead-letter handling for failed dispatches.
- NFR-R5: Admin control-plane actions support rollback for high-impact changes and preserve system stability during configuration updates.
- NFR-R6: Search-critical assets (sitemaps, robots directives, canonical mappings, schema generation jobs) must be monitored with alerting and recovery procedures.

### Security and Privacy

- NFR-S1: Resume and profile data are protected in transit and at rest.
- NFR-S2: Access controls prevent unauthorized access to learner-specific data.
- NFR-S3: Data handling and retention are defined for uploaded resumes and derived artifacts.

### Compliance and Accessibility

- NFR-C1: Consent and policy controls meet baseline legal and regional expectations.
- NFR-C2: Core journeys meet accessibility expectations with non-visual alternatives for charts.
- NFR-C3: Promo popups/lightboxes must be accessible (keyboard dismiss, focus handling, readable contrast, and no blocked primary navigation on small screens).
- NFR-C4: Engagement notifications and offers comply with consent/unsubscribe requirements and respect configured communication preferences.

### AI Safety and Cost Governance

- NFR-A1: AI responses are constrained by approved content grounding and guardrails.
- NFR-A2: Career/salary guidance includes cautionary framing where certainty is limited.
- NFR-A3: AI usage is observable for quality, safety, and cost management.
- NFR-A4: High-impact AI-admin decisions require human approval or staged rollout before full execution.
- NFR-A5: AI models and prompts used for admin automation are versioned, testable, and auditable.
- NFR-A6: AI sales-oriented messaging must enforce compliant claim templates, mandatory disclaimer insertion for outcome claims, and block disallowed guarantee language.
- NFR-A7: AI knowledge-base refresh workflows must enforce human validation gates, source traceability, and rollback-safe publishing.
- NFR-A8: AI quality feedback loops must support near-real-time triage and measurable quality improvement over release cycles.

## Dependencies and Integrations

- Wix Studio and CMS for top-of-funnel content and acquisition surfaces
- Custom backend services for identity, diagnosis, recommendation, and analytics
- Payment provider integration (Stripe primary target)
- AI provider abstraction (OpenRouter + retrieval strategy)
- Knowledge-base management layer for source ingestion, review workflow, versioning, and retrieval indexing
- Search/webmaster integrations for indexing diagnostics and performance telemetry
- Event analytics stack for funnel truth and operator visibility (PostHog for product KPI attribution + Microsoft Clarity for behavioral replay/heatmaps)

## Risks and Mitigations

- **Scope sprawl:** enforce Tier A cut line and freeze release scope.
- **Trust regression:** apply copy and claims governance before launch.
- **SEO loss during replacement:** execute URL mapping and Search Console monitoring.
- **Migration confusion for existing customers:** publish continuity policy and support scripts.
- **AI quality variance:** use grounding, review loops, and bounded surface areas first.

## Release Plan (High-Level)

### Release 1 (Tier A + Cutover)

- Diagnosis + learner account + dashboard + timed micro-exams
- Guided purchase flow and pricing harmonization
- Trust/quality baseline and full continuity checklist
- Core funnel and reliability instrumentation

### Release 2 (Tier B)

- Bounded AI assistant expansion
- WhatsApp and lifecycle messaging orchestration
- Structured social proof and deeper optimization loops

### Later Releases

- LMS/community/enterprise capabilities after D2C conversion loop is validated

## Open Decisions

1. Existing customer continuity policy: migrate accounts or re-invite workflow?
2. Day-1 commerce model: full Stripe replacement vs temporary bridge with legacy checkout?
3. Canonical source of truth for catalog/pricing during transition period?
4. Required legal review depth for claim language before launch?
5. Geographic rollout order and currency policy for launch markets?

## Acceptance Gate for PRD Sign-Off

This PRD is ready for implementation planning when:

- Tier A requirements are accepted by product, engineering, and business owners
- Continuity and cutover requirements have named owners
- Open decisions above are resolved or explicitly deferred with risk acceptance
- KPI definitions and instrumentation ownership are approved

