---

## title: "Must-have priorities — quality, conversion & differentiation (Agile Forum upgrade)"

status: draft
created: "2026-05-27"
draws_on: "product-brief-agile-forum.md, competitive-analysis-agile-forum.md, current-state-analysis-theagileforum.md"

# Must-have features & improvements (upgrade focus)

This distills **prior analysis** into what to **target first** for **quality**, **trust**, and **conversion** — without trying to ship the whole BRD at once.

---

## Principles (from competitors + current site)

1. **Bundle beats catalog:** Marketplaces win on volume; you win on **“this path is for *me*”** + **credible next step to pay** (diagnosis → proof → offer).
2. **Trust before hype:** The live site uses **strong claims**; upgrade should pair energy with **credibility** (consistent numbers, disclaimers, proof).
3. **Wix stays acquisition; product lives in the app layer:** High-conversion **personalization** needs **identity + data + AI** off the long scrolling homepage alone.
4. **Founder strength is an asset:** Competitive AI career apps lack **deep Agile/SAFe + cohort quality** — productize that story without losing the human anchor.

---

## Tier A — Must-have (MVP / first revenue release)

These are **non-negotiable** for a serious “upgrade” that improves **quality** and **conversion** vs today’s Wix-only journey.


| Priority                                   | What                                                                                                                                                                                                                                           | Why (analysis link)                                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A1. Productized diagnosis (fast “aha”)** | Short flow: goals + **resume upload** (or paste) + optional target role/JD → structured **skill-gap summary** + **recommended next program** (map to existing SKUs).                                                                           | Competitors sell **courses**; your brief wins on **career intelligence**. Current site is **manual** resume help — this is the **scalable** wedge.                             |
| **A2. Learner account + skills dashboard** | Logged-in **home**: skills view, **progress over time**, links to **timed micro-exams** and programs; **accessible** text/table, not only charts.                                                                                              | Brief committed to **dashboard + bars + selective radar**; competitive **AI career** apps show **visibility of progress** — drives **return visits** and justification to buy. |
| **A3. Time-based micro-exams**             | Small, **time-limited** checks tied to competency areas; results **update** the dashboard.                                                                                                                                                     | Your explicit scope; supports **“assessments completed”** and **personalization** without LMS bloat.                                                                           |
| **A4. Single guided path to purchase**     | From diagnosis → **one primary CTA** (e.g. mentorship vs combo) with **clear pricing** (fix **INR/USD inconsistency** observed on site).                                                                                                       | Current homepage is **dense**; conversion wins on **fewer decisions** after personalization.                                                                                   |
| **A5. Trust & quality layer**              | **Copy audit:** fix typos (**scum** → **Scrum**, etc.), **SAFe** spelling, **pricing alignment** across pages. **Claims framework:** footnote or methodology for salary/pass-rate stats **or** soften to **qualitative** proof + testimonials. | Current-state analysis flagged **credibility risk**; hurts **high-ticket** conversion if prospects feel “too salesy”.                                                          |
| **A6. Reliable technical hygiene**         | Fix **sitemap 500** (if still broken), valid **checkout** paths, **speed** on mobile, **cookie/consent** clarity for EU-sensitive traffic.                                                                                                     | Broken sitemap = SEO leak; friction = lost high-intent leads.                                                                                                                  |


---

## Tier B — Should-have (soon after Tier A; lifts conversion & retention)


| Priority                         | What                                                                                                                                                    | Why                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **B1. AI assist (bounded)**      | In-product **chat**: FAQ, **program fit**, **explain my gap report** — grounded in **your** content (RAG), with **guardrails** on career/salary advice. | Matches **AI-native** positioning vs **Pivotr/Apt** class; must stay **accurate** to protect trust. |
| **B2. Email + staged WhatsApp**  | **Transactional + nurture** aligned to diagnosis (abandon, re-engage, cohort reminders) with **explicit consent** and **unsubscribe** parity.           | Already a **channel** on live site; formalize for **measurement** and compliance.                   |
| **B3. Social proof system**      | Structured **stories** (role, before/after, timeframe) + **video** where possible; surface on **post-diagnosis** screens, not only homepage.            | Founder-led trust **scales** only with **repeatable** proof assets.                                 |
| **B4. Analytics & funnel truth** | Event model: **diagnosis started/completed**, **exam done**, **checkout started/completed**, **AI sessions**; dashboards for **ops**.                   | You can’t optimize conversion without **one source of truth**.                                      |


---

## Tier C — Explicitly later (do not block Tier A)

- Full **LMS**, **community**, **enterprise multi-tenant**, **heavy proctoring** — already **out of MVP** in brief; competing with **LXPs** head-on is a **distraction** until **D2C flywheel** works.  
- **Deep** recruiter API integrations — **partnership** play from brief; after **ICP** funnel is solid.

---

## Conversion architecture (simple mental model)

```
Traffic (Wix SEO/ads/webinar) 
  → Landing with clear ICP 
  → Fast diagnosis (A1) — guest or light signup 
  → Personalized report + dashboard seed (A2) 
  → Micro-exam hook or “validate your gaps” (A3) 
  → Single best next offer + transparent price (A4) 
  → Checkout (Stripe/Wix bridge then migrate) 
  → Post-purchase: dashboard + cohort onboarding (B2/B3)
```

---

## What **not** to do first (common mistake)

- **Another long homepage section** without **instrumented** diagnosis.  
- **AI everywhere** without **report + human-trustable** outputs.  
- **Feature parity** with Udemy/Coursera **catalog breadth** — you’ll lose **focus** and **margin**.

---

## Suggested PRD sequencing

1. **Epic: Diagnosis + account + dashboard skeleton**
2. **Epic: Time-based micro-exams + persistence**
3. **Epic: Commerce bridge + pricing consistency**
4. **Epic: Trust/copy + SEO hygiene**
5. **Epic: AI assistant (v1 bounded)**

---

*Next step: fold Tier A acceptance criteria into `bmad-create-prd` and size engineering against Wix + custom backend split.*