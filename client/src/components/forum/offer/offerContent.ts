/** Shared shell + per-offer extras for rich offer detail pages. */

export const OFFER_INK = "#0a1628";
export const OFFER_INK_SOFT = "#12233a";
export const OFFER_PAPER = "#f3f6f9";
export const OFFER_ACCENT = "#0f9f8f";
export const OFFER_ACCENT_DEEP = "#0b7a6e";
export const OFFER_MUTED = "#5b6b7c";

export const SSM_OFFER_CODE = "safe-scrum-master-certification-training";
export const MENTORSHIP_OFFER_CODE = "course-agile-fundamentals";
export const MENTORSHIP_CANONICAL_CODE = "scrum-master-mentorship-masterclass";

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
  examGuidelines?: { domains: ExamDomain[]; footnote: string; sourceUrl: string };
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
  },
  brochureMailto:
    "mailto:contact@theagileforum.com?subject=SSM%20Course%20Content%20%26%20Brochure",
  corporateMailto:
    "mailto:contact@theagileforum.com?subject=Corporate%20SAFe%20SSM%20Training",
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
  "safe-leading-safe",
  "safe-product-owner-product-manager-certification-training",
  "safe-agilist-leading-safe-certification-training",
]);

export function getOfferPageExtras(code: string, certificationName?: string): OfferPageExtras | null {
  if (code === SSM_OFFER_CODE) return SSM_EXTRAS;
  if (code === MENTORSHIP_OFFER_CODE || code === MENTORSHIP_CANONICAL_CODE) return MENTORSHIP_EXTRAS;
  if (SAFE_CERT_CODES.has(code)) {
    return genericCertExtras(certificationName ?? "SAFe® certification");
  }
  return null;
}

export function isRichOfferLayout(code: string): boolean {
  return getOfferPageExtras(code) != null;
}
