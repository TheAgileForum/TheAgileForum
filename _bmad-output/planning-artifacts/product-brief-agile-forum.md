---

## title: "Product Brief: The Agile Forum (AI-Native Career Transformation)"

status: complete
created: "2026-05-23"
updated: "2026-05-23"
inputs:

- "c:/Users/dhire/OneDrive/Documents/AgileForum/Requirement/The Agile Forum Ai Native Platform Brd.docx"
- "c:/Users/dhire/OneDrive/Documents/mybmadproj/_bmad-output/planning-artifacts/must-have-priorities-agile-forum.md"

# Product Brief: The Agile Forum — AI-Native Career Transformation Platform

## Executive Summary

**The Agile Forum** is evolving from a traditional Agile certification and training site into an **AI-native career transformation platform** for professionals in Agile, Product, Program Management, Scrum, SAFe, and digital transformation. Instead of selling static courses alone, the platform will use **resume intelligence, skill-gap diagnosis, personalized learning paths, and AI-guided coaching** to help people understand where they are, what to learn next, and how to move toward better roles and pay.

The MVP combines **Wix Studio** for marketing, CMS, and discovery with a **custom backend** (e.g. FastAPI) for identity, commerce, AI orchestration, and analytics. AI runs through **OpenRouter**, with **RAG** and disciplined prompt/usage controls to balance quality and cost. **Stripe** anchors global commerce with multi-currency and geography-aware pricing.

**Why now:** Generic course marketplaces and static EdTech stacks under-serve career switchers and upskillers who need **structured guidance**, not unlimited content. Operational AI costs are manageable with routing, caching, and quotas — while early movers can still differentiate on **career intelligence** and personalization before the category fully commoditizes.

## The Problem

- **Low personalization:** Users face a sea of certifications and courses without a clear map from *current resume* → *target role*.
- **Weak career intelligence:** Little structured help comparing resumes to job descriptions, salary realism, or interview readiness.
- **Poor conversion confidence:** Visitors hesitate to buy when they cannot see *why* a specific cohort or certification fits *their* path.
- **Disconnected journeys:** Marketing, diagnosis, commerce, and support feel like separate islands — hurting engagement and funnel completion.

Professionals transitioning or leveling up burn time and money on misaligned picks; operators burn margin on **support and manual counseling** that AI-assisted flows could absorb at scale.

## The Solution

An **integrated experience** where users discover content, **upload a resume**, define goals, receive **skill-gap analysis and career roadmaps**, get **personalized certification and learning recommendations**, and complete purchase — supported by **AI chat** (FAQ, course fit, career guidance) and **automation** (cart recovery, re-engagement, notifications).

The product is deliberately **AI-native**, not AI-bolted-on: recommendations, diagnosis, and engagement use shared context (profile, skills, behavior) rather than isolated widgets.

### Learner skills dashboard & assessments

Learners (**students**) need a single place to **see and revisit their skill profile**, not only a one-off diagnosis before checkout. A **student / learner dashboard** should surface structured skills data (from resume parsing, profiling, resume–JD comparison, and/or manual inputs), with views that communicate gaps at a glance:

- **Bar-style metrics** (e.g., proficiency or confidence bands per skill or domain) compared to role or pathway targets — easy to scan and mobile-friendly for MVP.
- **Radar / spider charts** (or an equivalent multi-axis view) reserved for compact comparison across a **small number** of dimensions (for example facilitation vs delivery vs product literacy) — with **accessible fallbacks**: short text summaries plus table views so visuals are illustrative, not the only representation.

**Skill assessments:** Use **generic, time-based small exams** — short attempts with clear **elapsed time limits** (per session / per quiz), wired to competency areas in the skill model. The emphasis is pace and breadth of check-in, **not anti-cheating or proctoring** (heavy integrity controls stay out of scope here). Results refine what the dashboard shows and feed personalization. These sit **below** certification-style or full **LMS** exam suites (**still deferred** overall). Dashboard + timed micro-exams support **skills assessments completed** and return visits.

