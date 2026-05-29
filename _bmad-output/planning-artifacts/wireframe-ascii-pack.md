# The Agile Forum - Low-Fidelity Wireframe Pack (ASCII)

**Author:** Dhirender  
**Date:** 2026-05-27  
**Source:** `wireframe-screen-specs.md`

---

## Conventions

- `[P]` = Primary action
- `[S]` = Secondary action
- `(i)` = helper/info
- `{state}` = dynamic state/condition
- Mobile-first shapes shown first; desktop adaptation noted under each screen

---

## 1) Global Shell

```text
+--------------------------------------------------+
| LOGO                     AI Coach     Profile    |
+--------------------------------------------------+
|                                                  |
|                 Screen Content                   |
|                                                  |
+--------------------------------------------------+
| [P] Next Best Action            [S] Save / Back  |
+--------------------------------------------------+
| Home | Diagnose | Learn | Coach | Profile        |
+--------------------------------------------------+
```

Desktop adaptation:

```text
+----------------------+-------------------------------------------+
| Left Nav (optional)  | Header: Search / Coach / Profile         |
| Home                 +-------------------------------------------+
| Diagnose             |                                           |
| Learn                |             Main Content                  |
| Dashboard            |                                           |
| Profile              |                                           |
+----------------------+-------------------------------------------+
|                  Context Action Rail (sticky)                    |
+------------------------------------------------------------------+
```

---

## 2) Home (Outcome-Led Landing)

```text
+--------------------------------------------------+
| LOGO                               Login/Signup  |
+--------------------------------------------------+
| "Find your fastest path to Agile role growth"    |
| [P] Start Diagnosis    [S] Book Paid Mentor Call |
| (i) Role pathways: SM | PO | PM | RTE            |
+--------------------------------------------------+
| Proof: outcomes | testimonials | trust badges     |
+--------------------------------------------------+
| How it works: Diagnose -> Recommend -> Advance    |
+--------------------------------------------------+
| Upcoming Webinars                                  |
| [Card] Topic | Date | [S] View [P] Join           |
+--------------------------------------------------+
| Footer: About | FAQ | Contact | Policy | Social   |
+--------------------------------------------------+
```

---

## 3) Diagnosis Step 1 (Intent + Consent)

```text
+--------------------------------------------------+
| Step 1/4: Goals & Consent                        |
+--------------------------------------------------+
| What is your target role?                        |
| ( ) Scrum Master  ( ) PO  ( ) PM  ( ) RTE        |
| ( ) Agile Coach  ( ) Leadership                  |
|                                                  |
| Timeline: [3 mo v]                               |
| Current status: [Working Professional v]          |
|                                                  |
| [ ] I consent to resume/JD analysis terms         |
+--------------------------------------------------+
| [S] Back                           [P] Continue   |
+--------------------------------------------------+
```

---

## 4) Diagnosis Step 2 (Resume + Optional JD)

```text
+--------------------------------------------------+
| Step 2/4: Profile Inputs                         |
+--------------------------------------------------+
| Resume Input: [ Upload ] [ Paste ]               |
| +----------------------------------------------+ |
| | Drop resume here / Choose file               | |
| +----------------------------------------------+ |
| {upload_state: idle|success|error}              |
|                                                  |
| Target Role: [ Product Owner v ]                |
| Optional JD: [ Paste text / URL ]               |
| +----------------------------------------------+ |
| | JD content area                              | |
| +----------------------------------------------+ |
| (i) Better input -> better recommendations       |
+--------------------------------------------------+
| [S] Back                     [P] Run Analysis    |
+--------------------------------------------------+
```

---

## 5) Diagnosis Step 3 (Analysis In Progress)

```text
+--------------------------------------------------+
| Step 3/4: Analyzing your profile                 |
+--------------------------------------------------+
| [##########------] 67%                           |
| Current stage: Mapping skills to target role     |
|                                                  |
| Context recap:                                   |
| - Role: Product Owner                            |
| - Resume: uploaded_resume.pdf                    |
| - JD: provided                                   |
|                                                  |
| (i) This usually takes under a minute            |
| [S] Ask AI Coach                                 |
+--------------------------------------------------+
```

---

## 6) Diagnosis Step 4 (Results + Next Action)

