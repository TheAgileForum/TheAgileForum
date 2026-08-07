---
name: diagnosis-gap-rubric
description: >-
  Extends and iterates the diagnosis AI resume gap-detection rubric for TheAgileForum
  Scrum Master / Agile PM reviews. Use when the founder wants richer diagnosis gaps,
  adds new gap rules, edits gap-detection-rubric.md, bumps DIAGNOSIS_PROMPT_VERSION,
  or tests diagnosis prompt changes.
disable-model-invocation: true
---

# Diagnosis gap-detection rubric

Helps iterate the production diagnosis AI checklist so resume reviews catch more
coach-quality gaps (metrics, SM evidence, certs, tools, ATS, JD fit, etc.).

## Where to edit (source of truth)

| What | Path |
|------|------|
| **Rubric checklist** | `server/src/diagnosis/gap-detection-rubric.md` |
| Prompt wiring | `server/src/diagnosis/ai-prompt.ts` |
| Schema / gap count / version | `server/src/diagnosis/ai-diagnosis-schema.ts` |
| Loader | `server/src/diagnosis/load-gap-rubric.ts` |

Comment in `ai-prompt.ts` also points here. Production loads the markdown via
`loadGapDetectionRubric()` into the system prompt. `npm run build` copies the `.md`
into `dist/diagnosis/`.

## Add a new gap rule (founder suggestions)

1. Open `server/src/diagnosis/gap-detection-rubric.md`.
2. Add a section **or** a `- [ ]` item under an existing category.
3. Add one **Gap example:** line showing the chip phrasing you want the model to emit.
4. Keep chips specific and evidence-based (what is missing), not vague ("improve resume").
5. Bump `DIAGNOSIS_PROMPT_VERSION` in `ai-diagnosis-schema.ts` (e.g. `diagnosis-ai-v3` → `v4`) so audit logs show the new prompt.
6. If chips need more room, raise `gaps` / `strengths` `.max(N)` in the Zod schema **and** the schema blurb in `ai-prompt.ts` together (current target: up to 12 gaps).
7. Run unit tests: `cd server && npm test -- src/diagnosis`.
8. Optional live smoke: set `AI_PROVIDER_MODE=live` with a sample SM resume and confirm gap chips reflect the new rule.

## Rubric writing rules

- One concrete issue per checklist item; name the missing evidence type.
- Prefer Scrum Master / Agile PM coach language the founder already uses manually.
- Never instruct the model to guarantee jobs, salary, or cert pass rates.
- Recommendations stay on the catalog allowlist in `ai-prompt.ts` / schema.
- When JD is absent, skip JD-only categories (already noted in the rubric).

## Test prompts (manual)

Use these shapes when validating a rubric change:

**Thin metrics resume** — SM title, Jira name-drop, no %, no facilitation verbs → expect gaps for metrics, tool depth, SM evidence.

**Cert-claim gap** — agile delivery bullets, no PSM/CSM/SAFe → expect certification gap chip; primaryAction may still be mentorship if hands-on gaps dominate.

**With JD** — paste a SAFe/PI Planning JD against a team-level SM resume → expect JD alignment gap.

**Scanned/empty resume** — empty extract → confidence ≤ 0.55; rationale label "Resume file".

## Do not

- Hard-code one-off gap strings only in `ai-prompt.ts` — put them in the markdown rubric.
- Invent offerings outside `DIAGNOSIS_OFFERING_ALLOWLIST`.
- Lower schema max without updating the prompt schema blurb (and vice versa).

## Example new categories (ready to paste)

```markdown
## 11. Remote / timezone collaboration
- [ ] Claims distributed teams but no timezone, async, or tooling evidence?
- Gap example: "Distributed-team claim without async/timezone collaboration evidence"

## 12. AI / modern delivery literacy
- [ ] Target roles mention AI-assisted delivery; resume has no AI/tooling signal?
- Gap example: "No AI-assisted delivery or modern tooling signal for target role"
```