## What Makes This Different

- **Outcome positioning:** Career transformation and acceleration — **not** “another course catalog” or generic LMS framing.
- **Proprietary accumulation:** Structured **skill intelligence**, behavior, and conversion data compound into better recommendations and long-term moat (not just content inventory).
- **Pragmatic stack:** Wix for **velocity and CMS** where it wins; custom services for **AI, payments, and deep personalization** where differentiation lives.
- **Phased honesty:** MVP **defers** full LMS, community, webinar automation, enterprise multi-tenant, and advanced agents — reducing build risk while still shipping a credible AI story.

**Risks to respect:** Wix ↔ custom backend **integration and limits**; **AI hallucination** in career advice (mitigate with RAG, moderation, guardrails); **MVP surface area** is large (many FR clusters) — sequencing and cut lines need ruthless ownership to protect timeline.

## Who This Serves


| Segment                                   | Need                                                    | Success looks like                                   |
| ----------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| **Career switchers**                      | Roadmap into Agile/Product; clarity on skills and certs | Clear gap analysis + recommended path + enrollment   |
| **Practicing Scrum Masters / Agile pros** | Advancement, leadership, salary                         | Role-aligned upsell and credible next certifications |
| **IT professionals pivoting**             | Navigating certs and role fit                           | Personalized guidance vs confusion                   |
| **Fresh entrants**                        | Confidence, interview prep, first credential            | Guided starter journey                               |
| **Internal ops/marketing**                | Conversion, commerce, analytics                         | Fewer fragmented tools; measurable funnels           |


**Secondary:** Leadership and (later) enterprise buyers — explicitly **later phase** per BRD.

## Success Criteria

**Business:** Higher **cohort and certification enrollments**; improved **site conversion**; **lead quality** via diagnosis and profiling; global **Stripe** commerce working reliably.

**Product:** Increased **resume uploads** and completed **skill assessments**; sustained **AI chat engagement**; better **cart completion** and **return usage**; measurable **CTR** on AI recommendations.

**Operational:** Foundations for **AI cost visibility**, **observability** (errors, funnel, queues), and **reliability** (retries, fallbacks, degraded modes when AI or payments hiccup).

## Scope

**In MVP:** Identity (incl. Google/LinkedIn OAuth), profiles, resume upload and parsing, **resume vs JD** comparison, skill-gap analysis, roadmap and guidance surfaces — plus a **student / learner dashboard** that visualizes skill status (**bar summaries** where appropriate and **limited radar/multi-axis views** with accessible equivalents), **generic time-based micro-exams** for skill check-ins (see **Learner skills dashboard & assessments**), Stripe cart and geo/multi-currency patterns, coupons, invoices, AI assistants (FAQ, recommendations, career), notifications and abandoned-cart flows, Wix-facing marketing/CMS and catalog/forms, analytics event and funnel instrumentation, baseline security/compliance UX (privacy, consent, rate limits, CAPTCHA, upload validation).

**Out of MVP (explicit):** Full LMS; community platform; webinar automation; native apps; enterprise SSO; advanced autonomous agents; multi-tenant enterprise architecture.

### Full site replacement (cutover & continuity)

Building a **new** theagileforum.com experience that **fully replaces** legacy pages does **not**, by itself, add many new **product capabilities** beyond what Scope and Tier A already describe. It **does** add non-negotiable **delivery and continuity** items that belong in roadmap and PRD (often surfaced as acceptance criteria rather than flashy features):