```text
+--------------------------------------------------+
| Step 4/4: Your Career Gap Summary                |
+--------------------------------------------------+
| Readiness: 6.8/10  | Confidence: High            |
| "You are close. Focus on backlog strategy +..."  |
+---------------------------+----------------------+
| Strengths                 | Gaps                 |
| - stakeholder mgmt        | - prioritization     |
| - agile basics            | - product metrics    |
+---------------------------+----------------------+
| Why this recommendation fits you                 |
| [Rationale chips + short explanation]            |
+--------------------------------------------------+
| 4-8 week roadmap preview                          |
| W1: Module A   W2: Practice B   W3: Mock C       |
+--------------------------------------------------+
| [P] Start Recommended Path                        |
| [S] Take Micro-Exam  [S] Join Webinar [S] Mentor |
+--------------------------------------------------+
```

---

## 7) Dashboard (Return User Home)

```text
+--------------------------------------------------+
| Welcome back, Dhirender                          |
| Continue where you left off: [P] Resume W2 Task  |
+--------------------------------------------------+
| Skill Snapshot (View: [Chart v] [Table])         |
| +----------------+ +----------------+ +---------+ |
| | Agile: 7.5     | | Product: 6.1   | | Comm 8 | |
| +----------------+ +----------------+ +---------+ |
+--------------------------------------------------+
| Roadmap Tasks                                     |
| [ ] W2: Product Metrics Mini-Project             |
| [x] W1: Agile Foundations Review                 |
| [ ] Mock interview prep                           |
+--------------------------------------------------+
| Saved Items                                       |
| [Card] PO Cohort         [S] Remove              |
| [Card] Mock Interview PM [S] Remove              |
+--------------------------------------------------+
| Next Best Action: [P] Take Timed Micro-Exam      |
+--------------------------------------------------+
```

---

## 8A) Micro-Exam Start

```text
+--------------------------------------------------+
| Micro-Exam: Product Prioritization               |
+--------------------------------------------------+
| Duration: 15 minutes                             |
| Questions: 12                                    |
| Difficulty: Intermediate                         |
|                                                  |
| Instructions:                                    |
| - one question at a time                         |
| - timer continues until submit                   |
|                                                  |
| [S] Back                        [P] Start Exam   |
+--------------------------------------------------+
```

## 8B) Micro-Exam Attempt

```text
+--------------------------------------------------+
| Q 3/12                               11:42 left  |
+--------------------------------------------------+
| Which signal best indicates product-market fit?  |
| ( ) Option A                                     |
| ( ) Option B                                     |
| ( ) Option C                                     |
| ( ) Option D                                     |
+--------------------------------------------------+
| [S] Previous         [S] Skip        [P] Next    |
+--------------------------------------------------+
```

## 8C) Micro-Exam Result

```text
+--------------------------------------------------+
| Result: 8/12 (67%)                               |
+--------------------------------------------------+
| Strength: stakeholder communication               |
| Gap: hypothesis validation                        |
| Recommendation impact: pathway updated            |
+--------------------------------------------------+
| [P] Continue Updated Roadmap                      |
| [S] Review Answers [S] Book Paid Mentor Call      |
+--------------------------------------------------+
```

---

## 9) Recommendation Detail / Offer Decision

```text
+--------------------------------------------------+
| Recommended: Product Owner Transition Program     |
+--------------------------------------------------+
| Why this fits you                                 |
| [Skill fit] [Timeline fit] [Goal alignment]       |
+--------------------------------------------------+
| Schedule: [Select batch v] {required}             |
| Pricing: INR 24,999                               |
| Includes: mentorship + mock + templates           |
| Policy: refund | terms | disclosures              |
+--------------------------------------------------+
| Trust block: proof + disclaimer                   |
+--------------------------------------------------+
| [P] Proceed to Checkout                           |
| [S] Compare Options   [S] Ask AI Coach            |
+--------------------------------------------------+
```

---

## 10) Checkout (Standard + Org Branch)

```text
+--------------------------------------------------+
| Checkout                                          |
+---------------------------+----------------------+
| Order Summary             | Billing & Payment    |
| - PO Program              | Name [...........]   |
| - Batch: 12 Jul           | Email [..........]   |
| - INR 24,999              | Card/UPI [v]         |
|                           |                      |
|                           | [ ] Org reimbursement|
|                           | If checked ->        |
|                           | Company [........]   |
|                           | Ref/Approver [....]  |
+---------------------------+----------------------+
| [S] Back                               [P] Pay Now|
+--------------------------------------------------+
```

