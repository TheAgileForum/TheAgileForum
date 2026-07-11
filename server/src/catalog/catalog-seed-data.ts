import type { OfferingMeta } from "./offerings.js";

/**
 * Live site course path slugs → stub offering codes.
 * Detail URLs may use either the app code or the public site slug.
 */
export const OFFERING_CODE_ALIASES: Record<string, string> = {
  "safe-agilist-leading-safe-certification-training": "safe-leading-safe",
  "scrum-master-mentorship-masterclass": "course-agile-fundamentals",
  "mock-interview-series-with-interview-preparation": "service-mock-interview-sm",
  "power-resume-cover-letter": "service-power-resume-cover-letter",
};

export function resolveOfferingCode(code: string): string {
  return OFFERING_CODE_ALIASES[code] ?? code;
}

/** Stub SKUs migrated from legacy static catalog (seed source). */
export const OFFERING_STUB_CATALOG: Record<string, OfferingMeta> = {
  "agile-readiness": {
    code: "agile-readiness",
    title: "Agile Readiness Program",
    kind: "course",
    category: "training",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "299.00",
    currency: "USD",
    roleTags: ["learner", "scrum_master", "product_owner"],
    deliveryMode: "live",
    upcomingBatchId: "batch-agile-readiness-q3",
    summary:
      "Assess your agile foundation and close skill gaps before a Scrum Master, Product Owner, or team-lead role. Live cohort with practical readiness checkpoints.",
    durationLabel: "2 weeks",
    scheduleLabel: "Live cohort · Next batch opens Q3",
  },
  "course-agile-fundamentals": {
    code: "course-agile-fundamentals",
    title: "Scrum Master Mentorship Masterclass",
    kind: "course",
    category: "training",
    scheduleBound: true,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "499.00",
    currency: "USD",
    regionalUnitPrices: { INR: "36000.00" },
    roleTags: ["learner", "scrum_master", "product_owner"],
    deliveryMode: "live",
    upcomingBatchId: "batch-1-jul-2026",
    slug: "scrum-master-mentorship-masterclass",
    certificationName: "3-week AI-enabled SM/PO mentorship",
    durationLabel: "3 weeks",
    summary:
      "Practical, job-oriented hands-on training on a live JIRA project with AI. Full Scrum, XP, Kanban, and Agile project management to get into a Scrum Master role — with the option to rejoin the next batch for free.",
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
    ],
    learningOutcomes: [
      "End-to-end knowledge to clear Scrum Master or Agile PM interviews and PSM exam prep",
      "In-depth JIRA core features for sprints, backlogs, and project management",
      "Practical Scrum, Kanban, and XP on a live simulated team",
      "User story writing and story-splitting workshop",
      "Collaboration and communication techniques for agile delivery",
      "Templates: capacity sheets, coaching docs, and knowledge documents",
      "Confidence to answer interview questions and work as a Scrum Master",
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
    title: "AI Empowered Leading SAFe® 6.0 Certification",
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
    title: "Certified AI-Empowered SAFe 6 Product Owner/Product Manager",
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
    title: "SAFe® Scrum Master Certification Training",
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
    certificationName: "5 mock interviews · 7.5 hrs",
    durationLabel: "7.5 hrs",
    summary:
      "Ace your Scrum / Agile project manager interviews with 100+ situational questions and suggested answers. A series of 5 mock interviews to help you excel at each aspect of the interview process.",
    includes: [
      "100+ situational questions with real-world scenarios",
      "Discussion on each question to refine answers from your resume and experience",
      "Personalized feedback to build confidence for live interviews",
      "Self-introduction coaching — impactful opening and closing statements",
      "Guidance on agile vocabulary and how to break down any problem",
      "Roles covered: Scrum Master, Agile PM, Product Owner, BA, Agile Coach",
    ],
    learningOutcomes: [
      "Answer situational Scrum and Agile PM interview questions with structure",
      "Tailor responses to your resume and prior project experience",
      "Deliver a confident self-introduction with strong open and close",
      "Use correct agile terminology under interview pressure",
      "Decompose complex problems in a way interviewers expect",
    ],
  },
  "service-power-resume-cover-letter": {
    code: "service-power-resume-cover-letter",
    title: "Power Resume & Cover Letter",
    kind: "service",
    category: "service",
    scheduleBound: false,
    examAccess: "preview_only",
    safeOrgPaymentEligible: false,
    defaultUnitPrice: "150.00",
    currency: "USD",
    regionalUnitPrices: { INR: "8000.00" },
    roleTags: ["learner", "scrum_master", "product_owner"],
    deliveryMode: "live",
    slug: "power-resume-cover-letter",
    certificationName: "Resume + cover letter",
    durationLabel: "Within 1 day",
    summary:
      "Get a personalized, impactful resume and cover letter with the right keywords, achievements, and skills for Scrum, Agile PM, and product roles. Choose from multiple professional formats.",
    includes: [
      "Personalized resume tailored to your experience and target role",
      "Cover letter with role-specific keywords, achievements, and skills",
      "Multiple format options to choose from",
      "Agile and Scrum terminology aligned to hiring expectations",
      "Delivery within one business day",
    ],
    learningOutcomes: [
      "Present achievements and skills in a recruiter-friendly structure",
      "Use keywords that match Scrum Master, PO, and Agile PM job descriptions",
      "Pair a strong cover letter with your resume for applications",
      "Choose a format that fits your career-transition story",
    ],
  },
};

export function listStubOfferings(): OfferingMeta[] {
  return Object.values(OFFERING_STUB_CATALOG);
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
