/** Shared shell + per-offer extras for rich offer detail pages. */

import { MENTORSHIP_OFFER_CODE } from "../../../lib/offer-routes";

export const OFFER_INK = "#0a1628";
export const OFFER_INK_SOFT = "#12233a";
export const OFFER_PAPER = "#f3f6f9";
export const OFFER_ACCENT = "#0f9f8f";
export const OFFER_ACCENT_DEEP = "#0b7a6e";
export const OFFER_MUTED = "#5b6b7c";

export const SSM_OFFER_CODE = "safe-scrum-master-certification-training";
export const CSM_OFFER_CODE = "csm-certification-training";
export const RTE_OFFER_CODE = "safe-rte-certification-training";
export const PSM_II_OFFER_CODE = "psm-ii-certification-training";
export const MENTORSHIP_CANONICAL_CODE = "scrum-master-mentorship-masterclass";
export const MOCK_INTERVIEW_OFFER_CODE = "service-mock-interview-sm";
export const MOCK_INTERVIEW_SLUG = "mock-interview-series-with-interview-preparation";
export const POWER_RESUME_OFFER_CODE = "service-power-resume-cover-letter";
export const POWER_RESUME_SLUG = "new-resume-with-cover-letter-linkedin-upgrade";
/** Legacy public path — keep resolving to the same offer extras. */
export const POWER_RESUME_LEGACY_SLUG = "power-resume-cover-letter";

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { title: string; items: FaqItem[] };
export type CurriculumModule = { title: string; summary: string; bullets?: string[] };
export type ExamDomain = { domain: string; topics: string[] };
export type KeyBenefit = { title: string; detail: string };
export type MentorshipBenefit = {
  title: string;
  detail: string;
  images: Array<{ src: string; alt: string }>;
  note?: string;
};
export type DemandCopy = {
  salary: { min: string; max: string; avg: string };
  employers: string[];
  jobsLabel: string;
  jobsCount: string;
  paragraphs: string[];
};

export type OfferPageExtras = {
  rating: { score: string; meta: string };
  benefitPills: string[];
  keyBenefits: KeyBenefit[];
  /** Hero eyebrow above the title (defaults to Scaled Agile workshop line). */
  heroEyebrow?: string;
  /** Optional full-bleed visual under hero copy (mentorship program shot). */
  heroImageUrl?: string;
  heroImageAlt?: string;
  /** Pricing-card primary chip (defaults to "Certification"). */
  kindChip?: string;
  overviewTitle: string;
  overviewBody: string;
  overviewPracticeTitle?: string;
  overviewPracticeBody?: string;
  overviewExpectationsTitle?: string;
  overviewExpectationsBody?: string;
  overviewStats: Array<{ num: string; label: string }>;
  benefits?: MentorshipBenefit[];
  benefitsTitle?: string;
  benefitsLead?: string;
  demand?: DemandCopy;
  videoUrl?: string;
  videoThumb?: string;
  videoCaption?: string;
  learnLead?: string;
  curriculum: CurriculumModule[];
  curriculumTitle?: string;
  curriculumLead?: string;
  audience: Array<{ role: string; detail: string }>;
  audienceTitle?: string;
  audienceLead?: string;
  /** Showcase image — cert badge for SAFe, program visual for mentorship. */
  certImageUrl?: string;
  certImageAlt?: string;
  certSectionEyebrow?: string;
  certSectionTitle?: string;
  certSectionLead?: string;
  /** Jump-nav label for the cert/showcase section (defaults to "Certification"). */
  certNavLabel?: string;
  certBullets?: string[];
  faqGroups: FaqGroup[];
  examGuidelines?: {
    domains: ExamDomain[];
    footnote: string;
    sourceUrl: string;
    /** Override default SSM-oriented lead under Exam guidelines. */
    lead?: string;
    /** Visible link label for sourceUrl (defaults to hostname path). */
    sourceLabel?: string;
  };
  brochureMailto: string;
  brochureCtaLabel?: string;
  corporateMailto: string;
  trustLine?: string;
  finalCtaTitle?: string;
  finalCtaLead?: string;
  mentorImageUrl?: string;
  mentorName?: string;
  mentorHeadline?: string;
  mentorBody?: string;
};

const SSM_EXTRAS: OfferPageExtras = {
  rating: {
    score: "4.9",
    meta: "Average learner rating · live workshop cohorts",
  },
  heroEyebrow: "Scaled Agile · Live weekend workshop",
  kindChip: "Certification",
  benefitPills: [
    "16 hrs live training",
    "PI planning simulation",
    "Exam prep dumps",
    "100% past-batch exam success",
  ],
  keyBenefits: [
    {
      title: "Facilitate at ART scale",
      detail: "Team + program events, not just team Scrum",
    },
    {
      title: "Dependencies & flow",
      detail: "Program Board and flow accelerators in practice",
    },
    {
      title: "AI-aware coaching",
      detail: "Prompts and workflows that augment the SM role",
    },
    {
      title: "Career-ready",
      detail: "Interview guidance alongside certification prep",
    },
  ],
  overviewTitle: "Serve the team — and the train",
  overviewBody:
    "A SAFe Scrum Master is a servant-leader who helps Agile teams succeed inside an Agile Release Train. This workshop goes beyond team Scrum: you practice program-level facilitation, PI planning, and continuous improvement at scale.",
  overviewPracticeTitle: "Key responsibilities you'll practice",
  overviewPracticeBody:
    "Team and program facilitation (including PI Planning), coaching with powerful questions, cross-team dependency management, flow and quality practices, and preparing for Inspect & Adapt.",
  overviewStats: [
    { num: "2 days", label: "Live weekend workshop · 16 hours" },
    { num: "PI simulation", label: "Full Planning Interval event practice" },
    { num: "100%", label: "Past-batch exam success rate (claimed)" },
  ],
  learnLead: "Skills you can use on Monday after the workshop.",
  curriculumTitle: "Modules that mirror how ARTs really work",
  curriculumLead:
    "7 modules — from foundations through PI planning, iteration execution, and AI for Scrum Masters.",
  audienceTitle: "Who should attend",
  audienceLead:
    "Built for people stepping into — or leveling up — the Scrum Master role inside SAFe.",
  certImageAlt: "AI-Empowered SAFe Scrum Master certification sample",
  certSectionEyebrow: "Your credential",
  certSectionTitle: "How your AI-Empowered SAFe Scrum Master Certification looks like",
  certSectionLead:
    "Industry-recognized credential after you pass the official exam — shareable badge and proof of role-ready facilitation skills.",
  trustLine: "SPC-led delivery",
  finalCtaTitle: "Ready to facilitate at scale?",
  finalCtaLead:
    "Select your schedule, enroll, or book a mentor if you want a second opinion first.",
  brochureCtaLabel: "Download Course Content & Brochure",
  demand: {
    salary: { min: "$96k", max: "$209k", avg: "$125k" },
    employers: [
      "Deloitte",
      "Infosys",
      "Bank of America",
      "IBM",
      "Accenture",
      "Fidelity",
      "General Dynamics",
      "Cognizant",
      "Northern Trust",
    ],
    jobsCount: "82,000+",
    jobsLabel: "Openings for Scrum Master around the world",
    paragraphs: [
      "SAFe Scrum Master demand continues to grow as enterprises scale Agile transformations.",
      "The U.S. Bureau of Labor Statistics projects employment of project management specialists to grow 6% from 2024 to 2034, faster than the average for all occupations.",
      "Research by McKinsey shows that 93% of Agile organisations reported better customer satisfaction and operational performance.",
    ],
  },
  videoUrl: "https://play.vidyard.com/pJuZAbaUT43BrFZh81RvTe",
  videoThumb: "https://play.vidyard.com/pJuZAbaUT43BrFZh81RvTe.jpg",
  videoCaption: "Watch the SAFe Scrum Master video to learn more about the course",
  curriculum: [
    {
      title: "Introducing Scrum in SAFe",
      summary: "Essential Agile concepts, Scrum basics, and the Agile team's role in a SAFe enterprise.",
      bullets: ["Basic Agile development concepts", "Scrum basics", "The Agile team in a SAFe enterprise"],
    },
    {
      title: "Characterizing the Scrum Master role",
      summary:
        "Responsibilities, effective characteristics, high-performing teams, coaching, collaboration, and conflict resolution.",
      bullets: [
        "Responsibilities of the Scrum Master",
        "Team events & coaching with powerful questions",
        "Collaborate with other teams · resolve conflicts",
      ],
    },
    {
      title: "Experiencing PI Planning",
      summary:
        "From PI planning basics to draft plans, business value, final plan review, and facilitating the event.",
      bullets: [
        "PI planning basics & drafting plans",
        "Final plans, business value & PI objectives",
        "Facilitating PI planning",
      ],
    },
    {
      title: "Facilitating iteration execution",
      summary:
        "Plan and track iterations, refine the backlog, facilitate reviews and relentless improvement, support DevOps and Release on Demand.",
    },
    {
      title: "Finishing the Planning Interval",
      summary: "Coach the IP iteration and prepare the team for Inspect & Adapt.",
    },
    {
      title: "AI for Scrum Masters",
      summary:
        "Foundations and prompting, responsible AI, and building an AI-augmented Scrum Master workflow.",
    },
    {
      title: "Practicing SAFe",
      summary: "Practical applications and exercises that tie the learning back to your real delivery context.",
    },
  ],
  audience: [
    { role: "Scrum Masters", detail: "Moving from team Scrum into ART / program facilitation" },
    { role: "Team leads & coaches", detail: "Supporting multiple teams and dependency talks" },
    { role: "Aspiring SMs", detail: "Career switchers preparing for SSM exam + interviews" },
    { role: "Agile contributors", detail: "BAs, QAs, and engineers facilitating change at scale" },
  ],
  certImageUrl:
    "https://cdn.slidesharecdn.com/ss_thumbnails/certifiedai-empoweredsafe6scrummaster-260125200443-dd4f46ef-thumbnail.jpg?width=640&height=640&fit=bounds",
  certBullets: [
    "AI-Empowered SAFe® Scrum Master digital credential",
    "Shareable badge for LinkedIn and professional profiles",
    "Signals enterprise-scale facilitation and Lean-Agile coaching ability",
    "Aligned with Scaled Agile’s official SSM exam path",
  ],
  faqGroups: [
    {
      title: "Pre-requisites",
      items: [
        {
          question: "Are there any prerequisites for this course?",
          answer:
            "No prerequisites required. Anyone interested in facilitating Agile teams in a SAFe enterprise can enroll.",
        },
      ],
    },
    {
      title: "SSM Exam FAQs",
      items: [
        {
          question: "What is the format of the SAFe Scrum Master exam?",
          answer:
            "The exam is 90 minutes with 45 questions (timed, multiple-choice). You receive a coaching report after the attempt.",
        },
        {
          question: "What is the passing score?",
          answer: "73% is required to pass.",
        },
        {
          question: "When do I get certified?",
          answer:
            "You receive accreditation upon passing the exam — your AI-Empowered SAFe Scrum Master certification and digital badge follow Scaled Agile’s process.",
        },
      ],
    },
    {
      title: "Training & enrollment FAQs",
      items: [
        {
          question: "How long is the training?",
          answer:
            "Two live weekend days — 16 hours total. After training, you prepare for and take the SAFe® Scrum Master exam through Scaled Agile.",
        },
        {
          question: "What does enrollment include?",
          answer:
            "Live training, PI planning full-event simulation, exam prep materials, implementation examples, and interview guidance as listed above. Exam and membership details are confirmed at enrollment for your region.",
        },
        {
          question: "Do I need a schedule before checkout?",
          answer:
            "Yes. This offering is schedule-bound — select a cohort so your cart line carries the right batch.",
        },
        {
          question: "Who teaches the sessions?",
          answer:
            "Experienced SAFe practitioners / SPCs who emphasize applied facilitation, not slide read-throughs.",
        },
        {
          question: "Can I change my batch?",
          answer:
            "Contact support before your cohort starts. We'll help move you to the next open weekend when seats allow.",
        },
      ],
    },
  ],
  examGuidelines: {
    domains: [
      {
        domain: "Introducing Scrum in SAFe® (22–28%)",
        topics: [
          "Basic Agile and Scrum development concepts",
          "Basic Scrum Framework concepts",
          "Agile Scrum Teams in a SAFe Enterprise",
          "High-performing team characteristics",
          "Team events overview",
          "DevOps and Release on Demand",
        ],
      },
      {
        domain: "Defining the Scrum Master / Team Coach role (26–30%)",
        topics: [
          "Scrum Master / Team Coach characteristics",
          "Scrum Master / Team Coach responsibilities",
          "Agile team coaching",
        ],
      },
      {
        domain: "Supporting Team Events (17–21%)",
        topics: [
          "Iteration planning",
          "Team sync",
          "Backlog refinement",
          "Iteration review",
          "Iteration retrospective",
        ],
      },
      {
        domain: "Supporting ART Events (25–29%)",
        topics: ["PI Planning", "IP Iteration", "Inspect and Adapt event"],
      },
    ],
    footnote:
      "Maintaining your credential: earn a minimum of 24 Continuing Education Units (CEUs) within your two-year certification cycle (about 12 CEUs annually).",
    sourceUrl: "https://scaledagile.com/certification/scrum-master/",
    lead: "Domain weighting from Scaled Agile’s SAFe Scrum Master certification page — use this with your workshop notes and practice exam.",
    sourceLabel: "scaledagile.com/certification/scrum-master",
  },
  brochureMailto:
    "mailto:contact@theagileforum.com?subject=SSM%20Course%20Content%20%26%20Brochure",
  corporateMailto:
    "mailto:contact@theagileforum.com?subject=Corporate%20SAFe%20SSM%20Training",
};

