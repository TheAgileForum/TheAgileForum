# SM / Agile PM resume review guidelines (condensed)

> **Purpose:** Source-of-truth reference for coach rules folded into the production
> gap rubric. Not injected into the AI prompt — keep this file condensed;
> production checklist lives in `gap-detection-rubric.md`.
>
> **Upstream:** Founder guidelines file (outside repo):
> `c:\AgileForum\resume review guidelines- scrum master & Agile project manager.txt`
>
> **Sync:** When the upstream file changes, distill new must-check rules here and
> into `gap-detection-rubric.md`, then bump `DIAGNOSIS_PROMPT_VERSION`.
> See `.cursor/skills/diagnosis-gap-rubric/SKILL.md`.

## Must-check categories (intent preserved)

### 1. Professional summary (highest priority)
- Role-specific SM / Agile PM positioning (not developer, coordinator, generic PM).
- Years of IT experience + years as SM / Agile PM.
- Agile expert/leader signals: transformation, servant leadership, coaching,
  stakeholder management, Agile metrics, delivery management.
- Domains/industries, certs (CSM/PSM/SAFe/SPC…), AI exposure when relevant.

### 2. Experience section structure
Each project should cover: role, team size, methodology, responsibilities,
achievements, business impact, metrics, tools, domains.
Avoid duty-only / job-description resumes with no ownership.

### 3. Achievements & quantification
Prefer measurable outcomes: velocity, defects, lead/cycle time, sprint/PI
predictability, release frequency, WIP/dependencies, stakeholder satisfaction,
Agile maturity, planning accuracy.
Every major responsibility should ideally carry numbers (team size, %, scale).

### 4. Scrum Master / scaled responsibilities
Core events: Daily Scrum, Planning, Review, Retro, Refinement.
Also: vision/roadmap/story mapping, capacity planning, release planning/management,
PI Planning, ART Sync, Scrum of Scrums, I&A, dependency management, Agile governance.
Red flag: ceremony facilitation only.

### 5. Agile coaching
Team / PO / SM coaching, org coaching, continuous improvement, maturity assessment,
CoPs, workshops — not only self-run ceremonies.

### 6. Metrics vocabulary
Velocity, predictability, lead/cycle time, escaped defects, release frequency,
throughput, flow efficiency, WIP, MTTR, DORA, OKRs/KPIs, satisfaction/happiness.

### 7. Leadership
Stakeholder management, conflict resolution, negotiation, executive communication,
vendor/cross-functional leadership, risk & dependency management, facilitation,
servant leadership, decision making.

### 8. AI readiness (2026)
Tools (Copilot, Claude, Gemini, Cursor, NotebookLM, Jira/Confluence AI, Azure AI,
agents) plus usage: ceremonies, backlog/story/AC generation, sprint reporting,
risk analysis, documentation, Jira automation, adoption coaching.

### 9. ATS keyword clusters (do not dump full lists into prompt)
Frameworks: Scrum, Kanban, SAFe, Lean, XP, Scrumban, Business Agility, LPM.
Delivery: Agile/Program/Release management, Iteration/Sprint/PI Planning, ART/RTE.
Product: backlog, WSJF, Cost of Delay, MVP/MMP, story mapping, prioritization.
Engineering: DevOps, CI/CD, TDD/BDD, test automation.
Leadership: coaching, mentoring, facilitation, servant leadership, transformation.

### 10. Formatting / red flags
~2 pages (3 only if 15+ YOE justified); ATS-friendly; no critical content only in
tables/graphics; strong verbs; consistent tense; no repeated duties.
Red flags: coordinator framing; no transformation/leadership/coaching/metrics;
ceremony-only; missing SAFe/PI where applicable; buzzwords without evidence;
summary/target mismatch; incomplete skills/certs sections.

## Explicitly not copied verbatim into the prompt
- Full exhaustive skills list (frameworks through Liberating Structures) — too
  large; condensed into ATS clusters + category checks above.
- Long ❌/✅ example pairs — intent kept as quantification/ownership rules.
- Duplicate keyword spam (e.g. repeated "Scrum") — cleaned in distillation.
