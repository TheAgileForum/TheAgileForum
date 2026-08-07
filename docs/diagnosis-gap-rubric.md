# Diagnosis AI gap rubric — where to edit

**Checklist (add founder suggestions here — injected into production prompt):**  
`server/src/diagnosis/gap-detection-rubric.md`

**Condensed SM / Agile PM coach guidelines (reference only, not injected):**  
`server/src/diagnosis/sm-apm-resume-guidelines-condensed.md`

Upstream founder file (outside repo):  
`c:\AgileForum\resume review guidelines- scrum master & Agile project manager.txt`

That production markdown is injected into the system prompt by `ai-prompt.ts` via `loadGapDetectionRubric()`. After edits, bump `DIAGNOSIS_PROMPT_VERSION` in `ai-diagnosis-schema.ts`. When the upstream guidelines change, distill into the condensed file + rubric (see skill sync steps).

**Cursor skill for iterating rules/tests:**  
`.cursor/skills/diagnosis-gap-rubric/SKILL.md`