/** Certified ScrumMaster® (CSM®) — Scrum Alliance pathway; adapted for TheAgileForum voice. */
const CSM_EXTRAS: OfferPageExtras = {
  rating: {
    score: "4.9",
    meta: "Average learner rating · live Scrum cohorts",
  },
  heroEyebrow: "Scrum Alliance · Live CSM® pathway",
  kindChip: "Certification",
  benefitPills: [
    "16 hrs live training",
    "Scrum framework mastery",
    "Exam-oriented review",
    "Interview guidance",
  ],
  keyBenefits: [
    {
      title: "Serve the Scrum Team",
      detail: "Accountabilities, events, and artifacts in practice",
    },
    {
      title: "Empirical delivery",
      detail: "Transparency, inspection, and adaptation — not waterfall habits",
    },
    {
      title: "Exam-ready path",
      detail: "Aligned to Scrum Alliance CSM® learning objectives",
    },
    {
      title: "Career context",
      detail: "How CSM® pairs with job-focused mentorship afterward",
    },
  ],
  overviewTitle: "Start as a Scrum Master who can serve the team",
  overviewBody:
    "Certified ScrumMaster® (CSM®) is Scrum Alliance’s foundational credential for people who want to understand Scrum deeply and help a Scrum Team deliver. This live workshop covers Agile foundations, Scrum accountabilities, events, artifacts, and values — with exercises that mirror how real teams work.",
  overviewPracticeTitle: "What you’ll practice",
  overviewPracticeBody:
    "Facilitating Sprint events, clarifying the Scrum Master accountability, refining Product Backlog items with acceptance criteria and Definition of Done, estimating thoughtfully, and coaching collaboration on cross-functional, self-managing teams.",
  overviewExpectationsTitle: "What to expect after class",
  overviewExpectationsBody:
    "After the required course hours, you follow Scrum Alliance’s CSM® exam process (typically 50 multiple-choice questions; passing score 37/50). Exam attempts, membership, and SEU packaging are confirmed at enrollment for your cohort.",
  overviewStats: [
    { num: "2 days", label: "Live workshop · typically 16 hours" },
    { num: "50 Q", label: "CSM® exam format (Scrum Alliance)" },
    { num: "2 yrs", label: "Credential cycle · renew with SEUs" },
  ],
  learnLead: "Core Scrum skills you can apply on your next Sprint.",
  curriculumTitle: "CSM® pathway curriculum",
  curriculumLead:
    "Modules aligned to Scrum Alliance learning objectives — from Agile foundations through Scrum events, artifacts, estimation, and serving the team.",
  audienceTitle: "Who should attend",
  audienceLead:
    "Built for people starting — or strengthening — the Scrum Master path with a recognized Scrum Alliance credential.",
  certImageUrl: "/assets/cert-badges/csm.svg",
  certImageAlt: "Certified ScrumMaster CSM pathway badge — The Agile Forum",
  certSectionEyebrow: "Your credential",
  certSectionTitle: "How the Certified ScrumMaster® (CSM®) path works",
  certSectionLead:
    "Complete the live course, then take the Scrum Alliance CSM® exam. Passing earns your CSM® credential and digital recognition you can share on LinkedIn.",
  certNavLabel: "Certification",
  certBullets: [
    "Certified ScrumMaster® (CSM®) credential via Scrum Alliance after you pass",
    "Shareable digital recognition for professional profiles",
    "Signals foundational Scrum Master facilitation and coaching ability",
    "Exam attempts and membership packaging confirmed at enrollment",
  ],
  trustLine: "Live Scrum coaching · The Agile Forum",
  finalCtaTitle: "Ready for your CSM® pathway?",
  finalCtaLead:
    "Select a cohort, enroll, or book a mentor if you want help choosing between CSM®, mentorship, and SAFe® next steps.",
  brochureCtaLabel: "Download Course Content & Brochure",
  demand: {
    salary: { min: "$85k", max: "$160k", avg: "$118k" },
    employers: [
      "Accenture",
      "Infosys",
      "IBM",
      "Deloitte",
      "Cognizant",
      "TCS",
      "Capgemini",
      "Wipro",
      "Amazon",
    ],
    jobsCount: "80,000+",
    jobsLabel: "Openings referencing Scrum Master around the world",
    paragraphs: [
      "CSM® remains one of the most recognized entry credentials for Scrum Master and Agile delivery roles.",
      "Many employers still list CSM® or equivalent Scrum Master training alongside hands-on delivery experience.",
      "Pairing certification with live-project practice (our Mentorship Masterclass) is how most TheAgileForum learners become interview-ready.",
    ],
  },
  curriculum: [
    {
      title: "Agile foundations & the manifesto",
      summary:
        "Why teams adopt Agile, the four values and twelve principles, and how empirical process control differs from defined (waterfall) approaches.",
      bullets: ["Agile Manifesto values", "12 principles in practice", "Empirical vs defined process"],
    },
    {
      title: "Scrum as a framework",
      summary:
        "Lightweight rules that enable complex product work — iterations, feedback loops, and the planning–executing–learning cycle.",
      bullets: ["Sprint as the heartbeat", "Transparency · inspection · adaptation", "When Scrum fits"],
    },
    {
      title: "Scrum values — C FOR C",
      summary:
        "Commitment, Focus, Openness, Respect, and Courage — how values show up in daily team behavior and coaching conversations.",
    },
    {
      title: "Accountabilities: Product Owner, Developers, Scrum Master",
      summary:
        "Clarify who owns value, who builds the Increment, and how the Scrum Master serves the team, Product Owner, and organization.",
      bullets: ["Product Owner & ROI focus", "Cross-functional Developers", "Scrum Master as servant-leader"],
    },
    {
      title: "Events: Sprint Planning, Daily Scrum, Review, Retrospective",
      summary:
        "Purpose, timeboxes, and facilitation tips so events create alignment instead of status theater.",
    },
    {
      title: "Artifacts & Definition of Done",
      summary:
        "Product Backlog, Sprint Backlog, Increment, acceptance criteria, and a shared Definition of Done that protects quality.",
      bullets: ["Backlog refinement", "Acceptance criteria", "DoD as a quality agreement"],
    },
    {
      title: "Estimation, velocity & visibility",
      summary:
        "Story points vs ideal days, release planning with velocity, and burndown charts that support honest forecasting.",
    },
    {
      title: "Teamworking: self-managing, cross-functional teams",
      summary:
        "Working agreements, facilitation techniques, distributed-team patterns, and tools that support collaboration without micromanagement.",
    },
    {
      title: "CSM® exam orientation & next steps",
      summary:
        "Exam format overview, study approach, and how TheAgileForum mentorship deepens job-ready skills after the 2-day credential path.",
    },
  ],
  audience: [
    { role: "Aspiring Scrum Masters", detail: "Career switchers seeking a recognized Scrum credential" },
    { role: "Team members & leads", detail: "Developers, QAs, and leads facilitating Scrum events" },
    { role: "Project / delivery managers", detail: "Moving from waterfall habits into servant leadership" },
    { role: "Product Owners & BAs", detail: "Working fluently with Scrum Teams and events" },
  ],
  faqGroups: [
    {
      title: "Pre-requisites",
      items: [
        {
          question: "Are there prerequisites for CSM® training?",
          answer:
            "No formal prerequisites. Anyone interested in Scrum can enroll. Light familiarity with Agile ideas helps, but the workshop starts from foundations.",
        },
        {
          question: "Do I need experience before the exam?",
          answer:
            "You must complete the required live CSM® course hours before Scrum Alliance grants exam access. Prior job experience is helpful but not required to enroll.",
        },
      ],
    },
    {
      title: "CSM® exam & certification",
      items: [
        {
          question: "What is the CSM® exam format?",
          answer:
            "Typically 50 multiple-choice questions in 60 minutes (open book). Passing score is commonly 37 of 50 (74%). Confirm current details with Scrum Alliance for your attempt window.",
        },
        {
          question: "How many attempts do I get?",
          answer:
            "Scrum Alliance commonly includes two exam attempts within 90 days of course completion. Additional attempts may incur a small fee. Exact packaging is confirmed at enrollment.",
        },
        {
          question: "Is the exam fee included?",
          answer:
            "Exam attempts and Scrum Alliance membership packaging vary by cohort offer — we confirm what is included before you pay.",
        },
        {
          question: "How long is CSM® valid?",
          answer:
            "CSM® is typically valid for two years. Renewal usually requires Scrum Education Units (SEUs) and a renewal fee, or earning another Scrum Alliance credential that renews the cycle.",
        },
        {
          question: "CSM® vs PSM — which should I take?",
          answer:
            "CSM® (Scrum Alliance) is course-gated and highly recognized by many employers. PSM (Scrum.org) is exam-first and self-study friendly. Many learners take CSM® for the facilitated course, then deepen practice with our Mentorship Masterclass.",
        },
      ],
    },
    {
      title: "Training & enrollment",
      items: [
        {
          question: "How long is the training?",
          answer:
            "Live instructor-led training totaling about 16 hours across two days (weekend or weekday cohorts depending on schedule).",
        },
        {
          question: "Is training live or recorded-only?",
          answer:
            "Sessions are live and interactive. Recordings may be shared for review when the cohort offers them — confirm for your batch.",
        },
        {
          question: "Who teaches the sessions?",
          answer:
            "Experienced Agile coaches from TheAgileForum led by Dhirender Verma (SPC · enterprise Agile coach). Official exam eligibility and any Scrum Alliance trainer requirements for your cohort are confirmed at enrollment.",
        },
        {
          question: "Do I need a schedule before checkout?",
          answer:
            "Yes. This offering is schedule-bound — select a cohort so your cart line carries the right batch.",
        },
        {
          question: "What if I want job-ready skills beyond 2 days?",
          answer:
            "Most learners pair CSM® with our 3-week Mentorship Masterclass (live JIRA project) and optionally Mock Interview Series — certification alone rarely lands the first Scrum Master role.",
        },
      ],
    },
  ],
  examGuidelines: {
    domains: [
      {
        domain: "Agile & Scrum foundations",
        topics: [
          "Agile Manifesto values and principles",
          "Empirical process control",
          "Scrum as a lightweight framework",
        ],
      },
      {
        domain: "Scrum accountabilities",
        topics: ["Product Owner", "Developers", "Scrum Master servant-leadership"],
      },
      {
        domain: "Events & artifacts",
        topics: [
          "Sprint Planning, Daily Scrum, Sprint Review, Retrospective",
          "Product Backlog, Sprint Backlog, Increment",
          "Definition of Done and acceptance criteria",
        ],
      },
      {
        domain: "Team practices",
        topics: [
          "Self-managing cross-functional teams",
          "Estimation and forecasting basics",
          "Working agreements and facilitation",
        ],
      },
    ],
    footnote:
      "Maintaining CSM®: earn Scrum Education Units (commonly 20 SEUs) and complete Scrum Alliance renewal within your two-year cycle. Confirm current requirements on scrumalliance.org.",
    sourceUrl: "https://www.scrumalliance.org/get-certified/scrum-master-track/certified-scrummaster",
    lead: "Topic areas aligned to the Scrum Alliance Certified ScrumMaster® learning path — use with your workshop notes and practice questions.",
    sourceLabel: "scrumalliance.org · Certified ScrumMaster®",
  },
  brochureMailto:
    "mailto:contact@theagileforum.com?subject=CSM%20Course%20Content%20%26%20Brochure",
  corporateMailto:
    "mailto:contact@theagileforum.com?subject=Corporate%20CSM%20Training",
  mentorImageUrl: "/assets/offers/mentor-dhirender.png",
  mentorName: "Dhirender Verma",
  mentorHeadline: "SPC · Scrum & SAFe mentor · job-focused coaching",
  mentorBody:
    "Not sure whether to start with CSM®, Mentorship Masterclass, or SAFe®? Book a short call — we’ll match credential timing to your target role and interview timeline.",
};

