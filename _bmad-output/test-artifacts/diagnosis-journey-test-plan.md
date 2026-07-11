# Diagnosis Journey QA Plan (FR-3..7, FR-158..160)

**Status:** Active — routes live in `server/src/routes/diagnosis.routes.ts`  
**Target:** Epic 2, EPIC-UX-01/02  
**API matrix:** `api-contract-matrix.md` §2 (diagnosis rows), validation rules 1 and 5

## FR mapping

| FR | Requirement | Automated coverage |
|----|-------------|-------------------|
| FR-3 | Consent required before analyze | `diagnosis.integration.test.ts` (IT-02) |
| FR-4 | Goals + resume upload/paste | `diagnosis.integration.test.ts` (happy path) |
| FR-5 | Optional target role / JD | `diagnosis.contract.test.ts`; JD path (pending) |
| FR-6 | Structured skill-gap summary | `diagnosis.integration.test.ts` (result payload) |
| FR-7 | Map outcomes to eligible offers | `result-enrichment.test.ts`; integration result `recommendation` |
| FR-12 | One primary recommendation CTA | `diagnosis.integration.test.ts` (IT-09) |
| FR-158 | Role X → Role Y pathway selection | FE e2e (pending); API intent fields (partial) |
| FR-159 | 4–8 week transition planner | `diagnosis.integration.test.ts` (`roadmapPreview` length) |
| FR-160 | Save/track roadmap progress | `journey-state` GET (partial); dashboard PATCH (pending) |
| FR-181 | Upsell on diagnosis results | `recommendations/upsell` API test (pending) |

## Unit / contract tests (implemented)

| File | Scope |
|------|-------|
| `server/src/diagnosis/diagnosis.contract.test.ts` | Request/response shapes, error codes |
| `server/src/diagnosis/result-enrichment.test.ts` | Result enrichment, primary action, escalation |

## Integration tests (implemented)

| ID | Scenario | File |
|----|----------|------|
| IT-01 | Anonymous happy path: session → intent → resume → analyze → result → journey | `diagnosis.integration.test.ts` |
| IT-02 | Blocks analyze without consent (`CONSENT_REQUIRED`) | `diagnosis.integration.test.ts` |
| IT-03 | Journey resumes at step 2 after intent saved | `diagnosis.integration.test.ts` |
| IT-04 | Rejects unsupported resume mime (`UNSUPPORTED_MIME`) | `diagnosis.integration.test.ts` |
| IT-09 | Result returns exactly one primary action | `diagnosis.integration.test.ts` |

## Integration tests (pending)

- [ ] IT-05: JD save path (`PUT /diagnosis/session/{id}/jd`) before analyze
- [ ] IT-06: Analyze rejected when intent incomplete (missing `targetRole`)
- [ ] IT-07: Poll timeout / failed run surfaces retryable error contract
- [ ] IT-08: Authenticated diagnosis binds session to user on login
- [ ] IT-10: `primary_action` payload always includes `label`, `href` or `actionType`
- [ ] IT-11: Low-confidence tier triggers escalation block in result (stub worker)
- [ ] IT-12: `diagnosis_started`, `analysis_requested`, `analysis_completed_viewed` events emitted
- [ ] IT-13: Role pathway prefill from home role card (`campaign_id` / `role_intent`)
- [ ] IT-14: Roadmap task PATCH updates journey progress (FR-160)

## Manual / E2E scenarios

1. Start diagnosis from homepage hero CTA — diagnosis remains primary over catalog nav (FR-161 cross-check).
2. Upload resume → see validation feedback → continue to analysis.
3. Drop off at step 2 → return via "Continue where you left off" → resume at step 2.
4. Complete diagnosis → primary CTA routes to recommended offer in session currency (FR-13, FR-178).
5. Low-confidence result shows escalation module without blocking secondary actions.
6. Role-based upsell rail on step 4 shows SAFe cert + mock interview SKUs (FR-181).

## Commands

```powershell
cd C:\AgileForum\mybmadproj\server
npm run test -- src/diagnosis
npm run test:integration -- src/diagnosis/diagnosis.integration.test.ts
```
