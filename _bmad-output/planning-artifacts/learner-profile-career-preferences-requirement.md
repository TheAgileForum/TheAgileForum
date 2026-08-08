# Learner Profile Editor — Roles, Credentials & Future Intent (Later Sprint)

**Status:** Captured for **later sprint** (Sprint 2+/3 — after auth + diagnosis persistence are stable)  
**Owner:** Product + Learner experience  
**Related:** FR-1, FR-2, FR-5, FR-155–156, diagnosis intent timeline, LinkedIn OAuth login  
**New FRs:** FR-189 .. FR-195 (see `prd-agile-forum.md`)  
**Story:** Epic 1 · Story **1.4** Learner Career Profile Editor  

---

## Problem

Learners can log in (including LinkedIn OAuth) and set **diagnosis-session** target role / timeline, and high-level **interest preferences** for campaigns (FR-156). They cannot yet maintain a durable **career profile** that:

1. Edits core profile details  
2. Sets **multiple target roles** they are looking for  
3. Reviews/edits **trainings & certifications already completed** (seeded from LinkedIn when available)  
4. Declares **trainings & certifications they want next**  
5. States **how soon** they want to start / complete those goals  

Without this, personalization, campaigns, and recommendations under-use durable learner context.

## Goal

Authenticated learners can open **Account → Profile** (or equivalent) and create/update a governed career profile that feeds diagnosis defaults, recommendations, and interest-based campaigns — including LinkedIn-sourced credential inventory that the user can correct.

## Scope

### 1) Core profile edit (elaborates FR-2)
- Display name, email (read-only if OAuth-verified; change via verified flow if offered)
- Optional: phone, country/geo preference, headline/summary
- Save with validation + `profile_updated` event

### 2) Target roles (multi-select, persistent)
- Multi-select from founder-approved role list (same catalog as diagnosis Step 1, e.g. SM/APM, PO/PM, …)
- Optional primary target role flag
- Synced as default into new diagnosis sessions (user can still override per session)
- Emits `preferences_updated` / `target_roles_updated`

### 3) Completed trainings & certifications (have)
- List of credentials the learner **already has**
- **Import seed from LinkedIn** when OAuth scopes/API allow (certifications / education / accomplishments as available); store source = `linkedin` | `manual` | `resume_extract`
- User can **add, edit, remove**, mark verified/unverified, set year/issuer/credential URL
- LinkedIn import is **assistive**, not authoritative — user confirmation required before first save of imported items
- Graceful degradation when LinkedIn does not return certs (manual entry only)

### 4) Future trainings & certifications (want)
- Wishlist of catalog offerings and/or free-text credential goals (e.g. “PSM-I”, “SAFe POPM”, Mentorship)
- Prefer linking to published catalog codes when possible; allow custom labels
- Priority / order optional

### 5) Urgency / how soon
- Per wishlist item **or** profile-level default: e.g. ASAP / within 1 month / 1–3 months / 3–6 months / 6+ months / exploring
- Used by campaigns (FR-155), upsell ranking, and diagnosis defaults
- Must respect quiet hours / frequency caps (FR-60) when driving outreach

### 6) Privacy & consent
- Clear copy that LinkedIn data is imported only with user consent and can be deleted
- Retention aligns with NFR-S1 / NFR-S3
- User can disconnect LinkedIn and clear imported-only rows

## Explicit out of scope (this story)
- Scraping LinkedIn without OAuth / against LinkedIn ToS  
- Auto-enrolling users into catalog SKUs from wishlist  
- Admin editing learner credentials (may appear later on admin customer 360 — FR-184)  
- Full LinkedIn profile rewrite product (separate resume/LinkedIn **service** SKU)

## UX outline
1. **Profile** tab: identity fields + Save  
2. **Target roles** multi-select chips  
3. **Credentials I have** — table/cards + “Refresh from LinkedIn” + Add manual  
4. **What I’m looking for** — wishlist + urgency selector  
5. Empty states and “LinkedIn didn’t return certifications — add manually”

## API sketch (non-binding)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/profile` | Profile + roles + credentials + wishlist |
| PUT | `/api/v1/profile` | Update core profile fields |
| PUT | `/api/v1/profile/target-roles` | Replace multi-select target roles |
| GET/PUT | `/api/v1/profile/credentials` | Completed trainings/certs CRUD |
| POST | `/api/v1/profile/credentials/import/linkedin` | Fetch + propose LinkedIn-sourced items (preview) |
| GET/PUT | `/api/v1/profile/learning-goals` | Future trainings/certs + urgency |
| PUT | `/api/v1/profile/preferences` | Extend existing prefs (FR-156) to stay in sync |

Auth required. Diagnosis intent may **prefill** from profile but must not overwrite profile without explicit user save.

## Acceptance criteria
1. Learner can edit and save core profile fields; changes persist across sessions.  
2. Learner can select **one or more** target roles and see them on reload; new diagnosis sessions can default from them.  
3. After LinkedIn connect (when scopes available), learner can preview imported certifications/trainings and accept/edit/reject before save.  
4. Learner can manually maintain completed credentials without LinkedIn.  
5. Learner can maintain a future training/cert wishlist with **how soon** urgency.  
6. Campaign/recommendation surfaces can read profile goals/roles (contract documented); learner JWT cannot access another user’s profile.  
7. LinkedIn import failures show a recoverable empty state (manual add still works).  
8. Analytics: `profile_updated`, `target_roles_updated`, `credentials_imported`, `learning_goals_updated` (names finalizable).

## Sprint placement

| Window | Work |
|--------|------|
| Now–Sprint 1 | Keep diagnosis intent + FR-156 interests as-is |
| **Sprint 2+/3 (later)** | Story **1.4** + FR-189..195 |
| After 1.4 | Wire wishlist/urgency into campaign engine and upsell ranking |

## Dependencies
- Stable auth + LinkedIn OAuth (FR-1)  
- Founder-approved target role list (diagnosis SSOT)  
- Catalog codes for wishlist linking (FR-182)  
- LinkedIn API product/scopes review (certifications availability varies by LinkedIn app permissions)

## Traceability

| Artifact | Update |
|----------|--------|
| `prd-agile-forum.md` | FR-189..195; Tier B6; MVP item |
| `epics-agile-forum.md` | Story 1.4; T1.7–T1.9 |
| `mvp-sprint-build-order-agile-forum.md` | Sprint 2+/3 note |
| `api-contract-matrix.md` | Profile career endpoints |
| `pending-work-queue.md` / sprint tracker | Later-sprint backlog |
| This file | Authoritative elaboration |