/** AI-Empowered SAFe® Release Train Engineer (RTE). */
const RTE_EXTRAS: OfferPageExtras = {
  rating: {
    score: "4.9",
    meta: "Average learner rating · live ART facilitation cohorts",
  },
  heroEyebrow: "Scaled Agile · AI-Empowered RTE workshop",
  kindChip: "Certification",
  benefitPills: [
    "24 hrs live training",
    "ART & PI facilitation",
    "Exam preparation",
    "AI for RTEs",
  ],
  keyBenefits: [
    {
      title: "Orchestrate the ART",
      detail: "Coordinate multiple teams delivering in a shared PI cadence",
    },
    {
      title: "Facilitate PI Planning",
      detail: "Readiness, execution, objectives, and follow-through",
    },
    {
      title: "Drive improvement",
      detail: "Inspect & Adapt workshops that create real change",
    },
    {
      title: "AI-aware RTE work",
      detail: "Responsible prompts and workflows that amplify facilitation",
    },
  ],
  overviewTitle: "Lead the train — not just a single team",
  overviewBody:
    "A SAFe® Release Train Engineer (RTE) is a servant leader and coach for the Agile Release Train. This AI-Empowered workshop builds the facilitation, alignment, and continuous-improvement skills you need to run program events and prepare for the Scaled Agile RTE exam.",
  overviewPracticeTitle: "Key responsibilities you’ll practice",
  overviewPracticeBody:
    "Organizing value flow on an ART, facilitating PI planning readiness and execution, coaching Scrum Masters and Product Owners at program scale, running Inspect & Adapt, and applying SAFe principles with an AI-augmented RTE workflow.",
  overviewExpectationsTitle: "Credential path",
  overviewExpectationsBody:
    "Complete the live instructor-led course (typically 24 hours), then take the Scaled Agile RTE exam. First exam attempt and SAFe Community membership packaging are confirmed at enrollment.",
  overviewStats: [
    { num: "3 days", label: "Live workshop · typically 24 hours" },
    { num: "60 Q", label: "RTE exam · 120 minutes (Scaled Agile)" },
    { num: "ART focus", label: "Program facilitation · not team-only Scrum" },
  ],
  learnLead: "Program-level facilitation you can use on your next PI.",
  curriculumTitle: "SAFe® RTE curriculum",
  curriculumLead:
    "Modules aligned to the Scaled Agile RTE learning journey — from the RTE role through PI execution, relentless improvement, and AI for RTEs.",
  audienceTitle: "Who should attend",
  audienceLead:
    "Ideal for experienced Scrum Masters, project/program leads, and Agile coaches stepping into ART facilitation.",
  certImageUrl: "/assets/cert-badges/safe-rte.svg",
  certImageAlt: "AI-Empowered SAFe Release Train Engineer certification badge",
  certSectionEyebrow: "Your credential",
  certSectionTitle: "How your SAFe® Release Train Engineer Certification looks like",
  certSectionLead:
    "Industry-recognized Scaled Agile credential after you pass the official exam — shareable badge and proof of ART-level facilitation skill.",
  certNavLabel: "Certification",
  certBullets: [
    "SAFe® Release Train Engineer digital credential",
    "Shareable badge for LinkedIn and professional profiles",
    "Signals program facilitation, PI planning, and Lean-Agile leadership",
    "Aligned with Scaled Agile’s official RTE exam path",
  ],
  trustLine: "SPC-led delivery · The Agile Forum",
  finalCtaTitle: "Ready to facilitate an Agile Release Train?",
  finalCtaLead:
    "Select your schedule, enroll, or book a mentor if you want a second opinion on RTE vs SSM / Leading SAFe first.",
  brochureCtaLabel: "Download Course Content & Brochure",
  demand: {
    salary: { min: "$110k", max: "$180k", avg: "$140k" },
    employers: [
      "Accenture",
      "IBM",
      "Capgemini",
      "Deloitte",
      "Infosys",
      "Cognizant",
      "Boeing",
      "Fidelity",
      "JPMorgan Chase",
    ],
    jobsCount: "10,000+",
    jobsLabel: "Openings referencing Release Train Engineer / ART facilitation",
    paragraphs: [
      "Enterprises scaling SAFe® rely on RTEs to keep ARTs aligned, dependent, and improving every PI.",
      "RTE demand tracks large-scale Agile transformations in financial services, healthcare, telecom, and government programs.",
      "Prior SAFe® experience (Leading SAFe, SSM, or POPM) accelerates classroom success — we help you sequence credentials if you’re still early on the path.",
    ],
  },
  curriculum: [
    {
      title: "Exploring the RTE role and responsibilities",
      summary:
        "Understand the RTE as servant leader and ART coach — decision facilitation, alignment, and value delivery across multiple teams.",
      bullets: ["RTE in the Lean enterprise", "Facilitation & decision-making", "Leadership for value delivery"],
    },
    {
      title: "Applying SAFe principles",
      summary:
        "Apply Scaled Agile Framework principles to drive continuous value across product deliveries at program scale.",
    },
    {
      title: "Organizing the Agile Release Train",
      summary:
        "Structure teams, roles, and flow so the ART can deliver predictably without drowning in coordination overhead.",
    },
    {
      title: "Planning a Planning Interval",
      summary:
        "Prepare the ART for PI Planning — readiness checklists, pre- and post-planning events, and stakeholder alignment.",
      bullets: ["PI readiness", "Pre- and post-PI events", "Stakeholder engagement"],
    },
    {
      title: "Executing a Planning Interval",
      summary:
        "Lead PI execution — summarize and publish PI objectives, manage risks, and keep delivery visible across the train.",
    },
    {
      title: "Fostering relentless improvement",
      summary:
        "Run Inspect & Adapt workshops that surface systemic issues and turn insights into actionable improvement backlogs.",
    },
    {
      title: "Serving the Agile Release Train",
      summary:
        "Coach collaboration across Scrum Masters, Product Management, and Business Owners — communication patterns that keep the ART healthy.",
    },
    {
      title: "AI for RTEs",
      summary:
        "Foundations and prompting, responsible AI use, and building an AI-augmented RTE workflow for agendas, risk boards, and follow-ups.",
      bullets: ["AI foundations & prompting", "Responsible AI", "RTE workflow automation"],
    },
    {
      title: "Continuing your learning journey",
      summary:
        "Stay current with SAFe practices, community resources, and the path from RTE toward SPC and enterprise coaching roles.",
    },
  ],
  audience: [
    { role: "Scrum Masters & Team Coaches", detail: "Stepping up from team facilitation to ART orchestration" },
    { role: "Program / project managers", detail: "Leading multi-team delivery in a SAFe enterprise" },
    { role: "Agile coaches", detail: "Coaching ARTs through PI cadence and I&A" },
    { role: "Aspiring RTEs", detail: "Preparing for the Scaled Agile RTE exam and interviews" },
  ],
  faqGroups: [
    {
      title: "Pre-requisites",
      items: [
        {
          question: "Are there prerequisites for SAFe® RTE training?",
          answer:
            "No mandatory prerequisites. Prior Agile experience and an earlier SAFe® certification (Leading SAFe, SSM, or POPM) strongly help. Background as Scrum Master, Product Manager, or program lead is ideal.",
        },
        {
          question: "Can I take the RTE exam without a course?",
          answer:
            "No. Scaled Agile requires completion of an authorized instructor-led RTE course before exam eligibility.",
        },
      ],
    },
    {
      title: "RTE exam FAQs",
      items: [
        {
          question: "What is the SAFe® RTE exam format?",
          answer:
            "Typically 60 multiple-choice / multi-select questions in 120 minutes, online and closed-book (proctored). Confirm current details on scaledagile.com for your attempt.",
        },
        {
          question: "What is the passing score?",
          answer:
            "Scaled Agile publishes the current passing percentage with the exam guide; we review the latest threshold during class and prep.",
        },
        {
          question: "Is the first exam attempt included?",
          answer:
            "Exam attempt and SAFe Community membership packaging are confirmed at enrollment for your cohort.",
        },
        {
          question: "When do I get certified?",
          answer:
            "After you pass the official exam, Scaled Agile issues your SAFe® RTE credential and digital badge.",
        },
      ],
    },
    {
      title: "Training & enrollment FAQs",
      items: [
        {
          question: "How long is the training?",
          answer:
            "Typically 24 hours of live instructor-led training across three days. Exact cohort hours are listed on the schedule you select.",
        },
        {
          question: "Who teaches the sessions?",
          answer:
            "Experienced SAFe practitioners / SPCs from TheAgileForum, emphasizing applied ART facilitation rather than slide read-throughs.",
        },
        {
          question: "Do I need a schedule before checkout?",
          answer:
            "Yes. This offering is schedule-bound — select a cohort so your cart line carries the right batch.",
        },
        {
          question: "Should I take SSM or Leading SAFe before RTE?",
          answer:
            "Many learners complete Leading SAFe and/or SAFe Scrum Master first. If you’re unsure, book a mentor call and we’ll sequence credentials to your role goals.",
        },
        {
          question: "Can I change my batch?",
          answer:
            "Contact support before your cohort starts. We’ll help move you to the next open workshop when seats allow.",
        },
      ],
    },
  ],
  examGuidelines: {
    domains: [
      {
        domain: "RTE role & SAFe principles",
        topics: [
          "Release Train Engineer responsibilities",
          "Servant leadership at ART scale",
          "Applying SAFe principles to value delivery",
        ],
      },
      {
        domain: "Organizing & planning the ART",
        topics: [
          "Organizing the Agile Release Train",
          "PI Planning readiness",
          "Pre- and post-PI planning events",
        ],
      },
      {
        domain: "Executing the PI & improvement",
        topics: [
          "Executing a Planning Interval",
          "Publishing PI objectives",
          "Inspect & Adapt and relentless improvement",
        ],
      },
      {
        domain: "Serving the ART",
        topics: [
          "Coaching collaboration across roles",
          "Facilitating program events",
          "Communication and flow at program scale",
        ],
      },
    ],
    footnote:
      "Maintain your SAFe® credential per Scaled Agile’s current renewal tiers and continuing education guidance on scaledagile.com.",
    sourceUrl: "https://scaledagile.com/certification/release-train-engineer/",
    lead: "Topic areas aligned to Scaled Agile’s Release Train Engineer certification path — use with your workshop notes and practice exam.",
    sourceLabel: "scaledagile.com/certification/release-train-engineer",
  },
  brochureMailto:
    "mailto:contact@theagileforum.com?subject=SAFe%20RTE%20Course%20Content%20%26%20Brochure",
  corporateMailto:
    "mailto:contact@theagileforum.com?subject=Corporate%20SAFe%20RTE%20Training",
  mentorImageUrl: "/assets/offers/mentor-dhirender.png",
  mentorName: "Dhirender Verma",
  mentorHeadline: "SPC · ART & program facilitation mentor",
  mentorBody:
    "Wondering if RTE is the right next credential after SSM or Leading SAFe? Book a short call — role fit, timing, and whether mentorship should come first.",
};

