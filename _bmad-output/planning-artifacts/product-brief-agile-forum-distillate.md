---

## title: "Product Brief Distillate: The Agile Forum (AI-Native Career Transformation)"

type: llm-distillate
source: "product-brief-agile-forum.md"
created: "2026-05-23"
purpose: "Token-efficient context for downstream PRD creation"
inputs:

- "c:UsersdhireOneDriveDocumentsAgileForumRequirementThe Agile Forum Ai Native Platform Brd.docx"

# Distillate — The Agile Forum AI-Native Platform (from BRD)

## Product identity

- **Name:** The Agile Forum — AI-Augmented Career Transformation Platform (BRD naming).
- **Positioning:** Not “traditional certification website” / generic marketplace / commodity LMS → **AI-powered career transformation & professional growth** for Agile, Product, Program Mgmt, Scrum, SAFe, digital transformation audiences.
- **Delivery:** AI-native **web platform**; BRD cites **Wix Studio** + custom **AI backend**; hybrid cloud.

## Rejected / deferred for MVP (preserve for PRD scoping)

- Full **LMS** — Phase 3+ mindset in BRD.
- **Community** platform — Phase 3.
- **Webinar automation** — Phase 2/3.
- **Native mobile** — future.
- **Enterprise SSO** — Phase 4.
- **Advanced AI agents** — future.
- **Multi-tenant enterprise architecture** — future.

## Technical context (high-signal)

- **Frontend/CMS:** Wix Studio — landing, blog, SEO, catalog, forms, dynamic content.
- **Backend:** FastAPI-style services suggested — auth APIs, AI orchestration, commerce, notifications, recommendation engine.
- **AI gateway:** OpenRouter; **RAG**; model routing; safety controls; caching/fallback emphasized in NFRs.
- **Data:** PostgreSQL; **vector DB Qdrant**; Redis caching; analytics pipeline.
- **Payments:** Stripe; multi-currency; geography-based pricing; coupons; invoices; notifications.
- **Suggested model mapping (BRD hint):** FAQ → Mistral; resume analysis → DeepSeek; skill extraction → Qwen; career guidance → Llama (treat as starting point, not locked).

## Business goals (IDs preserved)

- BG-1..BG-10: enrollments, conversion, AI differentiation, lower support burden, engagement/retention, scalable personalization, lead qualification, global commerce, reusable AI knowledge, proprietary career intelligence data.

## Personas (for PRD stories)

- Career switcher; practicing SM; IT pivot; fresher; admin/ops (internal).

## Customer journey stages (for funnel PRD)

- Awareness → Discovery → Exploration → Skill diagnosis → Evaluation → Purchase → Onboarding → AI guidance → Support → Re-engagement → Upsell → Advocacy.

## Functional requirement clusters (FR groupings — not full FR list)

- **IAM:** registration, login, Google/LinkedIn OAuth, email verify, password reset, JWT, RBAC, consent.
- **Profile & career intelligence:** **student/learner dashboard** (persistent view of skills vs targets); **viz** — bar summaries for per-skill/domain readiness; **limited radar/multi-axis** comparisons with **text/table fallbacks** for a11y; resume upload; goals; skill profiles; parsing; resume–JD compare; gap analysis; roadmap; salary guidance; interview prep recs.
- **Time-based skill micro-exams:** generic **short exams with time limits** per attempt; scope is **not** anti-cheat or proctoring — focus is quick, timed check-ins mapped to competency taxonomy; still **not** a full LMS / cert exam engine in MVP.
- **AI chat & recs:** assistants (general, FAQ, course, career), engine, prompt mgmt, usage monitoring.
- **Commerce:** cart, Stripe, multi-currency/geo pricing, coupons, invoices, orders, payment notifications.
- **Marketing/CMS:** landing, blog, SEO, dynamic CMS, catalog, lead forms.
- **Analytics:** events, funnel, conversion, AI interaction, revenue.
- **Notifications:** email, abandoned cart, AI follow-up, re-engagement.

## NFR themes

- Security: rate limit, CAPTCHA, hashing, upload validation, audit, API security, AI controls, JWT expiry.
- Performance: CDN, caching, async/queues, image optimization, mobile-first.
- Scalability: stateless APIs, horizontal scale, queue AI, modular services, pooling, etc. (BRD very detailed — PRD should abstract to testable SLOs).
- Reliability: retries, AI fallback, health checks, payment recovery, circuit breakers, DLQ, graceful degradation.
- Accessibility: responsive, mobile-first, keyboard, ARIA, contrast, WCAG alignment goal.
- Observability: logging, errors, AI cost, funnel, API perf, session analytics, suggested stack names (Sentry, Grafana, Prometheus, PostHog, Cloudflare) — pick for PRD NFR section.

## Roadmap phases (BRD)

- **Phase 1 MVP:** identity, profiles, AI gateway, resume intelligence, skill-gap, Stripe, AI chat, marketing CMS, event tracking.
- **Phase 2:** AI memory, rec engine tuning, AI mock interviews, WhatsApp notifs, feature flags, funnel experiments.
- **Phase 3:** LMS, community, webinar automation, AI mentor agents.
- **Phase 4:** enterprise SSO, multi-tenant, org dashboards, team benchmarking.

## MVP success metrics (metric names)

- Lead conversion; resume uploads; skill assessments completed; AI chat engagement; cart conversion; returning users; AI recommendation CTR.

## Risks & mitigations (BRD summary)

- Hallucination → RAG + moderation; High AI costs → routing + caching; Wix limits → backend abstraction; Security → API hardening; Weak recs → metadata discipline; Low conversion → funnel optimization; Ops complexity → modular architecture.

## Assumptions & constraints (capture for PRD)

- Wix Studio for front/CMS; Stripe primary gateway; OpenRouter for AI; custom backend for heavy lifting; AI evolves incrementally.
- Constraints: MVP timeline, AI cost discipline, Wix boundaries, resources, initial ops capacity.

## Growth, partnerships & channels (product brief)

- **Partnerships:** cert/training bodies & cohort providers; employers/talent programs (light B2B); recruiting/alumni/community adjacencies for ICP density and CAC.
- **Co-marketing:** joint diagnosis/campaign landing, content/SEO with outcome framing, social proof tied to outcomes where allowed.
- **Phased channels:** MVP = email + on-site AI + acquisition; Phase 2 = WhatsApp transactional/nurture (consent, locale norms, parity with unsubscribe); later = webinar automation, community referrals, enterprise (aligns BRD Phase 2 WhatsApp).
- **Operating model:** treat partner initiatives as experiments with attribution and partner-specific funnels.

## Open questions for PRD / stakeholder lock

- Exact **cut line** inside MVP FR list (prioritize hero journey vs breadth).
- **Markets/locales** for Stripe + tax/compliance narrative.
- **AI disclaimer** UX and editorial policy for salary/career claims.
- **Data retention** model for resumes and embeddings (privacy policy depth).
- **Single source of truth** for catalog (Wix vs backend) — integration contract detail.