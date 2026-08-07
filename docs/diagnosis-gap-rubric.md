# Diagnosis AI gap rubric — where to edit

**Checklist (add founder suggestions here):**  
`server/src/diagnosis/gap-detection-rubric.md`

That markdown is injected into the production system prompt by `ai-prompt.ts` via `loadGapDetectionRubric()`. After edits, bump `DIAGNOSIS_PROMPT_VERSION` in `ai-diagnosis-schema.ts`.

**Cursor skill for iterating rules/tests:**  
`.cursor/skills/diagnosis-gap-rubric/SKILL.md`