/** Professional Scrum Master™ II (PSM II) — Scrum.org pathway; adapted for TheAgileForum voice. */
const PSM_II_EXTRAS: OfferPageExtras = {
  rating: {
    score: "4.9",
    meta: "Average learner rating · advanced Scrum Master cohorts",
  },
  heroEyebrow: "Scrum.org · Live PSM II pathway",
  kindChip: "Certification",
  benefitPills: [
    "16 hrs live training",
    "Advanced Scrum Master stances",
    "Exam-oriented review",
    "Lifetime Scrum.org credential",
  ],
  keyBenefits: [
    {
      title: "Lead beyond the basics",
      detail: "Servant leadership, facilitation, coaching, and change-agent stances",
    },
    {
      title: "Handle real complexity",
      detail: "Team conflict, organizational impediments, and middle-management dynamics",
    },
    {
      title: "Protect empiricism",
      detail: "Done Increments, Sprint Goals, and measurement that supports transparency",
    },
    {
      title: "Assessment-ready",
      detail: "Scenario practice aligned to the Scrum.org PSM II assessment",
    },
  ],
  overviewTitle: "Advance as a Scrum Master who can lead through complexity",
  overviewBody:
    "Professional Scrum Master™ II (PSM II) from Scrum.org validates that you can apply Scrum as a servant-leader in complex, real-world situations — not only recite the Scrum Guide. This live workshop deepens facilitation, coaching, impediment removal, and organizational change skills so you can serve the team, the Product Owner, and the wider organization.",
  overviewPracticeTitle: "What you’ll practice",
  overviewPracticeBody:
    "Choosing the right Scrum Master stance for the moment, facilitating difficult conversations, removing impediments beyond the team, supporting the Product Owner on value delivery, protecting a Done Increment and a clear Sprint Goal, and using measurement to improve — not to punish.",
  overviewExpectationsTitle: "What to expect after class",
  overviewExpectationsBody:
    "You prepare for the Scrum.org Professional Scrum Master™ II assessment (typically 30 questions in 90 minutes; 85% to pass; open-book, scenario-focused). Assessment attempt packaging and any password windows are confirmed at enrollment for your cohort. PSM II credentials from Scrum.org do not expire.",
  overviewStats: [
    { num: "2 days", label: "Live workshop · typically 16 hours" },
    { num: "30 Q", label: "PSM II assessment · 90 minutes (Scrum.org)" },
    { num: "85%", label: "Passing score · lifetime credential" },
  ],
  learnLead: "Advanced Scrum Master skills for senior delivery and coaching roles.",
  curriculumTitle: "PSM II pathway curriculum",
  curriculumLead:
    "Modules aligned to how effective Scrum Masters serve people, products, and organizations — with scenario practice for the Scrum.org assessment.",
  audienceTitle: "Who should attend",
  audienceLead:
    "Built for practicing Scrum Masters and Agile leaders who already know the framework and want advanced application skill.",
  certImageUrl: "/assets/cert-badges/psm-ii.svg",
  certImageAlt: "Professional Scrum Master II PSM II pathway badge — The Agile Forum",
  certSectionEyebrow: "Your credential",
  certSectionTitle: "How the Professional Scrum Master™ II (PSM II) path works",
  certSectionLead:
    "Complete the live course, then take the Scrum.org PSM II assessment. Passing earns a lifetime Professional Scrum Master™ II credential you can share from your Scrum.org profile.",
  certNavLabel: "Certification",
  certBullets: [
    "Professional Scrum Master™ II (PSM II) credential via Scrum.org after you pass",
    "Lifetime validity — no renewal cycle or continuing-education fee from Scrum.org for PSM II",
    "Signals advanced facilitation, coaching, and organizational change ability",
    "Assessment attempt packaging confirmed at enrollment",
  ],
  trustLine: "Live Scrum coaching · The Agile Forum",
  finalCtaTitle: "Ready for your PSM II pathway?",
  finalCtaLead:
    "Select a cohort, enroll, or book a mentor if you want help choosing between PSM II, Mentorship Masterclass, CSM®, and SAFe® next steps.",
  brochureCtaLabel: "Download Course Content & Brochure",
  demand: {
    salary: { min: "$95k", max: "$175k", avg: "$125k" },
    employers: [
      "Accenture",
      "IBM",
      "Deloitte",
      "Infosys",
      "Cognizant",
      "JPMorgan Chase",
      "Capgemini",
      "Amazon",
      "TCS",
    ],
    jobsCount: "50,000+",
    jobsLabel: "Openings referencing senior Scrum Master / Agile coach skills",
    paragraphs: [
      "PSM II is widely respected as an advanced, assessment-first Scrum Master credential from Scrum.org.",
      "Employers looking for senior Scrum Masters and Agile coaches often want evidence of judgment under complexity — exactly what PSM II emphasizes.",
      "Pairing the credential with live-project practice (our Mentorship Masterclass) is how many TheAgileForum learners become interview-ready for senior roles.",
    ],
  },
  curriculum: [
    {
      title: "Effects of a successful Scrum Master on the organization",
      summary:
        "How Scrum Master effectiveness shows up beyond a single team — culture, flow, and sustainable agility.",
      bullets: ["Organizational impact", "Systemic impediments", "Sustainable change"],
    },
    {
      title: "Complexity & servant leadership",
      summary:
        "Leading when outcomes are uncertain — servant leadership that enables self-managing teams without controlling them.",
    },
    {
      title: "Team conflict & removing impediments",
      summary:
        "Constructive conflict, difficult conversations, and escalating organizational blockers that the team cannot remove alone.",
      bullets: ["Conflict facilitation", "Impediment strategies", "Working with management"],
    },
    {
      title: "Facilitation techniques",
      summary:
        "Facilitation patterns that create participation, clarity, and decisions — including approaches inspired by Liberating Structures-style workshops.",
    },
    {
      title: "Done Increments & Sprint Goals",
      summary:
        "Why a Done Increment and a clear Sprint Goal protect empiricism — and how Scrum Masters coach quality and focus.",
    },
    {
      title: "Refreshing Scrum Events & supporting the Product Owner",
      summary:
        "Purpose-driven events (not status theater) and how Scrum Masters help Product Owners maximize value delivery.",
    },
    {
      title: "Measurement, middle management & change agency",
      summary:
        "Using metrics for transparency, understanding middle-management challenges, and acting as a change agent for broader agility.",
      bullets: ["Helpful vs harmful metrics", "Management in Scrum", "Change-agent stance"],
    },
    {
      title: "PSM II assessment orientation & next steps",
      summary:
        "Assessment format overview, scenario practice approach, and how Mentorship Masterclass deepens job-ready skills after the workshop.",
    },
  ],
  audience: [
    {
      role: "Practicing Scrum Masters",
      detail: "Typically 1+ year of Scrum experience wanting advanced judgment",
    },
    {
      role: "Agile coaches & mentors",
      detail: "Deepening Scrum Master stances for team and org coaching",
    },
    {
      role: "Project / delivery managers",
      detail: "Moving from control habits into servant leadership at scale of influence",
    },
    {
      role: "Team leads & Product Owners",
      detail: "Understanding advanced Scrum Master responsibilities and collaboration",
    },
  ],
  faqGroups: [
    {
      title: "Pre-requisites",
      items: [
        {
          question: "Are there prerequisites for PSM II?",
          answer:
            "Scrum.org does not require a prior credential. Strong Scrum Guide knowledge and practical Scrum Master experience (often PSM I–level understanding plus hands-on practice) are strongly recommended.",
        },
        {
          question: "Is PSM I mandatory before PSM II?",
          answer:
            "No. PSM I is not mandatory. Many learners take PSM I first because it builds foundational assessment comfort, but you can pursue PSM II when you are ready for scenario-based application questions.",
        },
        {
          question: "Do I need a year of Scrum Master experience?",
          answer:
            "It is recommended, not enforced. Candidates with real facilitation and impediment experience typically perform better on scenario questions. Live training helps bridge gaps when experience is uneven.",
        },
      ],
    },
    {
      title: "PSM II exam & certification",
      items: [
        {
          question: "What is the PSM II assessment format?",
          answer:
            "Typically 30 questions in 90 minutes (multiple-choice, multiple-answer, and true/false), open-book, with an 85% passing score. Questions are predominantly scenario-based. Confirm current details on scrum.org for your attempt.",
        },
        {
          question: "How does PSM II differ from PSM I?",
          answer:
            "PSM I emphasizes foundational Scrum knowledge (commonly 80 questions / 60 minutes). PSM II uses fewer but harder scenario questions focused on servant leadership, coaching, facilitation, and organizational dynamics.",
        },
        {
          question: "Is the exam fee included?",
          answer:
            "Scrum.org assessment packaging varies by cohort offer — we confirm what is included (attempts, passwords, windows) before you pay. Standalone Scrum.org assessment fees are published on scrum.org.",
        },
        {
          question: "Does PSM II expire?",
          answer:
            "No. Professional Scrum Master™ II from Scrum.org is a lifetime credential and does not require renewal fees.",
        },
        {
          question: "PSM II vs CSM® — which should I take?",
          answer:
            "CSM® (Scrum Alliance) is course-gated and widely recognized for foundational Scrum Master roles. PSM II (Scrum.org) is an advanced, assessment-first credential emphasizing applied judgment. Many learners use CSM® or Mentorship for foundations, then PSM II to signal senior capability.",
        },
      ],
    },
    {
      title: "Training & enrollment",
      items: [
        {
          question: "How long is the training?",
          answer:
            "Live instructor-led training totaling about 16 hours across two days (weekend or weekday cohorts depending on schedule).",
        },
        {
          question: "Is training live or recorded-only?",
          answer:
            "Sessions are live and interactive — role plays, simulations, and discussion. Recordings may be shared for review when the cohort offers them — confirm for your batch.",
        },
        {
          question: "Who teaches the sessions?",
          answer:
            "Experienced Agile coaches from TheAgileForum led by Dhirender Verma (SPC · enterprise Agile coach). Any Scrum.org Professional Training Network / trainer requirements for your cohort are confirmed at enrollment.",
        },
        {
          question: "Do I need a schedule before checkout?",
          answer:
            "Yes. This offering is schedule-bound — select a cohort so your cart line carries the right batch.",
        },
        {
          question: "What if I want job-ready skills beyond 2 days?",
          answer:
            "Most learners pair advanced credentials with our 3-week Mentorship Masterclass (live JIRA project) and optionally Mock Interview Series — certification alone rarely lands a senior Scrum Master role.",
        },
      ],
    },
  ],
  examGuidelines: {
    domains: [
      {
        domain: "Understanding and applying the Scrum Framework",
        topics: [
          "Empiricism and Scrum Values in tough situations",
          "Accountabilities, events, and artifacts under pressure",
          "Done Increments and Sprint Goals",
        ],
      },
      {
        domain: "Developing people and teams",
        topics: [
          "Self-managing teams",
          "Facilitation and Liberating Structures-style patterns",
          "Leadership styles, coaching, and mentoring",
        ],
      },
      {
        domain: "Managing products with agility",
        topics: [
          "Supporting the Product Owner",
          "Stakeholder engagement",
          "Successful product delivery",
        ],
      },
      {
        domain: "Developing and delivering products professionally",
        topics: [
          "Definition of Done and quality",
          "Managing technical and delivery risk",
          "Continuous improvement of delivery practices",
        ],
      },
      {
        domain: "Evolving the Agile organization",
        topics: [
          "Organizational design and impediments",
          "Middle management challenges",
          "Scrum Master as change agent",
        ],
      },
    ],
    footnote:
      "PSM II is a lifetime Scrum.org credential. Confirm current assessment rules, languages, and fees on scrum.org before your attempt.",
    sourceUrl: "https://www.scrum.org/assessments/professional-scrum-master-ii-certification",
    lead: "Competency areas commonly associated with the Scrum.org Professional Scrum Master™ II assessment — use with your workshop notes and practice scenarios.",
    sourceLabel: "scrum.org · Professional Scrum Master II",
  },
  brochureMailto:
    "mailto:contact@theagileforum.com?subject=PSM%20II%20Course%20Content%20%26%20Brochure",
  corporateMailto:
    "mailto:contact@theagileforum.com?subject=Corporate%20PSM%20II%20Training",
  mentorImageUrl: "/assets/offers/mentor-dhirender.png",
  mentorName: "Dhirender Verma",
  mentorHeadline: "SPC · Scrum & SAFe mentor · job-focused coaching",
  mentorBody:
    "Not sure whether to start with PSM II, Mentorship Masterclass, CSM®, or SAFe®? Book a short call — we’ll match credential timing to your target role and interview timeline.",
};