Success state:

```text
+--------------------------------------------------+
| Payment Successful                                |
| Enrollment confirmed + receipt sent               |
| [P] Go to Dashboard                               |
| [S] Join Community  [S] View Resources            |
+--------------------------------------------------+
```

---

## 11) Webinar Hub + Booking

```text
+--------------------------------------------------+
| Upcoming Webinars                                 |
+--------------------------------------------------+
| Filters: [Role v] [Topic v] [Date v]              |
|---------------------------------------------------|
| Card: "PO Backlog Mastery"                        |
| Date: 30 May | Seats: 24                          |
| [S] Details                        [P] Register   |
|---------------------------------------------------|
| Card: "Scrum Master Interview Prep"               |
| Date: 02 Jun | Seats: 11                          |
| [S] Details                        [P] Register   |
+--------------------------------------------------+
| Post-attendance tools: code entry | feedback | cert|
+--------------------------------------------------+
```

---

## 12) Paid Mentor Call Booking

```text
+--------------------------------------------------+
| Book Mentor Call (Paid)                           |
+--------------------------------------------------+
| Select Slot: [Calendar + Time slots]              |
| Price: Auto by country                            |
| - USA: $9                                         |
| - India: INR 49                                   |
| Location/Currency: [Auto-detected v] [Override]   |
| Goal for session:                                 |
| +----------------------------------------------+ |
| | I want to transition from BA to PO in 6 mo   | |
| +----------------------------------------------+ |
| Preferred focus: [Roadmap v]                     |
+--------------------------------------------------+
| [S] Cancel                 [P] Pay & Confirm      |
+--------------------------------------------------+
```

---

## 13) AI Coach

```text
+--------------------------------------------------+
| AI Coach (Context: Diagnosis Results)             |
+--------------------------------------------------+
| Suggested prompts:                                |
| [What gap matters most?] [Explain this score]     |
| [What should I do this week?]                     |
|---------------------------------------------------|
| User: Which path is fastest for me?               |
| AI: Based on your goal and profile...             |
|      [Rationale] [Action recommendation]          |
|      [S] Need human help?                         |
|---------------------------------------------------|
| Message input [..............................] [>]
+--------------------------------------------------+
```

---

## 14) Profile + Preferences

```text
+--------------------------------------------------+
| Profile & Preferences                             |
+--------------------------------------------------+
| Role Goal: [Product Owner v]                      |
| Experience: [5 years v]                           |
| Interests: [x] PO [x] Agile Metrics [ ] SAFe      |
|---------------------------------------------------|
| Notifications                                     |
| [x] Email updates                                 |
| [x] Webinar reminders                             |
| [ ] Promo offers                                  |
|---------------------------------------------------|
| Consent & Communication Controls                  |
| [S] Manage Data Preferences                       |
+--------------------------------------------------+
| [S] Cancel                         [P] Save       |
+--------------------------------------------------+
```

---

## 15) Shared States

### Empty State

```text
+---------------------------------------+
| No saved items yet                    |
| Save a pathway to compare later.      |
| [P] Explore Recommendations           |
+---------------------------------------+
```

### Loading State

```text
+---------------------------------------+
| [██████░░░░] Loading your insights... |
| This may take a few seconds.          |
+---------------------------------------+
```

### Error State

```text
+---------------------------------------+
| We couldn't process your resume.       |
| Check file format and retry.           |
| [S] View Requirements  [P] Try Again   |
+---------------------------------------+
```

### Success State

```text
+---------------------------------------+
| Saved successfully                     |
| Next: continue your roadmap.          |
| [P] Continue                          |
+---------------------------------------+
```

---

## 16) Desktop Upgrade Pattern (For Insight-Heavy Screens)

```text
+---------------------------+----------------------+------------------+
| Left Context              | Main Insight         | Action Rail      |
| - profile summary         | - gap details        | [P] Next action  |
| - current goal            | - rationale          | [S] alternatives |
| - progress                | - roadmap preview    | trust notes      |
+---------------------------+----------------------+------------------+
```

---

## 17) Build Order Mapping

1. Home
2. Diagnosis (Step 1-4)
3. Results + Recommendation
4. Dashboard
5. Micro-Exam flow
6. Checkout
7. Webinar and Mentor flows
8. AI Coach + Profile
9. Shared states + polish

