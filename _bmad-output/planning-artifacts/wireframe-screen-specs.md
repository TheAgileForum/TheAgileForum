# The Agile Forum - Wireframe Screen Specs (Screen-by-Screen)

**Author:** Dhirender  
**Date:** 2026-05-27  
**Source Inputs:** `ux-design-specification.md`, `prd-agile-forum.md`, `epics-agile-forum.md`

---

## 1) Global Shell (Applies to All Primary Screens)

### Purpose

Provide consistent orientation, trust cues, and a persistent next-action path.

### Layout Zones

- **Header:** logo, role context, auth status, AI Coach entry.
- **Main content:** screen-specific content.
- **Sticky action rail (contextual):** one primary CTA, optional secondary.
- **Footer (public) / bottom nav (mobile app-like behavior):** Home, Diagnose, Learn, AI Coach, Profile.

### Core Patterns

- One dominant CTA per viewport section.
- Persistent "Continue where you left off" if resumable state exists.
- Trust/compliance block near high-stakes actions.

---

## 2) Screen: Home (Outcome-Led Landing)

### Screen Goal

Move users from exploration to diagnosis with confidence.

### Wireframe Structure

- **Hero block:** role-transition headline + primary CTA (`Start Diagnosis`) + secondary CTA (`Book Paid Mentor Call`).
- **Proof strip:** outcomes/testimonials/social trust.
- **How it works (3-step):** Diagnose -> Recommend -> Advance.
- **Upcoming webinars module:** next free sessions.
- **Role pathways cards:** SM / PO / PM / RTE / Agile leadership.
- **Footer trust links:** policy, contact, social, legal.

### Key Interactions

- Role card click prefilters diagnosis context.
- Webinar cards route to booking.
- CTA always visible on mobile via sticky button.

### States

- Default visitor
- Logged-in return user (show "Continue journey")
- Campaign variant (limited promo with dismiss control)

---

## 3) Screen: Diagnosis Start (Step 1 - Intent + Consent)

### Screen Goal

Capture user objective and required consent with low friction.

### Wireframe Structure

- **Progress header:** Step 1 of 4.
- **Goal selection block:** role transition intent + timeline.
- **Consent block:** data use acknowledgement (resume/JD usage).
- **Primary CTA:** `Continue`.

### Validation Rules

- Goal required.
- Consent required to proceed.

### Error Handling

- Inline error + summary bar at top.

---

## 4) Screen: Diagnosis Input (Step 2 - Resume + Optional JD)

### Screen Goal

Capture profile context quickly and clearly.

### Wireframe Structure

- **Progress header:** Step 2 of 4.
- **Resume input tabs:** Upload / Paste text.
- **Target role selector**
- **Optional JD input:** URL or pasted JD text.
- **Tips accordion:** what makes a strong input.
- **Primary CTA:** `Run Analysis`.

### Key Interactions

- Drag/drop + file validation feedback.
- Character counter for pasted inputs.
- Save draft on field updates.

### States

- Upload success
- Invalid file/type
- No input error
- Network failure retry

---

## 5) Screen: Analysis In Progress (Step 3 - Processing)

### Screen Goal

Maintain trust during async processing.

### Wireframe Structure

- **Progress animation:** staged labels (Parsing -> Mapping -> Insight generation).
- **Context recap card:** selected role + uploaded source.
- **Optional support:** "Need help?" AI coach quick prompt.

### Behavior

- Auto-transition on completion.
- Timeout fallback with retry.

---

## 6) Screen: Diagnosis Results (Step 4 - Insight + Next Action)

### Screen Goal

Deliver clarity and momentum in one view.

### Wireframe Structure

- **Readiness summary header:** confidence statement + score context.
- **Skill gap panel:** strengths, gaps, priority improvements.
- **Recommendation rationale card:** why this path fits.
- **Roadmap preview (4-8 weeks):** first 3 milestones.
- **Primary CTA module:** one recommended next action.
- **Secondary actions:** `Take Micro-Exam`, `Join Webinar`, `Book Paid Mentor Call`.

### Critical UX Rules

- Plain-language summaries before detailed metrics.
- No more than one primary recommendation.

---

## 7) Screen: Learner Dashboard (Home for Return Users)

### Screen Goal

Convert one-time diagnosis into ongoing progress behavior.

### Wireframe Structure

- **Welcome + continuation rail:** resume exact prior step.
- **Skill snapshot cards:** out-of-10 metrics.
- **View toggle:** chart / table accessible mode.
- **Roadmap task list:** next task with status badges.
- **Saved items block:** bookmarked courses/services.
- **Recommendation refresh card:** updated next action.