/** Mentorship / live JIRA masterclass — content aligned to theagileforum.com course page. */
const MENTORSHIP_EXTRAS: OfferPageExtras = {
  rating: {
    score: "4.9",
    meta: "Average learner rating · small live cohorts (4–6)",
  },
  heroEyebrow: "Job-focused mentorship · Live JIRA project",
  heroImageUrl: "/assets/offers/mentorship-hero.png",
  heroImageAlt: "Scrum Master mentorship masterclass — live cohort training",
  kindChip: "Mentorship",
  benefitPills: [
    "3 weeks · weekday live classes",
    "Live JIRA project on your system",
    "Interview & situational prep",
    "Rejoin next batch free",
  ],
  keyBenefits: [
    {
      title: "5× a 2-day cert class",
      detail: "Full Scrum, XP, Kanban & Agile PM — not slides alone",
    },
    {
      title: "Hands-on every session",
      detail: "Sprint events simulated on a live JIRA project you own",
    },
    {
      title: "Interview-ready",
      detail: "Situational questions, coaching roleplays, and guidance",
    },
    {
      title: "Pay once, rejoin free",
      detail: "Rejoin the next batch at no extra cost; 3 months trainer support",
    },
  ],
  overviewTitle: "Land the role — not just another certificate",
  overviewBody:
    "Practical, job-oriented hands-on training on a live project in JIRA & AI. Full Scrum, XP, Kanban, and Agile project management so you can step into a Scrum Master, Agile PM, or Product Owner role with confidence.",
  overviewPracticeTitle: "What every session builds",
  overviewPracticeBody:
    "Every sprint event performed live in Jira on your system, coaching conversations and roleplays, boards/JQL/dashboards, user-story workshops, advanced quality/risk/maturity topics, and situational interview practice — plus an option to rejoin the next batch free.",
  overviewExpectationsTitle: "What you can expect",
  overviewExpectationsBody:
    "In-depth Jira core features; comprehensive Agile, Scrum, and Kanban; practical project, sprint, and backlog management; user-story writing and splitting workshops; collaboration techniques; reusable templates; and case-based practice. This is a non-certification course, with support to prepare for PSM or other certifications after training.",
  overviewStats: [
    { num: "3 weeks", label: "AI-enabled SM/PO mentorship · weekday cohorts" },
    { num: "1.5 hrs", label: "Live class every weekday (Mon–Fri)" },
    { num: "4–6", label: "Small cohort size for personal attention" },
  ],
  benefitsTitle: "Why this mentorship works",
  benefitsLead:
    "Build practical role knowledge, certification readiness, and job-search confidence through live practice and continued support.",
  benefits: [
    {
      title: "Correct, complete role knowledge",
      detail:
        "Learn the practical foundations and situational thinking expected of Scrum Masters and Agile Project Managers.",
      images: [
        {
          src: "/mentorship-benefits/role-knowledge.png",
          alt: "Two heads with interconnected gears representing shared practical knowledge",
        },
      ],
    },
    {
      title: "Certification preparation and exam support",
      detail:
        "Strengthen your Scrum knowledge and prepare for PSM I with guided review and exam-oriented support.",
      note:
        "Outcomes depend on participation, preparation, and exam eligibility; certification is taken separately.",
      images: [
        {
          src: "/mentorship-benefits/exam-support-badge.png",
          alt: "Certification exam preparation and support badge",
        },
        {
          src: "/mentorship-benefits/psm-i-logo.png",
          alt: "Professional Scrum Master I logo",
        },
      ],
    },
    {
      title: "Handholding and job support",
      detail:
        "Get mentor guidance, query support, and practical job-search help as you work toward your next role.",
      images: [
        {
          src: "/mentorship-benefits/handholding-job-support.png",
          alt: "Handshake with rising arrow representing mentorship and career support",
        },
      ],
    },
    {
      title: "Hands-on live Jira project and recordings",
      detail:
        "Practice project setup, backlogs, boards, sprint events, JQL, and dashboards on your own system, with recordings to revisit.",
      images: [
        {
          src: "/mentorship-benefits/live-jira-project.png",
          alt: "Live Jira project board with sprint work in progress",
        },
      ],
    },
    {
      title: "Rejoin live sessions and the inner circle",
      detail:
        "Rejoin a future live batch at no extra cost and continue learning with the alumni inner-circle community.",
      images: [
        {
          src: "/mentorship-benefits/rejoin-live-sessions.png",
          alt: "Interactive online class with learners and an instructor",
        },
      ],
    },
    {
      title: "Winning resume and relevant job leads",
      detail:
        "Shape a clear, role-focused resume and receive suitable job leads shared through the mentorship network when available.",
      images: [
        {
          src: "/mentorship-benefits/winning-resume.png",
          alt: "Resume examples with a highlighted hired resume",
        },
      ],
    },
  ],
  learnLead:
    "End-to-end knowledge to clear Scrum Master or Agile PM interviews — and prepare for PSM after training.",
  curriculum: [
    {
      title: "Agile foundations — Scrum, XP & Kanban",
      summary:
        "Build the mindset and frameworks you need before tools: Agile principles, Scrum roles/events/artifacts, XP practices, and Kanban flow.",
      bullets: [
        "Scrum framework end-to-end",
        "XP practices that power delivery quality",
        "Kanban for flow and WIP limits",
      ],
    },
    {
      title: "Live JIRA project on your laptop",
      summary:
        "Set up a real JIRA project on every participant’s system and manage sprints, backlogs, and boards hands-on — not demos you only watch.",
      bullets: ["Project & board setup", "Backlogs, sprints & workflows", "Confluence / knowledge docs where used"],
    },
    {
      title: "Sprint events — full checklist simulations",
      summary:
        "Form a scrum team and run planning, daily scrum, review, and retrospective with real checklists, inputs/outputs, and coaching moments.",
      bullets: [
        "Sprint planning & backlog refinement",
        "Daily scrum facilitation",
        "Review & retrospective facilitation",
      ],
    },
    {
      title: "Boards, JQL & dashboards",
      summary:
        "In-depth JIRA skills: boards, JQL filters, and dashboards so you can run reporting and transparency like a working Scrum Master.",
    },
    {
      title: "User stories & splitting workshop",
      summary:
        "Best practices for epics, stories, and tasks — plus a live user-story writing and story-splitting workshop.",
    },
    {
      title: "Coaching conversations & roleplays",
      summary:
        "Practice the conversations that make a great Scrum Master: impediments, conflict, collaboration, and servant-leadership patterns.",
    },
    {
      title: "Quality, risks & maturity",
      summary:
        "Advanced topics: quality enhancement, risks and mitigations, and maturity assessments — the depth 2-day cert classes usually skip.",
    },
    {
      title: "Interview guidance & situational questions",
      summary:
        "Walk through situational interview questions and answer patterns so you leave ready for SM / Agile PM interviews.",
    },
    {
      title: "AI-enabled SM/PO workflows & templates",
      summary:
        "AI prompts and workflows for the modern Scrum Master/PO, plus capacity sheets, coaching docs, and knowledge templates to reuse on the job.",
    },
  ],
  curriculumTitle: "3 phases · 9 modules of practical mastery",
  curriculumLead:
    "Curriculum mirrors the live mentorship masterclass — from foundations through live JIRA immersion, coaching, interviews, and AI-enabled workflows.",
  audience: [
    {
      role: "Career changers",
      detail: "Working in a different role and want a path into Scrum Master / Agile PM",
    },
    {
      role: "Non-IT aspirants",
      detail: "Never worked in software/IT, but want to become Scrum Master / Agile PM",
    },
    {
      role: "Returners",
      detail: "Career gap and need interview-ready fundamentals plus hands-on practice",
    },
    {
      role: "Working SMs & coaches",
      detail: "Basics + advanced aren’t crisp — want practical hands-on and interview confidence",
    },
  ],
  audienceTitle: "Who benefits most",
  audienceLead:
    "Designed to help you land a Scrum Master or Agile Project Manager job — not just sit through theory.",
  certImageUrl: "/assets/offers/mentorship-live-project.png",
  certImageAlt: "Live JIRA project mentorship in session",
  certSectionEyebrow: "Program experience",
  certSectionTitle: "Scrum immersion on a live JIRA project",
  certSectionLead:
    "Participants form a scrum team and simulate Scrum Master, Product Owner, and BA work on a live JIRA project — every event, checklist, and coaching moment included.",
  certNavLabel: "Experience",
  certBullets: [
    "Online live project on every participant’s system",
    "Class recordings provided",
    "All sprint events and simulations on live JIRA",
    "Non-certification course — take PSM/certification after training",
    "Inner-circle community support after the cohort",
  ],
  faqGroups: [
    {
      title: "About the program",
      items: [
        {
          question: "What is the Scrum Master mentorship program?",
          answer:
            "A comprehensive 3-week live course with hands-on experience on live JIRA projects — so you can perform the Scrum Master role with confidence and clear Scrum Master or Agile Project Manager interviews. Optional add-ons include SAFe certifications, mock interviews, and resume preparation.",
        },
        {
          question: "How long is the program?",
          answer:
            "About 3+ weeks of intensive weekday classes (1.5 hours each, Monday–Friday), with the option to rejoin the next batch free.",
        },
        {
          question: "Do I need prior experience or certifications?",
          answer:
            "No. The program accommodates beginners through experienced practitioners — including successful career switchers from non-technical backgrounds.",
        },
        {
          question: "Is this a certification course?",
          answer:
            "No — this is a non-certificate mentorship/masterclass. Certifications (e.g. PSM) are taken after training. SAFe certs can be enrolled separately.",
        },
      ],
    },
    {
      title: "Delivery & support",
      items: [
        {
          question: "How are live projects conducted in JIRA?",
          answer:
            "We help you set up a live JIRA project on your laptop. Hands-on project work is core to the program — you apply learning in a practical setting every session.",
        },
        {
          question: "What is the class size?",
          answer:
            "Intentionally small (about 4–6) for personalized attention: lectures, exercises, discussions, and project work.",
        },
        {
          question: "Can I rejoin a future batch for free?",
          answer:
            "Yes. Pay once and you may rejoin a future batch at no extra cost. Trainer support for queries continues for 3 months after completion.",
        },
        {
          question: "Do I get materials after the program?",
          answer:
            "Yes — recordings, course docs, and templates stay available so you can review at your own pace. Alumni join the inner-circle community for ongoing support.",
        },
      ],
    },
    {
      title: "Enrollment",
      items: [
        {
          question: "Do I need a schedule before checkout?",
          answer:
            "Yes. This offering is schedule-bound — select a cohort so your cart line carries the right batch.",
        },
        {
          question: "Who teaches the sessions?",
          answer:
            "Dhirender Verma — SPC, large-scale transformation consultant, and Scrum/XP/SAFe trainer.",
        },
        {
          question: "Can I change my batch?",
          answer:
            "Contact support if scheduling conflicts arise. Batch transfers are accommodated when seats allow — and rejoining the next batch free remains available.",
        },
      ],
    },
  ],
  brochureMailto: "https://bit.ly/3pERJqE",
  brochureCtaLabel: "Download full syllabus (PDF)",
  corporateMailto:
    "mailto:contact@theagileforum.com?subject=Corporate%20Scrum%20Master%20Mentorship",
  trustLine: "Mentor-led · Live JIRA",
  finalCtaTitle: "Ready for hands-on mentorship?",
  finalCtaLead:
    "Select your weekday cohort, enroll at the listed price, or book a mentor call if you want role-fit guidance first.",
  mentorImageUrl: "/assets/offers/mentor-dhirender.png",
  mentorName: "Dhirender Verma",
  mentorHeadline: "Learn with the mentor who runs every cohort",
  mentorBody:
    "SPC · large-scale transformation consultant · Scrum/XP/SAFe trainer. Not sure this is your next step? Book a short call — role fit, cohort timing, and whether mock interviews or SAFe add-ons help your goal.",
};

