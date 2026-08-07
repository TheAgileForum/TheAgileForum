# Diagnosis gap-detection rubric

> **Founder edit point:** add or refine checklist items here.
> This file is loaded into the production diagnosis system prompt
> (`ai-prompt.ts` → `loadGapDetectionRubric()`).
> After editing, bump `DIAGNOSIS_PROMPT_VERSION` in `ai-diagnosis-schema.ts`.
> Iterate with the Cursor skill: `.cursor/skills/diagnosis-gap-rubric/SKILL.md`.
>
> Condensed coach source (SM / Agile PM resume review):
> `server/src/diagnosis/sm-apm-resume-guidelines-condensed.md`
> (distilled from founder guidelines outside the repo).

Evaluate the resume (and JD when present) against **every** category below.
For each category that fails or is weak, emit a **specific** gap chip naming the
missing evidence (not a vague label like "improve resume").
Prefer 6–12 evidence-backed gaps when the resume supports it; fewer only when
text is thin. Do not invent facts not grounded in the resume/JD.

## 1. Quantified impact / metrics
- [ ] Outcomes use numbers (%, $, time saved, velocity, defect rate, NPS, cycle time)?
- [ ] Delivery claims (shipped features, releases) include scale or result?
- [ ] Major bullets quantified (team size, % improvement, stakeholder count) — not bare responsibilities?
- [ ] Agile metrics present where claimed (velocity, sprint/PI predictability, lead/cycle time, escaped defects, release frequency, throughput, WIP, flow efficiency, MTTR/DORA, OKRs/KPIs, team/customer satisfaction)?
- [ ] Achievement-style outcomes (faster delivery, fewer impediments/dependencies, better planning accuracy, maturity lift) — not only task lists?
- Gap example: "No quantified sprint/delivery outcomes (velocity, cycle time, or % improvement)"
- Gap example: "Responsibilities lack numbers (team size, % improvement, or stakeholder scale)"

## 2. Role title vs Scrum Master / Agile PM evidence
- [ ] Title claims SM / Agile Coach / Agile PM but bullets show IC delivery, coordinator, or BA work only?
- [ ] Core Scrum events evidenced (Daily Scrum, Planning, Review, Retro, Backlog Refinement)?
- [ ] Broader facilitation where relevant (story mapping, capacity planning, release planning, product vision/roadmap workshops)?
- [ ] SAFe / scaled events when targeting SAFe/RTE/ART roles (PI Planning, ART Sync, Scrum of Scrums, Inspect & Adapt, dependency management)?
- [ ] Coaching/impediment removal/servant leadership — not only status reporting or ceremony logistics?
- [ ] Backlog refinement partnership with PO/stakeholders?
- [ ] Red flag: only ceremony facilitation with no ownership, coaching, transformation, or delivery impact?
- Gap example: "Title says Scrum Master but bullets lack facilitation/coaching evidence"
- Gap example: "Only ceremony facilitation listed; no ownership, coaching, or delivery impact"

## 3. Certification gaps (when claiming agile)
- [ ] Mentions agile/Scrum/SAFe work but lists no PSM/CSM/ICP/SAFe (or equivalent)?
- [ ] Lists expired or vague certs without level (e.g. "Scrum certified")?
- [ ] Target role / JD requires a cert the resume does not show?
- [ ] No certifications or continuous-learning section when agile leadership is claimed?
- Gap example: "Claims agile delivery experience but no PSM/CSM/SAFe certification listed"
- Note: recommend cert offerings only when certification is clearly indicated; do not pressure certs for pure hands-on gaps.

## 4. Tool depth vs name-drop
- [ ] Tools (Jira, Azure DevOps, Confluence, Miro, FigJam, Rally, VersionOne, etc.) appear only as a list?
- [ ] Missing how tools were used (boards, workflows, dashboards, automation, reporting)?
- Gap example: "Jira listed without workflow/board/reporting depth"

## 5. Leadership vs IC framing
- [ ] Bullets are task lists ("attended meetings", "updated tickets") vs ownership language?
- [ ] Missing influence across teams, stakeholders, conflict resolution, negotiation, or executive communication?
- [ ] Missing risk/dependency management or decision-making/facilitation evidence?
- [ ] Missing servant leadership, mentoring, or vendor/cross-functional leadership where seniority implies it?
- [ ] For senior targets: missing CoP, org-level change, or transformation leadership?
- [ ] Coaching depth: team / PO / SM / org coaching, CI, maturity assessment, workshops — or only self-facilitation?
- Gap example: "Framed as IC task executor; weak ownership/leadership language"
- Gap example: "No coaching evidence (team/PO coaching, workshops, or maturity work)"