| Area                              | Why it matters                                                                                                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **URL & SEO continuity**          | Old indexed URLs must resolve predictably (**301 redirect map** old → new), sitemaps/canonicals updated, Search Console monitored—extends **A6** beyond “sitemap returns 200.”                            |
| **Content & IA decisions**        | Which legacy marketing pages/courses/FAQs are **rewritten**, **merged**, or **retired**; single information architecture so replacement is intentional, not accidental gaps.                              |
| **Learner / customer continuity** | Policy for anyone with prior purchases or enrollments: **identity** (migrate vs invite to re-register), **access** to materials/receipts, and **support** scripts so cutover doesn’t strand paying users. |
| **Legal & trust surfaces**        | Privacy, terms, refund/cancellation, and contact/support paths **present and accurate** before switchover (often migrate + legal review).                                                                 |
| **Cutover mechanics**             | DNS/domain or subdomain rollout, phased traffic if needed, **rollback** posture, alerting for **404/5xx spikes** and checkout breakage right after flip.                                                  |


If any “old” flows must stay externally (for example niche Wix bookings or embedded tools), call them out explicitly as **dependencies** rather than implying full replacement day one—otherwise Scope already assumes net-new UX on the new stack.

## MVP must-haves (conversion, quality & differentiation)

These items are **non-negotiable** for the upgrade versus today’s mostly **Wix-only**, high-touch journey. They align competitive analysis + current-site findings + scope above. Expanded rationale: `[must-have-priorities-agile-forum.md](must-have-priorities-agile-forum.md)`.

### Principles

1. **Bundle beats catalog** — differentiate on *“this path fits me”* + credible pay step, not infinite SKUs.
2. **Trust before hype** — energetic marketing must pair with **credible** proof and disciplined claims.
3. **Wix for acquisition; product layer for personalization** — identity, diagnosis, dashboard, exams, and measured funnels live in the **custom stack** tied to CMS.
4. **Founder expertise is part of the product story** — productize credibility without losing the human anchor.

### Tier A — Must-have (first revenue-ready MVP)


| ID     | Requirement                                                                                                                                                                                                                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A1** | **Productized diagnosis (“fast aha”)** — Short flow: goals + **resume upload or paste** + optional target role/JD → structured **skill-gap summary** → **recommended next program** mapped to **real offers** (mentorship, SAFe, combo SKUs).                                                       |
| **A2** | **Learner account + skills dashboard** — Logged-in **home**: skills snapshot, **progress over time**, entry points to **timed micro-exams** and enrolled programs; **accessible** summaries (text/table), not charts alone.                                                                         |
| **A3** | **Time-based micro-exams** — Small **time-limited** attempts per competency area; outcomes **refresh** dashboard + personalization (**not** heavy anti-cheat / proctoring focus).                                                                                                                   |
| **A4** | **Single guided path to purchase** — After diagnosis/report: **one primary CTA** toward the best-fit offer (alternate paths secondary); **pricing** transparent and **consistent** across surfaces (**INR/USD** single source of truth vs scattered marketing pages).                               |
| **A5** | **Trust & quality layer** — Editorial **copy audit** (terminology e.g. **SAFe**/Scrum, typos); **pricing alignment** with commerce; **claims framework** for headline stats (methodology footnotes, soften where needed, or qualitative proof + testimonials) so high-ticket buyers stay confident. |
| **A6** | **Reliable technical hygiene** — Healthy **SEO** (**sitemap** returns 200, crawlable structure); stable **checkout** paths; **mobile performance** baseline; **cookie/consent** clarity where regulations apply.                                                                                    |


### Conversion architecture (target flow)

Traffic from **Wix** (SEO, ads, webinars) → clear **ICP** landing → **fast diagnosis (A1)** → personalized report seeds **dashboard (A2)** → optional **micro-exam (A3)** → **single primary offer + clear price (A4)** → **checkout** (Stripe and/or Wix bridge) → post-purchase onboarding (extend with Tier B).

### Tier B — Should-have (immediately after Tier A)