/** Mock Interview Series — service offer (not schedule-bound). */
const MOCK_INTERVIEW_EXTRAS: OfferPageExtras = {
  rating: {
    score: "4.9",
    meta: "Average learner rating · interview prep series",
  },
  heroEyebrow: "Interview prep · Live mock series",
  heroImageUrl: "/assets/offers/mock-interview-series.png",
  heroImageAlt: "Mock Interview Series with Interview Preparation",
  kindChip: "Service",
  benefitPills: [
    "5 mock interviews · 7.5 hrs",
    "100+ situational Q&A",
    "Resume-aware feedback",
    "SM · APM · PO · BA · Coach",
  ],
  keyBenefits: [
    {
      title: "100+ situational questions",
      detail: "Real-world Scrum and Agile PM scenarios with suggested answer patterns",
    },
    {
      title: "Personalized feedback",
      detail: "Refine answers from your resume and experience — not generic scripts",
    },
    {
      title: "Self-introduction coaching",
      detail: "Impactful opening and closing statements for live interviews",
    },
    {
      title: "Agile vocabulary under pressure",
      detail: "Practice how to break down any problem the way interviewers expect",
    },
  ],
  overviewTitle: "Walk into interviews ready — not rehearsed from a script",
  overviewBody:
    "Ace your Scrum Master / Agile Project Manager interviews with 100+ situational questions and suggested answers. A series of 5 mock interviews helps you excel at each aspect of the interview process.",
  overviewPracticeTitle: "What every session builds",
  overviewPracticeBody:
    "Situational Q&A discussion tailored to your background, feedback on structure and confidence, self-introduction polish, and practice using precise agile terminology under interview pressure.",
  overviewExpectationsTitle: "What you can expect",
  overviewExpectationsBody:
    "Roles covered include Scrum Master, Agile Project Manager, Product Owner, BA, and Agile Coach. You leave with clearer answer frameworks, stronger delivery, and feedback you can reuse in real interviews.",
  overviewStats: [
    { num: "5 sessions", label: "Mock interviews across the interview process" },
    { num: "7.5 hrs", label: "Focused live interview preparation" },
    { num: "100+", label: "Situational questions with discussion" },
  ],
  learnLead:
    "Build structured answers for Scrum and Agile PM interviews — grounded in your experience, not memorized lines.",
  curriculum: [
    {
      title: "Interview framing & self-introduction",
      summary:
        "Craft an impactful opening and closing so you set the tone before situational questions begin.",
      bullets: [
        "Strong open and close statements",
        "Role narrative for career switchers",
        "First-impression confidence cues",
      ],
    },
    {
      title: "Situational Scrum Master questions",
      summary:
        "Practice facilitation, impediments, conflict, and servant-leadership scenarios interviewers commonly probe.",
      bullets: ["Sprint event facilitation", "Impediment handling", "Stakeholder conversations"],
    },
    {
      title: "Agile PM / delivery scenarios",
      summary:
        "Walk through delivery, prioritization, and cross-team collaboration questions with structured answer patterns.",
    },
    {
      title: "Resume-aware answer refinement",
      summary:
        "Discuss each question against your resume and project experience so answers sound authentic and specific.",
    },
    {
      title: "Vocabulary, problem breakdown & live feedback",
      summary:
        "Use precise agile language under pressure and break down complex problems the way hiring panels expect — with personalized feedback each round.",
    },
  ],
  curriculumTitle: "5 mock interviews · full interview-process coverage",
  curriculumLead:
    "Each session targets a different part of the interview so you build confidence end-to-end — from introduction through situational depth.",
  audience: [
    {
      role: "Active job seekers",
      detail: "Interviewing now for Scrum Master / Agile PM roles and want structured practice",
    },
    {
      role: "Career switchers",
      detail: "Moving into Agile roles and need situational answers tied to transferable experience",
    },
    {
      role: "Working practitioners",
      detail: "Know the work, but want sharper interview delivery and vocabulary",
    },
    {
      role: "Mentorship alumni",
      detail: "Completed hands-on training and want interview-specific polish next",
    },
  ],
  audienceTitle: "Who benefits most",
  audienceLead:
    "Built for people who want interview confidence for Scrum, Agile PM, PO, BA, and coaching roles — not another slide deck.",
  certImageUrl: "/assets/offers/mock-interview-series.png",
  certImageAlt: "Mock Interview Series with Interview Preparation",
  certSectionEyebrow: "Interview experience",
  certSectionTitle: "Practice like the interview is already booked",
  certSectionLead:
    "Live mock rounds with discussion on each question — so you refine answers from your resume, build confidence, and walk into real interviews prepared.",
  certNavLabel: "Experience",
  certBullets: [
    "5 mock interviews covering the interview process",
    "100+ situational questions with real-world scenarios",
    "Feedback tailored to your resume and experience",
    "Self-introduction coaching for strong open and close",
    "Roles: Scrum Master · Agile PM · PO · BA · Agile Coach",
  ],
  faqGroups: [
    {
      title: "About the series",
      items: [
        {
          question: "What is the Mock Interview Series?",
          answer:
            "A live interview-preparation series with 5 mock interviews and 100+ situational questions — designed to help you excel at Scrum Master, Agile Project Manager, Product Owner, BA, and Agile Coach interviews.",
        },
        {
          question: "How long is the series?",
          answer: "About 7.5 hours across 5 mock interview sessions.",
        },
        {
          question: "Is this a certification course?",
          answer:
            "No — this is interview preparation. Pair it with mentorship or SAFe certifications if you also need hands-on skills or credentials.",
        },
      ],
    },
    {
      title: "Delivery & support",
      items: [
        {
          question: "How are answers personalized?",
          answer:
            "Each question is discussed so you refine answers from your resume and prior project experience — not one-size-fits-all scripts.",
        },
        {
          question: "Which roles does this cover?",
          answer:
            "Scrum Master, Agile Project Manager, Product Owner, Business Analyst, and Agile Coach interview paths.",
        },
        {
          question: "Who leads the sessions?",
          answer:
            "Dhirender Verma — SPC, large-scale transformation consultant, and Scrum/XP/SAFe trainer with deep interview coaching experience.",
        },
      ],
    },
    {
      title: "Enrollment",
      items: [
        {
          question: "Do I need a schedule before checkout?",
          answer:
            "No. This service is not schedule-bound — you can enroll and add to cart without selecting a cohort. Session timing is coordinated after enrollment.",
        },
        {
          question: "Can I combine this with mentorship or resume support?",
          answer:
            "Yes. Many learners pair mock interviews with the Mentorship Masterclass and/or resume + LinkedIn upgrade support when they need both skills and interview polish.",
        },
      ],
    },
  ],
  brochureMailto:
    "mailto:contact@theagileforum.com?subject=Mock%20Interview%20Series%20Details",
  brochureCtaLabel: "Request series details",
  corporateMailto:
    "mailto:contact@theagileforum.com?subject=Corporate%20Mock%20Interview%20Series",
  trustLine: "Live interview prep",
  finalCtaTitle: "Ready to practice for real interviews?",
  finalCtaLead:
    "Enroll at the listed price, or book a mentor call if you want role-fit guidance before you start.",
  mentorImageUrl: "/assets/offers/mentor-dhirender.png",
  mentorName: "Dhirender Verma",
  mentorHeadline: "Practice with a mentor who runs real interviews",
  mentorBody:
    "SPC · large-scale transformation consultant · Scrum/XP/SAFe trainer. Not sure mock interviews are your next step? Book a short call — role fit, timing, and whether mentorship or resume support should come first.",
};