### Interactions

- Toggle view persists per user preference.
- Task completion updates progress indicators.

---

## 8) Screen: Micro-Exam Flow

### 8A) Micro-Exam Start

- competency selection, duration, instructions, `Start Exam`.

### 8B) Micro-Exam Attempt

- timer, one-question focus, previous/next, submit guardrails.

### 8C) Micro-Exam Result

- score summary, strengths/gaps, impact on recommendations, next CTA.

### Design Notes

- Keep cognitive load minimal; no heavy proctoring UI.
- Always show time left and progress count.

---

## 9) Screen: Recommendation Detail / Offer Decision

### Screen Goal

Build conversion confidence before checkout.

### Wireframe Structure

- **Offer summary hero:** title, audience, outcomes.
- **Why this fits you:** personalized rationale chips.
- **Schedule selector (if required)**
- **Pricing block:** fee + inclusions + policy links.
- **Trust block:** proof/disclaimer/compliance notes.
- **Primary CTA:** `Proceed to Checkout`.

### States

- Auth required gate
- Schedule missing warning
- Currency override available

---

## 10) Screen: Checkout (Standard + Org Reimbursement Branch)

### Screen Goal

Complete purchase reliably with context continuity.

### Wireframe Structure

- **Order summary**
- **User details + billing**
- **Payment method panel**
- **Optional branch:** Organization reimbursement fields (eligible carts only)
- **Confirmation CTA**

### UX Requirements

- Preserve cart and flow state across auth interruptions.
- Show clear success state with next onboarding step.

---

## 11) Screen: Webinar Hub + Booking

### Screen Goal

Support discovery and re-entry into core funnel.

### Wireframe Structure

- **Upcoming sessions list** (topic, date, host, seats)
- **Filters:** role/topic/date
- **Booking panel:** simple registration for logged-in users
- **Post-booking block:** reminder settings + recommended next action

### Post-Attendance Extension

- attendance code entry
- feedback form
- certificate status/download

---

## 12) Screen: Paid Mentor Call Booking

### Screen Goal

Offer paid human support path without breaking momentum.

### Wireframe Structure

- **Slot picker**
- **Goal/intake form**
- **Pricing block:** geo-priced call fee (`$9` for USA, `INR 49` for India)
- **Currency/location confirmation control** (auto-detect with override)
- **Payment confirmation step**
- **Confirmation summary**
- **Follow-up recommendation block**

### UX Notes

- Keep this lightweight: booking + payment in <= 3 minutes.
- Maintain return links to diagnosis/dashboard.

---

## 13) Screen: AI Coach (Persistent Assist Surface)

### Screen Goal

Provide confidence-recovery and decision support across all journeys.

### Wireframe Structure

- **Context header:** current page context.
- **Conversation pane**
- **Suggested prompts chips**
- **Escalation controls:** contact support / book mentor call.

### Behavior

- Context-aware responses by journey stage.
- Low-confidence response triggers escalation option.

---

## 14) Screen: Profile, Preferences, and Communication Controls

### Screen Goal

Enable user control over personalization and messaging.

### Wireframe Structure

- **Profile basics**
- **Role goals and interest preferences**
- **Channel preferences:** email/notifications/consent
- **Saved pathway settings**

### UX Notes

- Explicit consent/unsubscribe controls.
- Explain how preferences influence recommendations.

---

## 15) Shared Screen States (All Journeys)

### Empty States

- Explain value + first action CTA.

### Loading States

- Skeletons with meaningful labels, not spinner-only.

### Error States

- Plain-language reason + clear recovery action.

### Success States

- Confirmation + next-best-action in same viewport.

---

## 16) Breakpoint Mapping Per Screen

- **Mobile (320-767):** single-column, sticky primary CTA, bottom nav.
- **Tablet (768-1023):** selective two-column modules for comparison.
- **Desktop (1024+):** multi-panel decision context (insight + rationale + action).
- **Large desktop (1280+):** analytics-enhanced dashboard/admin layouts.

---

## 17) Handoff Notes for UI/Engineering

- Implement each screen using MUI base components + The Agile Forum custom layer.
- Prioritize screen build order:
  1. Home
  2. Diagnosis flow (steps 1-4)
  3. Results + recommendation
  4. Dashboard
  5. Checkout
  6. Webinar and mentor flows
  7. AI coach and profile controls
- Tie every screen CTA/state to analytics events defined in the PRD instrumentation list.