## 6. ATS keywords / action verbs
- [ ] Weak verbs (helped, involved in, responsible for) dominate vs led/facilitated/coached/delivered?
- [ ] Missing role-critical keywords vs target role / JD — frameworks (Scrum, Kanban, SAFe, Lean, XP, Scrumban), events (Sprint/PI Planning, ART), product (backlog, WSJF, MVP, story mapping), delivery (release/program management), DevOps (CI/CD, TDD/BDD), leadership (servant leadership, coaching, stakeholder management, transformation)?
- [ ] Skills section incomplete/outdated vs claimed experience and 2026 SM/APM expectations?
- Gap example: "Weak action verbs; missing Scrum event / stakeholder keywords for ATS"
- Gap example: "Missing SAFe/PI Planning or scaled-Agile keywords for target role"

## 7. Length / format (from detectable text signals)
- [ ] Extremely short (<~150 words) or thin bullets for years of experience claimed?
- [ ] Dense walls of text with no scannable bullets?
- [ ] Obvious section gaps (no summary, no skills, no education/certs section when expected)?
- [ ] Dates/roles look inconsistent or overlapping without explanation (only if clear in text)?
- [ ] Signals of ATS-hostile layout (critical content only in tables/graphics; icon-only skills) when detectable from extract?
- [ ] Repeated identical responsibilities across roles, or inconsistent tense (past vs present)?
- Gap example: "Resume text too thin for claimed experience; hard for ATS/recruiters to scan"
- Gap example: "Repeated responsibilities / inconsistent tense across roles"

## 8. JD alignment (only when JD provided)
- [ ] Required skills/tools/domain from JD missing on resume?
- [ ] Seniority mismatch (JD asks for coaching/SAFe/RTE; resume shows team-level SM only)?
- [ ] Domain/industry keywords from JD absent?
- Gap example: "JD requires PI Planning / SAFe; resume shows team Scrum only"

## 9. Interview / situational readiness signals
- [ ] Resume lacks conflict, change, or stakeholder-challenge stories (useful interview ammo)?
- [ ] No evidence of metrics-driven improvement conversations?
- Gap example: "Few situational/conflict or metrics stories for interview prep"

## 10. Hands-on / live-project readiness
- [ ] Theory/cert-heavy with little end-to-end delivery or live project ownership?
- [ ] Missing Agile PM skills (roadmap, prioritization, discovery, MVP/MMP) when targeting APM/PO-adjacent roles?
- [ ] Missing domain/industry context on projects when experience is claimed?
- Gap example: "Certification-heavy; limited live-project / end-to-end delivery evidence"

## 11. Professional summary (high priority for SM / Agile PM)
- [ ] Summary targets Scrum Master / Agile PM (not developer, coordinator, or generic PM)?
- [ ] Opens with total IT experience and years specifically as SM / Agile PM?
- [ ] Positions as Agile leader/expert with transformation, servant leadership, coaching, stakeholder management, metrics, and/or delivery management signals?
- [ ] Mentions industries/domains and relevant certs (CSM, PSM, SAFe, SPC, etc.) when they exist elsewhere on resume?
- [ ] Includes modern AI/delivery exposure when claiming current-market readiness?
- Gap example: "Summary reads as developer/coordinator/generic PM — not SM/Agile PM positioning"
- Gap example: "Summary omits SM tenure, transformation/coaching, or Agile leadership signals"

## 12. Experience section structure
- [ ] Each role/project states role title, team size, Agile methodology, and tools/domain where applicable?
- [ ] Responsibilities balanced with achievements and business impact (not JD-style duty lists only)?
- [ ] Ownership visible (led, coached, removed impediments, improved predictability) vs passive phrasing?
- Gap example: "Projects list duties only — missing team size, methodology, achievements, or impact"
- Gap example: "Experience reads like a job description; little ownership or business impact"

## 13. AI readiness / modern delivery literacy
- [ ] No AI-assisted delivery signal (tools, ceremony support, backlog/story/AC generation, sprint reporting, Jira automation, adoption coaching) when targeting current SM/APM roles?
- [ ] AI tools name-dropped without usage context (same as other tool depth rules)?
- Gap example: "No AI-assisted delivery or productivity signal for modern SM/APM roles"
- Gap example: "AI tools listed without ceremony, backlog, or automation usage evidence"

## Gap chip writing rules
- One concrete issue per chip; cite the missing evidence type.
- Prefer coach-style specificity a human SM trainer would say (summary mis-positioning, missing metrics, ceremony-only, no coaching, no AI signal, etc.).
- Avoid guarantees ("will get hired"), salary claims, or non-catalog recommendations.
- Strengths should also be specific and evidence-based (1–8 chips).
- Common red flags to chip when evidenced: coordinator framing; no transformation/leadership/coaching; no metrics; ceremony-only; missing stakeholder/risk/dependency management; buzzwords without evidence; summary/target-role mismatch.