/** New Resume With Cover Letter & Linkedin Upgrade — service offer (not schedule-bound). */
const POWER_RESUME_EXTRAS: OfferPageExtras = {
  rating: {
    score: "4.9",
    meta: "Average learner rating · resume + LinkedIn upgrade",
  },
  heroEyebrow: "Career materials · Fast turnaround",
  heroImageUrl: "/assets/offers/power-resume-cover.png",
  heroImageAlt: "New Resume With Cover Letter and LinkedIn Upgrade",
  kindChip: "Service",
  benefitPills: [
    "Delivery within 1 day",
    "Role-specific keywords",
    "Resume + cover letter",
    "LinkedIn upgrade",
  ],
  keyBenefits: [
    {
      title: "Personalized to your target role",
      detail: "Achievements, skills, and keywords aligned to Scrum Master, Agile PM, and product hiring",
    },
    {
      title: "ATS Friendly Resume",
      detail:
        "Tried and tested formats which get you hired — structured so applicant tracking systems and recruiters can scan your fit",
    },
    {
      title: "Cover letter that matches",
      detail: "A paired letter with role-specific language — not a generic template",
    },
    {
      title: "LinkedIn upgrade for opportunities",
      detail:
        "Profile refresh that highlights your skills to maximize job opportunities with recruiters and hiring managers",
    },
    {
      title: "Fast turnaround",
      detail: "Typically delivered within one business day after you share your inputs",
    },
  ],
  overviewTitle: "A resume and LinkedIn profile that open doors",
  overviewBody:
    "Get a personalized new resume and cover letter with the right keywords, achievements, and skills for Scrum, Agile PM, and product roles — plus a LinkedIn upgrade to maximize job opportunities with skills. Choose from multiple professional formats.",
  overviewPracticeTitle: "What we refine",
  overviewPracticeBody:
    "Role narrative, measurable achievements, Agile/Scrum terminology aligned to job descriptions, a cover letter that reinforces your story, and a LinkedIn upgrade that surfaces your skills to maximize job opportunities.",
  overviewExpectationsTitle: "What you can expect",
  overviewExpectationsBody:
    "You share your current CV, LinkedIn URL, and target role; we return a polished resume, cover letter, and LinkedIn upgrade you can use immediately for applications — with format options that fit career-transition or experienced-practitioner stories.",
  overviewStats: [
    { num: "1 day", label: "Typical delivery after inputs" },
    { num: "3 assets", label: "Resume + cover letter + LinkedIn" },
    { num: "Role-fit", label: "Keywords for SM · APM · PO · BA" },
  ],
  learnLead:
    "Present your experience the way Agile hiring managers and recruiters expect — clear impact, precise vocabulary, strong first impression across resume and LinkedIn.",
  curriculum: [
    {
      title: "Intake & target-role framing",
      summary:
        "We align on your target role, country/market, and career story so the rewrite matches how you want to be hired.",
      bullets: ["Target role and keywords", "Experience highlights", "Career-switch or progression narrative"],
    },
    {
      title: "Resume rewrite",
      summary:
        "Structure achievements, skills, and terminology so recruiters and hiring managers can scan your fit quickly.",
      bullets: ["Impact-focused bullets", "Agile/Scrum vocabulary", "ATS-friendly clarity"],
    },
    {
      title: "Cover letter pairing",
      summary:
        "A short, role-specific letter that reinforces why you are a fit — not a copy-paste template.",
    },
    {
      title: "LinkedIn upgrade",
      summary:
        "Refresh your LinkedIn profile to maximize job opportunities with skills — headline, about, and experience language aligned to your target roles.",
      bullets: ["Skills-forward headline", "About and experience polish", "Recruiter-search friendly keywords"],
    },
    {
      title: "Format options & delivery",
      summary:
        "Choose from multiple professional formats. Typical turnaround is within one business day after intake is complete.",
    },
  ],
  curriculumTitle: "How the resume + LinkedIn service works",
  curriculumLead:
    "A focused rewrite path — intake, resume, cover letter, LinkedIn upgrade, and delivery — without a live class schedule.",
  audience: [
    {
      role: "Active job seekers",
      detail: "Applying now and need sharper materials before interviews",
    },
    {
      role: "Career switchers",
      detail: "Moving into Scrum / Agile PM / PO roles and need transferable experience framed well",
    },
    {
      role: "Working practitioners",
      detail: "Strong delivery experience, but a resume or LinkedIn that undersells impact",
    },
    {
      role: "Mentorship or mock-interview learners",
      detail: "Pairing skills practice with application materials that get callbacks",
    },
  ],
  audienceTitle: "Who benefits most",
  audienceLead:
    "Built for people targeting Scrum Master, Agile PM, Product Owner, and related roles — not a generic resume mill.",
  certImageUrl: "/assets/offers/power-resume-cover.png",
  certImageAlt: "New Resume With Cover Letter and LinkedIn Upgrade",
  certSectionEyebrow: "Application materials",
  certSectionTitle: "Resume, cover letter, and LinkedIn built for Agile hiring",
  certSectionLead:
    "Personalized keywords, achievements, and skills — plus a LinkedIn upgrade to maximize job opportunities — delivered fast so you can apply with confidence.",
  certNavLabel: "Deliverable",
  certBullets: [
    "Personalized resume tailored to experience and target role",
    "ATS Friendly Resume, with tried and tested formats which get you hired",
    "Cover letter with role-specific keywords and achievements",
    "LinkedIn upgrade to maximize job opportunities with skills",
    "Multiple professional format options",
    "Agile and Scrum terminology aligned to hiring expectations",
    "Typical delivery within one business day",
  ],
  faqGroups: [
    {
      title: "About the service",
      items: [
        {
          question: "What do I receive?",
          answer:
            "A personalized resume, a matching cover letter, and a LinkedIn upgrade to maximize job opportunities with skills — with role-specific keywords, achievements, and skills for Scrum, Agile PM, and product roles. Multiple format options are available.",
        },
        {
          question: "What does the LinkedIn upgrade include?",
          answer:
            "A profile refresh focused on maximizing job opportunities with skills — typically headline, About, and experience language aligned to your target Agile roles so recruiters can find and understand your fit faster.",
        },
        {
          question: "How fast is delivery?",
          answer:
            "Typical turnaround is within one business day after you share your current CV, LinkedIn URL, and target role details.",
        },
        {
          question: "Is this a live class?",
          answer:
            "No — this is a document and profile rewrite service. Pair it with mentorship or mock interviews if you also want hands-on skills or interview practice.",
        },
      ],
    },
    {
      title: "Process & support",
      items: [
        {
          question: "What do I need to provide?",
          answer:
            "Your latest CV (PDF preferred), LinkedIn profile URL, target role, and country/market. Extra context on achievements or career-switch goals helps us personalize further.",
        },
        {
          question: "Which roles is this optimized for?",
          answer:
            "Scrum Master, Agile Project Manager, Product Owner, Business Analyst, and related Agile delivery roles.",
        },
        {
          question: "Who reviews the materials?",
          answer:
            "Dhirender Verma and The Agile Forum mentoring team — experienced with how Agile hiring managers screen resumes and LinkedIn profiles.",
        },
      ],
    },
    {
      title: "Enrollment",
      items: [
        {
          question: "Do I need a schedule before checkout?",
          answer:
            "No. This service is not schedule-bound — you can enroll and add to cart without selecting a cohort. Delivery timing starts after intake.",
        },
        {
          question: "Can I combine this with mentorship or mock interviews?",
          answer:
            "Yes. Many learners pair this resume and LinkedIn service with the Mentorship Masterclass and/or Mock Interview Series when they need both materials and interview polish.",
        },
      ],
    },
  ],
  brochureMailto:
    "mailto:contact@theagileforum.com?subject=New%20Resume%20With%20Cover%20Letter%20%26%20LinkedIn%20Upgrade%20Details",
  brochureCtaLabel: "Request service details",
  corporateMailto:
    "mailto:contact@theagileforum.com?subject=Corporate%20Resume%20%26%20LinkedIn%20Upgrade%20Service",
  trustLine: "Resume + LinkedIn upgrade · fast delivery",
  finalCtaTitle: "Ready for a stronger resume and LinkedIn?",
  finalCtaLead:
    "Enroll at the listed price, or book a mentor call if you want role-fit guidance before you start.",
  mentorImageUrl: "/assets/offers/mentor-dhirender.png",
  mentorName: "Dhirender Verma",
  mentorHeadline: "Materials reviewed with Agile hiring in mind",
  mentorBody:
    "SPC · large-scale transformation consultant · Scrum/XP/SAFe trainer. Not sure resume and LinkedIn support is your next step? Book a short call — role fit, timing, and whether mentorship or mock interviews should come first.",
};

