import type { OfferingMeta } from "./offerings.js";

/**
 * Live site course path slugs → stub offering codes.
 * Detail URLs may use either the app code or the public site slug.
 */
export const OFFERING_CODE_ALIASES: Record<string, string> = {
  "safe-agilist-leading-safe-certification-training": "safe-leading-safe",
  "scrum-master-mentorship-masterclass": "course-agile-fundamentals",
  "live-project-mentorship-masterclass-for-scrum-master-product-owner":
    "course-agile-fundamentals",
  "mock-interview-series-with-interview-preparation": "service-mock-interview-sm",
  "power-resume-cover-letter": "service-power-resume-cover-letter",
  "new-resume-with-cover-letter-linkedin-upgrade":
    "service-power-resume-cover-letter",
  "professional-scrum-master-psm-i-training-crash-course":
    "psm-i-certification-training",
};

/**
 * Codes retired from the public catalog. Soft-hidden from listings/seed so
 * existing DB rows and carts are not hard-deleted by migrations.
 */
export const PUBLIC_CATALOG_HIDDEN_CODES = new Set<string>(["agile-readiness"]);

export function resolveOfferingCode(code: string): string {
  return OFFERING_CODE_ALIASES[code] ?? code;
}

export function isPublicCatalogOffering(code: string): boolean {
  return !PUBLIC_CATALOG_HIDDEN_CODES.has(resolveOfferingCode(code));
}

