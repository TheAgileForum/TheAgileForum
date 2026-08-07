# Diagnosis gap-detection rubric

> **Founder edit point:** add or refine checklist items here.
> This file is loaded into the production diagnosis system prompt
> (`ai-prompt.ts` → `loadGapDetectionRubric()`).
> After editing, bump `DIAGNOSIS_PROMPT_VERSION` in `ai-diagnosis-schema.ts`.
> Iterate with the Cursor skill: `.cursor/skills/diagnosis-gap-rubric/SKILL.md`.

Evaluate the resume (and JD when present) against **every** category below.
For each category that fails or is weak, emit a **specific** gap chip naming the
missing evidence (not a vague label like "improve resume").
Prefer 6–12 evidence-backed gaps when the resume supports it; fewer only when
text is thin. Do not invent facts not grounded in the resume/JD.

## 1. Quantified impact / metrics
- [ ] Outcomes use numbers (%, $, time saved, velocity, defect rate, NPS, cycle time)?
- [ ] Delivery claims (shipped features, releases) include scale or result?
- Gap example: "No quantified sprint/delivery outcomes (velocity, cycle time, or % improvement)"

## 2. Role title vs Scrum Master / Agile PM evidence
- [ ] Title claims SM / Agile Coach / Agile PM but bullets show IC delivery or BA work only?
- [ ] Evidence of facilitation (Daily Scrum, Planning, Review, Retro)?
- [ ] Evidence of coaching/impediment removal/servant leadership (not only status reporting)?
- [ ] Evidence of backlog refinement partnership with PO/stakeholders?
- Gap example: "Title says Scrum Master but bullets lack facilitation/coaching evidence"

## 3. Certification gaps (when claiming agile)
- [ ] Mentions agile/Scrum/SAFe work but lists no PSM/CSM/ICP/SAFe (or equivalent)?
- [ ] Lists expired or vague certs without level (e.g. "Scrum certified")?
- [ ] Target role / JD requires a cert the resume does not show?
- Gap example: "Claims agile delivery experience but no PSM/CSM/SAFe certification listed"
- Note: recommend cert offerings only when certification is clearly indicated; do not pressure certs for pure hands-on gaps.

## 4. Tool depth vs name-drop
- [ ] Tools (Jira, Azure DevOps, Confluence, Miro, FigJam, Rally) appear only as a list?
- [ ] Missing how tools were used (boards, workflows, dashboards, automation, reporting)?
- Gap example: "Jira listed without workflow/board/reporting depth"

## 5. Leadership vs IC framing
- [ ] Bullets are task lists ("attended meetings", "updated tickets") vs ownership language?
- [ ] Missing influence across teams, stakeholders, or conflict/impediment resolution?
- [ ] For senior targets: missing mentoring, community of practice, or org-level change?
- Gap example: "Framed as IC task executor; weak ownership/leadership language"

## 6. ATS keywords / action verbs
- [ ] Weak verbs (helped, involved in, responsible for) dominate vs led/facilitated/coached/delivered?
- [ ] Missing role-critical keywords vs target role / JD (Scrum events, WIP limits, PI Planning, OKRs, stakeholder management)?
- Gap example: "Weak action verbs; missing Scrum event / stakeholder keywords for ATS"

## 7. Length / format (from detectable text signals)
- [ ] Extremely short (<~150 words) or thin bullets for years of experience claimed?
- [ ] Dense walls of text with no scannable bullets?
- [ ] Obvious section gaps (no summary, no skills, no education/certs section when expected)?
- [ ] Dates/roles look inconsistent or overlapping without explanation (only if clear in text)?
- Gap example: "Resume text too thin for claimed experience; hard for ATS/recruiters to scan"

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
- [ ] Missing Agile PM skills (roadmap, prioritization, discovery) when targeting APM/PO-adjacent roles?
- Gap example: "Certification-heavy; limited live-project / end-to-end delivery evidence"

## Gap chip writing rules
- One concrete issue per chip; cite the missing evidence type.
- Prefer coach-style specificity a human SM trainer would say.
- Avoid guarantees ("will get hired"), salary claims, or non-catalog recommendations.
- Strengths should also be specific and evidence-based (1–8 chips).