/** Slim shared extras for other SAFe certs — shell layout without SSM-only demand/video/exam table. */
function genericCertExtras(certLabel: string): OfferPageExtras {
  return {
    rating: {
      score: "4.9",
      meta: "Average learner rating · live workshop cohorts",
    },
    benefitPills: ["Live mentor-led training", "Exam preparation", "Interview guidance"],
    keyBenefits: [
      {
        title: "Role-ready practice",
        detail: "Applied labs, not slide read-throughs",
      },
      {
        title: "Enterprise context",
        detail: "SAFe patterns used on real ARTs",
      },
      {
        title: "Mentor guidance",
        detail: "Talk through fit before you enroll",
      },
      {
        title: "Career path",
        detail: "Certification plus interview readiness",
      },
    ],
    overviewTitle: `Build confidence as a ${certLabel}`,
    overviewBody:
      "Live weekend workshop with mentor-led practice, exam preparation, and a clear path from classroom to credential.",
    overviewStats: [
      { num: "Live", label: "Weekend mentor-led workshop" },
      { num: "Exam path", label: "Aligned with Scaled Agile certification" },
      { num: "Mentor", label: "Guidance before you commit" },
    ],
    curriculum: [],
    audience: [
      { role: "Practitioners", detail: "Leveling up into a SAFe certified role" },
      { role: "Team leads", detail: "Facilitating change across teams" },
      { role: "Career switchers", detail: "Preparing for exam and interviews" },
      { role: "Agile contributors", detail: "Building enterprise delivery skills" },
    ],
    faqGroups: [
      {
        title: "Pre-requisites",
        items: [
          {
            question: "Are there any prerequisites for this course?",
            answer: "No formal prerequisites. Enroll if you want to facilitate Agile delivery in a SAFe enterprise.",
          },
        ],
      },
      {
        title: "Training & enrollment FAQs",
        items: [
          {
            question: "Do I need a schedule before checkout?",
            answer:
              "If this offer is schedule-bound, select a cohort so your cart line carries the right batch.",
          },
          {
            question: "Who teaches the sessions?",
            answer: "Experienced SAFe practitioners / SPCs focused on applied facilitation.",
          },
        ],
      },
    ],
    brochureMailto: `mailto:contact@theagileforum.com?subject=${encodeURIComponent(`${certLabel} Course Brochure`)}`,
    corporateMailto:
      "mailto:contact@theagileforum.com?subject=Corporate%20SAFe%20Certification%20Training",
  };
}

const SAFE_CERT_CODES = new Set([
  SSM_OFFER_CODE,
  RTE_OFFER_CODE,
  "safe-leading-safe",
  "safe-product-owner-product-manager-certification-training",
  "safe-agilist-leading-safe-certification-training",
]);

function powerResumeExtrasForRegion(opts?: {
  currency?: string | null;
  geo?: string | null;
}): OfferPageExtras {
  const currency = (opts?.currency ?? "").trim().toUpperCase();
  const geo = (opts?.geo ?? "").trim().toUpperCase();
  const india = currency === "INR" || geo === "IN";
  if (!india) return POWER_RESUME_EXTRAS;

  return {
    ...POWER_RESUME_EXTRAS,
    heroImageAlt: "New Resume with Naukri and LinkedIn Upgrade",
    benefitPills: [
      "Delivery within 1 day",
      "Role-specific keywords",
      "Resume + Naukri",
      "LinkedIn upgrade",
    ],
    keyBenefits: POWER_RESUME_EXTRAS.keyBenefits.map((b) =>
      b.title === "Cover letter that matches"
        ? {
            title: "Naukri upgrade for opportunities",
            detail:
              "Profile refresh that highlights your skills on Naukri to maximize job opportunities with recruiters",
          }
        : b,
    ),
    overviewTitle: "A resume, Naukri, and LinkedIn profile that open doors",
    overviewBody:
      "Get a personalized new resume with the right keywords, achievements, and skills for Scrum, Agile PM, and product roles — plus Naukri and LinkedIn upgrades to maximize job opportunities with skills. Choose from multiple professional formats.",
    overviewPracticeBody:
      "Role narrative, measurable achievements, Agile/Scrum terminology aligned to job descriptions, and Naukri + LinkedIn upgrades that surface your skills to maximize job opportunities.",
    overviewExpectationsBody:
      "You share your current CV, Naukri/LinkedIn URLs, and target role; we return a polished resume plus Naukri and LinkedIn upgrades you can use immediately for applications — with format options that fit career-transition or experienced-practitioner stories.",
    overviewStats: [
      { num: "1 day", label: "Typical delivery after inputs" },
      { num: "3 assets", label: "Resume + Naukri + LinkedIn" },
      { num: "Role-fit", label: "Keywords for SM · APM · PO · BA" },
    ],
    curriculum: POWER_RESUME_EXTRAS.curriculum.map((m) =>
      m.title === "Cover letter pairing"
        ? {
            title: "Naukri profile upgrade",
            summary:
              "Refresh your Naukri profile to maximize job opportunities with skills — headline, summary, and experience language aligned to your target roles.",
            bullets: [
              "Skills-forward headline",
              "Summary and experience polish",
              "Recruiter-search friendly keywords",
            ],
          }
        : m,
    ),
    curriculumTitle: "How the resume + Naukri + LinkedIn service works",
    curriculumLead:
      "A focused rewrite path — intake, resume, Naukri upgrade, LinkedIn upgrade, and delivery — without a live class schedule.",
    certImageAlt: "New Resume with Naukri and LinkedIn Upgrade",
    certSectionTitle: "Resume, Naukri, and LinkedIn built for Agile hiring",
    certSectionLead:
      "Personalized keywords, achievements, and skills — plus Naukri and LinkedIn upgrades to maximize job opportunities — delivered fast so you can apply with confidence.",
    certBullets: [
      "Personalized resume tailored to experience and target role",
      "ATS Friendly Resume, with tried and tested formats which get you hired",
      "Naukri upgrade to maximize job opportunities with skills",
      "LinkedIn upgrade to maximize job opportunities with skills",
      "Multiple professional format options",
      "Agile and Scrum terminology aligned to hiring expectations",
      "Typical delivery within one business day",
    ],
    trustLine: "Resume + Naukri + LinkedIn · fast delivery",
    finalCtaTitle: "Ready for a stronger resume, Naukri, and LinkedIn?",
  };
}

export function getOfferPageExtras(
  code: string,
  certificationName?: string,
  opts?: { currency?: string | null; geo?: string | null },
): OfferPageExtras | null {
  if (code === SSM_OFFER_CODE) return SSM_EXTRAS;
  if (code === CSM_OFFER_CODE) return CSM_EXTRAS;
  if (code === RTE_OFFER_CODE) return RTE_EXTRAS;
  if (code === PSM_II_OFFER_CODE) return PSM_II_EXTRAS;
  if (code === MENTORSHIP_OFFER_CODE || code === MENTORSHIP_CANONICAL_CODE) return MENTORSHIP_EXTRAS;
  if (code === MOCK_INTERVIEW_OFFER_CODE || code === MOCK_INTERVIEW_SLUG) {
    return MOCK_INTERVIEW_EXTRAS;
  }
  if (
    code === POWER_RESUME_OFFER_CODE ||
    code === POWER_RESUME_SLUG ||
    code === POWER_RESUME_LEGACY_SLUG
  ) {
    return powerResumeExtrasForRegion(opts);
  }
  if (SAFE_CERT_CODES.has(code)) {
    return genericCertExtras(certificationName ?? "SAFe® certification");
  }
  return null;
}

export function isRichOfferLayout(code: string): boolean {
  return getOfferPageExtras(code) != null;
}