/** Stub SKUs migrated from legacy static catalog (seed source). */
export const OFFERING_STUB_CATALOG: Record<string, OfferingMeta> = {
  "course-agile-fundamentals": {
    code: "course-agile-fundamentals",
    title:
      "3+ Week AI-Enabled Scrum Master / Product Owner Mentorship Masterclass (PSM 1 Certification Exam Pre-requisite)",
    kind: "course",
    category: "training",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "499.00",
    currency: "USD",
    regionalUnitPrices: { INR: "29990.00" },
    roleTags: ["learner", "scrum_master", "product_owner"],
    deliveryMode: "live",
    upcomingBatchId: "batch-1-jul-2026",
    slug: "live-project-mentorship-masterclass-for-scrum-master-product-owner",
    certificationName: "Live JIRA project mentorship",
    durationLabel: "3 weeks",
    summary:
      "Practical job-oriented hands-on training on a live project in JIRA & AI. Full Scrum, XP, Kanban, and Agile project management for Scrum Master and Product Owner roles — with the option to rejoin the next batch for free.",
    scheduleLabel: "Cohort 7 Jul – 27 Jul 2026 · 1.5 hr class weekdays (Mon–Fri)",
    cohortSchedules: [
      {
        id: "batch-1-jul-2026",
        label:
          "Batch 1 · 10:30 AM–12:00 PM IST / 10:00 PM–11:30 PM PST / 9:00–10:30 AM UAE",
      },
      {
        id: "batch-2-jul-2026",
        label:
          "Batch 2 · 7:30 PM–9:00 PM IST / 10:00 AM–11:30 AM EST / 3:00–4:30 PM BST / 6:00–7:30 PM UAE",
      },
    ],
    includes: [
      "Online live project on every participant's system",
      "Class recordings provided",
      "All sprint events and simulations on live JIRA",
      "JIRA training — boards, JQL, and dashboards",
      "Coaching conversations and roleplays",
      "Interview guidance and situational interview questions",
      "Advanced topics: quality, risks, mitigations, maturity assessments",
      "Trainer support for queries for 3 months after completion",
      "Pay once, attend multiple batches (rejoin next batch free)",
      "Non-certification course — PSM/certification taken after training",
      "Inner-circle community for continuous support after the cohort",
    ],
    learningOutcomes: [
      "End-to-end knowledge to clear Scrum Master or Agile PM interviews and PSM exam prep",
      "In-depth JIRA core features for sprints, backlogs, boards, JQL, and dashboards",
      "Practical Scrum, Kanban, and XP on a live simulated team",
      "User story writing and story-splitting workshop",
      "Collaboration and communication techniques for agile delivery",
      "Templates: capacity sheets, coaching docs, and knowledge documents",
      "Confidence to answer situational interview questions and work as a Scrum Master",
    ],
  },
  /** Kept for commerce/checkout tests; not shown on /certifications (course-only listing). */
  "exam-practice-free": {
    code: "exam-practice-free",
    title: "Free Practice Exam",
    kind: "exam",
    category: "certification",
    scheduleBound: false,
    examAccess: "free",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "0.00",
    currency: "USD",
    roleTags: ["learner"],
    certBody: "scrum.org",
    deliveryMode: "self_paced",
  },
  /** Kept for commerce/checkout tests; not shown on /certifications (course-only listing). */
  "exam-mock-certification": {
    code: "exam-mock-certification",
    title: "Mock Certification Exam",
    kind: "certification_mock",
    category: "certification",
    scheduleBound: false,
    examAccess: "paid",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "49.00",
    currency: "USD",
    roleTags: ["learner"],
    certBody: "scrum.org",
    deliveryMode: "self_paced",
  },
  "safe-leading-safe": {
    code: "safe-leading-safe",
    title: "AI Empowered Leading SAFe® Agilist 6.0 Certification Training",
    kind: "course",
    category: "certification",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: true,
    defaultUnitPrice: "549.00",
    currency: "USD",
    /** India list price — not FX from USD (549 × 83 = 45567). */
    regionalUnitPrices: { INR: "33999.00" },
    roleTags: ["learner", "safe_program_consultant", "scrum_master", "product_owner"],
    certBody: "scaled agile",
    deliveryMode: "live",
    upcomingBatchId: "batch-1-2-aug-2026",
    slug: "safe-agilist-leading-safe-certification-training",
    certificationName: "SAFe Agilist (Leading SAFe® 6.0)",
    summary:
      "Become a SAFe Agilist with Leading SAFe certification training in 2 days (16 hrs). Cover PI planning simulation, Program Board, SAFe principles and values, value streams, ART formation, DevOps, system demo, and real-life SAFe implementation with interview guidance.",
    durationHours: 16,
    scheduleLabel: "2-day weekend workshop · Next batch 1–2 Aug 2026",
    includes: [
      "2-day (16 hr) live weekend workshop",
      "PI planning full-event simulation",
      "Exam preparation dumps",
      "Real-life SAFe implementation examples",
      "Interview guidance",
      "100% past-batch exam success rate",
    ],
    learningOutcomes: [
      "Lead change across large-scale programs",
      "Handle cross-team and cross-train dependencies",
      "Run PI planning inputs, outputs, and events",
      "Apply SAFe principles, values, and system thinking",
      "Work with value streams, Epic/Portfolio Canvas, and DevOps",
    ],
  },
  "safe-product-owner-product-manager-certification-training": {
    code: "safe-product-owner-product-manager-certification-training",
    title: "AI-Empowered SAFe® 6.0 Product Owner/Product Manager Certification Training",
    kind: "course",
    category: "certification",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: true,
    defaultUnitPrice: "549.00",
    currency: "USD",
    regionalUnitPrices: { INR: "33999.00" },
    roleTags: ["learner", "product_owner"],
    certBody: "scaled agile",
    deliveryMode: "live",
    upcomingBatchId: "batch-11-12-jul-2026",
    slug: "safe-product-owner-product-manager-certification-training",
    certificationName: "SAFe® Product Owner / Product Manager (POPM)",
    summary:
      "Become a SAFe Product Owner / Product Manager with 2-day (16 hr) certification training. Suitable for BAs and PO/PMs driving team and large-scale program requirements — backlog, value streams, PI planning, customer centricity, and POPM exam prep.",
    durationHours: 16,
    scheduleLabel: "2-day weekend workshop · Next batch 11–12 Jul 2026",
    includes: [
      "2-day (16 hr) Saturday–Sunday live training",
      "SAFe POPM certification exam preparation",
      "Exam preparation dumps",
      "Epic, feature, and story management practice",
      "100% past-batch exam success rate",
    ],
    learningOutcomes: [
      "Apply Lean-Agile and SAFe principles as PO/PM",
      "Manage epics, features, stories, and backlogs",
      "Plan releases and Program Increments",
      "Align value streams and portfolio work to strategy",
      "Use customer centricity, UX, and design thinking",
    ],
  },
  "safe-scrum-master-certification-training": {
    code: "safe-scrum-master-certification-training",
    title: "AI Empowered SAFe® 6.0 Scrum Master Certification Training",
    kind: "course",
    category: "certification",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: true,
    defaultUnitPrice: "549.00",
    currency: "USD",
    regionalUnitPrices: { INR: "33999.00" },
    roleTags: ["learner", "scrum_master"],
    certBody: "scaled agile",
    deliveryMode: "live",
    upcomingBatchId: "batch-11-12-jul-2026-ssm",
    slug: "safe-scrum-master-certification-training",
    certificationName: "SAFe® Scrum Master",
    summary:
      "Become a SAFe Scrum Master with 2-day (16 hr) certification training. Learn SAFe roles and artifacts, PI planning simulation, Program Board, dependency management, flow accelerators, train events, and real-life SAFe implementation with interview guidance.",
    durationHours: 16,
    scheduleLabel: "2-day weekend workshop · Next batch 11–12 Jul 2026",
    includes: [
      "2-day (16 hr) Saturday–Sunday live training",
      "PI planning full-event simulation",
      "Exam preparation dumps",
      "Real-life SAFe implementation examples",
      "Interview guidance",
      "100% past-batch exam success rate",
    ],
    learningOutcomes: [
      "Facilitate SAFe Scrum Master responsibilities",
      "Handle dependencies across teams and trains",
      "Run PI planning and Program Board practices",
      "Apply SAFe principles, values, and flow accelerators",
      "Support system demo and quality practices",
    ],
  },
  /**
   * CSM® — not on the Jul 2026 founder core catalog (Mentorship/Mock/Resume/SAFe*).
   * Draft pricing mirrors other 2-day cert workshops in this seed ($549 / INR 33999)
   * until founder confirms list price and exam/membership packaging.
   */
  "csm-certification-training": {
    code: "csm-certification-training",
    title: "Certified ScrumMaster® (CSM®) Certification Training",
    kind: "course",
    category: "certification",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "549.00",
    currency: "USD",
    regionalUnitPrices: { INR: "33999.00" },
    roleTags: ["learner", "scrum_master"],
    certBody: "scrum alliance",
    deliveryMode: "live",
    upcomingBatchId: "batch-csm-tbd",
    slug: "csm-certification-training",
    certificationName: "Certified ScrumMaster® (CSM®)",
    summary:
      "Become a Certified ScrumMaster® with live instructor-led training on the Scrum framework — accountabilities, events, artifacts, and values — so you can serve a Scrum Team and prepare for the Scrum Alliance CSM® exam path. Exam attempts, membership, and SEU packaging are confirmed at enrollment.",
    durationHours: 16,
    scheduleLabel: "2-day live workshop · 16 hours · cohorts on request",
    cohortSchedules: [
      {
        id: "batch-csm-tbd",
        label: "Next cohort timing confirmed at enrollment (weekend / weekday options)",
      },
    ],
    includes: [
      "16 hours live instructor-led CSM® pathway training",
      "Scrum roles, events, artifacts, and values in practice",
      "Interactive exercises, case discussions, and team simulations",
      "Exam-oriented review aligned to Scrum Alliance learning objectives",
      "Practice questions / mock quiz support",
      "Career guidance for Scrum Master and Agile PM interviews",
      "Exam fee and Scrum Alliance membership packaging confirmed at enrollment",
    ],
    learningOutcomes: [
      "Explain Agile values/principles and why Scrum is an empirical framework",
      "Clarify Scrum Master, Product Owner, and Developers accountabilities",
      "Facilitate Scrum events and protect the Sprint Goal",
      "Work with Product Backlog, Sprint Backlog, Increment, and Definition of Done",
      "Apply estimation, velocity, and burndown practices thoughtfully",
      "Prepare for the CSM® exam format and Scrum Alliance credential path",
    ],
  },
  /**
   * SAFe® RTE — not on the Jul 2026 founder core catalog list.
   * Pricing mirrors other SAFe cert workshops in this seed ($549 / INR 33999)
   * pending founder list-price confirmation (market RTE workshops are often higher).
   */
  "safe-rte-certification-training": {
    code: "safe-rte-certification-training",
    title: "AI Empowered - SAFe® Release Train Engineer (RTE) Certification",
    kind: "course",
    category: "certification",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: true,
    defaultUnitPrice: "549.00",
    currency: "USD",
    regionalUnitPrices: { INR: "33999.00" },
    roleTags: ["learner", "scrum_master", "safe_program_consultant"],
    certBody: "scaled agile",
    deliveryMode: "live",
    upcomingBatchId: "batch-rte-tbd",
    slug: "safe-rte-certification-training",
    certificationName: "SAFe® Release Train Engineer (RTE)",
    summary:
      "Become a SAFe® Release Train Engineer with live SPC-led training (typically 24 hrs). Practice facilitating the ART, PI planning readiness and execution, Inspect & Adapt, and servant leadership at program scale — plus AI-aware RTE workflows and exam preparation.",
    durationHours: 24,
    scheduleLabel: "3-day live workshop · 24 hours · cohorts on request",
    cohortSchedules: [
      {
        id: "batch-rte-tbd",
        label: "Next cohort timing confirmed at enrollment (multi-day live sessions)",
      },
    ],
    includes: [
      "24 hours live instructor-led SAFe® RTE training",
      "ART facilitation and PI planning practice",
      "Inspect & Adapt and relentless improvement workshops",
      "Exam preparation materials and practice support",
      "Real-world ART implementation examples",
      "Interview guidance for RTE / program facilitation roles",
      "Exam and SAFe Community membership details confirmed at enrollment",
    ],
    learningOutcomes: [
      "Serve as a servant leader for an Agile Release Train",
      "Apply SAFe principles to continuous value delivery",
      "Organize and manage value flow through an ART",
      "Facilitate PI planning readiness, execution, and follow-through",
      "Drive Inspect & Adapt and relentless improvement",
      "Build an AI-augmented RTE workflow responsibly",
    ],
  },
  /**
   * Professional Scrum Master™ I (PSM I) — 1-day crash course.
   * Founder list price: USD 149 · INR 9,999. Other currencies convert from USD base (FR-178).
   * Curriculum adapted from industry PSM-I pathways (Agile/Scrum Guide foundation + exam prep).
   */
  "psm-i-certification-training": {
    code: "psm-i-certification-training",
    title: "Professional Scrum Master (PSM-I) Training Crash Course",
    kind: "course",
    category: "certification",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "149.00",
    currency: "USD",
    regionalUnitPrices: { INR: "9999.00" },
    roleTags: ["learner", "scrum_master"],
    certBody: "scrum.org",
    deliveryMode: "live",
    upcomingBatchId: "batch-psm-i-tbd",
    slug: "professional-scrum-master-psm-i-training-crash-course",
    certificationName: "Professional Scrum Master™ I (PSM I)",
    summary:
      "Become a Professional Scrum Master™ I with a focused 1-day (8 hr) live crash course on the Scrum Guide — empiricism, accountabilities, events, artifacts, and values — so you can serve a Scrum Team and prepare for the Scrum.org PSM I assessment. Assessment attempt packaging is confirmed at enrollment.",
    durationHours: 8,
    scheduleLabel: "1-day live crash course · 8 hours · cohorts on request",
    cohortSchedules: [
      {
        id: "batch-psm-i-tbd",
        label: "Next cohort timing confirmed at enrollment (weekend / weekday options)",
      },
    ],
    includes: [
      "8 hours live instructor-led PSM I crash course",
      "Scrum Guide foundation: empiricism, pillars, and values",
      "Scrum accountabilities, events, artifacts, and commitments",
      "Definition of Done, Product Backlog, and self-managing teams",
      "Scrum Master as servant-leader and change agent",
      "Exam-oriented review and practice questions for Scrum.org PSM I",
      "Career guidance for Scrum Master and Agile PM interviews",
      "Scrum.org assessment packaging confirmed at enrollment",
    ],
    learningOutcomes: [
      "Explain Agile values/principles and why Scrum is an empirical framework",
      "Apply Transparency, Inspection, and Adaptation in product work",
      "Clarify Scrum Master, Product Owner, and Developers accountabilities",
      "Facilitate Scrum events and protect the Sprint Goal",
      "Work with Product Backlog, Sprint Backlog, Increment, and Definition of Done",
      "Prepare for the Scrum.org Professional Scrum Master™ I assessment format",
    ],
  },
  /**
   * Professional Scrum Master™ II (PSM II) — not on the Jul 2026 founder core catalog.
   * Draft pricing mirrors other 2-day cert workshops in this seed ($549 / INR 33999)
   * until founder confirms list price and Scrum.org assessment packaging.
   */
  "psm-ii-certification-training": {
    code: "psm-ii-certification-training",
    title: "Professional Scrum Master™ II (PSM II) Certification Training",
    kind: "course",
    category: "certification",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "549.00",
    currency: "USD",
    regionalUnitPrices: { INR: "33999.00" },
    roleTags: ["learner", "scrum_master"],
    certBody: "scrum.org",
    deliveryMode: "live",
    upcomingBatchId: "batch-psm-ii-tbd",
    slug: "psm-ii-certification-training",
    certificationName: "Professional Scrum Master™ II (PSM II)",
    summary:
      "Advance as a Scrum Master with live instructor-led preparation for the Scrum.org Professional Scrum Master™ II (PSM II) assessment — servant leadership, facilitation, coaching, impediment removal, and organizational change in complex real-world scenarios. Assessment attempt packaging is confirmed at enrollment.",
    durationHours: 16,
    scheduleLabel: "2-day live workshop · 16 hours · cohorts on request",
    cohortSchedules: [
      {
        id: "batch-psm-ii-tbd",
        label: "Next cohort timing confirmed at enrollment (weekend / weekday options)",
      },
    ],
    includes: [
      "16 hours live instructor-led PSM II pathway training",
      "Servant leadership, facilitation, and coaching practice",
      "Role plays, simulations, and conflict / impediment scenarios",
      "Focus on Done Increments, Sprint Goals, and supporting the Product Owner",
      "Exam-oriented review aligned to Scrum.org PSM II expectations",
      "Career guidance for senior Scrum Master and Agile coaching roles",
      "Scrum.org assessment packaging confirmed at enrollment",
    ],
    learningOutcomes: [
      "Apply Scrum Master stances as servant-leader, facilitator, coach, and change agent",
      "Handle team conflict and remove organizational impediments effectively",
      "Protect empiricism through Done Increments and clear Sprint Goals",
      "Support the Product Owner and successful product delivery",
      "Use measurement thoughtfully to support transparency — not as a weapon",
      "Prepare for the Scrum.org PSM II assessment format and difficulty",
    ],
  },
  "service-mock-interview-sm": {
    code: "service-mock-interview-sm",
    title: "Mock Interview Series with Interview Preparation",
    kind: "service",
    category: "service",
    scheduleBound: false,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "249.00",
    currency: "USD",
    regionalUnitPrices: { INR: "15000.00" },
    roleTags: ["scrum_master", "product_owner", "learner"],
    deliveryMode: "live",
    slug: "mock-interview-series-with-interview-preparation",
    certificationName: "5 mock interviews",
    durationLabel: "7.5 hrs",
    summary:
      "Ace your Scrum / Agile project manager interviews with 100+ situational questions and suggested answers. A series of 5 mock interviews to help you excel at each aspect of the interview process.",
    includes: [
      "Roles covered: SCRUM MASTER | AGILE PROJECT MANAGER | PRODUCT OWNER | BA | AGILE COACH",
      "100+ situational questions with real-world scenarios",
      "Discussion on each question to refine answers from your resume and experience",
      "Personalized feedback to build confidence for live interviews",
      "Self-introduction coaching — impactful opening and closing statements",
      "Guidance on agile vocabulary and how to break down any problem",
    ],
    learningOutcomes: [
      "Prepare for SCRUM MASTER | AGILE PROJECT MANAGER | PRODUCT OWNER | BA | AGILE COACH interviews",
      "Answer situational Scrum and Agile PM interview questions with structure",
      "Tailor responses to your resume and prior project experience",
      "Deliver a confident self-introduction with strong open and close",
      "Use correct agile terminology under interview pressure",
      "Decompose complex problems in a way interviewers expect",
    ],
  },
  "service-power-resume-cover-letter": {
    code: "service-power-resume-cover-letter",
    title: "New Resume With Cover Letter & Linkedin Upgrade",
    kind: "service",
    category: "service",
    scheduleBound: false,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "150.00",
    currency: "USD",
    regionalUnitPrices: { INR: "6999.00" },
    roleTags: ["learner", "scrum_master", "product_owner"],
    deliveryMode: "live",
    slug: "new-resume-with-cover-letter-linkedin-upgrade",
    certificationName: "Resume + cover letter + LinkedIn",
    durationLabel: "Within 1 day",
    summary:
      "Get a personalized new resume and cover letter with the right keywords, achievements, and skills for Scrum, Agile PM, and product roles — plus a LinkedIn upgrade to maximize job opportunities with skills. Choose from multiple professional formats.",
    includes: [
      "Personalized resume tailored to your experience and target role",
      "ATS Friendly Resume, with tried and tested formats which get you hired",
      "Cover letter with role-specific keywords, achievements, and skills",
      "LinkedIn profile upgrade to maximize job opportunities with skills",
      "Multiple format options to choose from",
      "Agile and Scrum terminology aligned to hiring expectations",
      "Delivery within one business day",
    ],
    learningOutcomes: [
      "Present achievements and skills in a recruiter-friendly structure",
      "Use keywords that match Scrum Master, PO, and Agile PM job descriptions",
      "Pair a strong cover letter with your resume for applications",
      "Strengthen your LinkedIn profile to maximize job opportunities with skills",
      "Choose a format that fits your career-transition story",
    ],
  },
};

export function listStubOfferings(): OfferingMeta[] {
  return Object.values(OFFERING_STUB_CATALOG).filter((o) =>
    isPublicCatalogOffering(o.code),
  );
}

/** Published certification courses aligned to theagileforum.com live course pages. */
export function listCertificationCourses(): OfferingMeta[] {
  return listStubOfferings().filter(
    (o) => o.category === "certification" && o.kind === "course",
  );
}

/** Published training courses for /trainings browse (stub merge when DB is sparse/stale). */
export function listTrainingCourses(): OfferingMeta[] {
  return listStubOfferings().filter(
    (o) => o.category === "training" && o.kind === "course",
  );
}