| ID     | Requirement                                                                                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B1** | **Bounded AI assist** — In-product chat for FAQ, **program fit**, “explain my gap report,” **RAG-grounded** + **guardrails** on career/salary advice.                  |
| **B2** | **Email + staged WhatsApp** — Transactional and nurture tied to diagnosis funnel; **explicit consent**; **unsubscribe** parity for messaging.                          |
| **B3** | **Structured social proof** — Reusable stories (role, timeframe, outcome); surface on **post-diagnosis** journeys, not homepage only.                                  |
| **B4** | **Analytics & funnel truth** — Instrument **diagnosis started/completed**, **exam completed**, **checkout started/completed**, **AI sessions**; ops-visible reporting. |


### Tier C — Explicitly later (do not block Tier A)

Full **LMS**, **community**, **enterprise multi-tenant**, **heavy exam proctoring**, **deep recruiter API** integrations — after D2C flywheel is proven.

## Vision

In two to three years: a **skills and career intelligence graph** underpinning mentorship-style journeys — extending into **structured learning (LMS)**, **community**, richer **automation**, and **enterprise** workforce and benchmarking offers — with the long-term advantage in **data + personalization**, not course volume alone.

## Growth, partnerships, and channels

Beyond product-led conversion, the platform can scale trust and revenue through **partnerships**, **co-marketing**, and **channel mix** that reinforce the “career transformation” story.

**Partnerships (priority themes)**  

- **Certification and training bodies / cohort providers:** Joint value props — their credibility + our diagnosis and personalization — with shared assets (webinars, landing pages, cohort-specific offers).  
- **Employers and talent programs:** Light B2B hooks (job families, skill profiles) that feed **resume–JD** and roadmap narratives without requiring enterprise MVP on day one.  
- **Recruiting and community adjacencies:** Referral and content partnerships where **ICP density** is high (Agile meetups, bootcamps, alumni networks) to lower CAC and improve lead quality.

**Co-marketing**  

- **Joint campaigns** with partners: co-branded diagnosis flows (“see your gap for [role/credential]”), shared case studies, and calendar-led pushes (cohort start dates).  
- **Content syndication and SEO:** Partner quotes, guest curriculum voices, and structured data that align search intent with **career outcomes**, not only course names.  
- **Social proof loops:** Graduate and employer proof points tied to **measurable outcomes** (role moves, cert completions) where privacy allows.

**Phased channels (including WhatsApp)**  

- **Phase 1 (MVP):** Email, on-site AI chat, and existing organic/paid acquisition — tuned to **diagnosis → recommendation → cart** attribution.  
- **Phase 2 (roadmap-aligned):** **WhatsApp** (and similar high-open channels) for **transactional and nurture** flows: abandoned journeys, cohort reminders, re-engagement after diagnosis, and light “nudge” follow-ups — always with consent, locale-appropriate norms, and **unsubscribe** parity with email. Treat messaging as **incremental leverage**, not a replacement for core web onboarding.  
- **Later phases:** Deeper automation (e.g. webinar sequences), community-driven referrals, and enterprise-facing programs as LMS and multi-tenant capabilities land.

Partnerships and co-marketing should be **tracked like product experiments**: hypotheses, attribution, and partner-specific funnels — so roadmap decisions stay aligned with MVP metrics (conversion, retention, recommendation effectiveness).

## Review Panel (applied to this draft)

- **Skeptic:** MVP scope is broad; sequencing one **hero journey** (e.g. diagnose → recommend → checkout) reduces slip risk. **AI safety** and **legal tone** on salary/career claims deserve explicit guardrails.
- **Opportunity:** Expanded in **Growth, partnerships, and channels** — partnerships + co-marketing + phased messaging (including WhatsApp in Phase 2) to accelerate trust, lower CAC, and improve retention.
- **Go-to-market:** Winning depends on crisp **ICP-led landing narratives** and a fast **“aha”** from free/low-friction diagnosis before paywall fatigue.

---

*Prepared for Dhirender from BRD v1.0 — Product & Enterprise Architecture framing. Recommended next BMad step: **[CP] Create PRD** (`bmad-create-prd`) using this brief and the distillate.*