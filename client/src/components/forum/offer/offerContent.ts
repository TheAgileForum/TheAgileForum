/** Shared shell + SSM-specific extras for certification offer detail pages. */

export const OFFER_INK = "#0a1628";
export const OFFER_INK_SOFT = "#12233a";
export const OFFER_PAPER = "#f3f6f9";
export const OFFER_ACCENT = "#0f9f8f";
export const OFFER_ACCENT_DEEP = "#0b7a6e";
export const OFFER_MUTED = "#5b6b7c";

export const SSM_OFFER_CODE = "safe-scrum-master-certification-training";

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { title: string; items: FaqItem[] };
export type CurriculumModule = { title: string; summary: string; bullets?: string[] };
export type ExamDomain = { domain: string; topics: string[] };
export type KeyBenefit = { title: string; detail: string };
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
  overviewTitle: string;
  overviewBody: string;
  overviewStats: Array<{ num: string; label: string }>;
  demand?: DemandCopy;
  videoUrl?: string;
  videoThumb?: string;
  videoCaption?: string;
  curriculum: CurriculumModule[];
  audience: Array<{ role: string; detail: string }>;
  certImageUrl?: string;
  certBullets?: string[];
  faqGroups: FaqGroup[];
  examGuidelines?: { domains: ExamDomain[]; footnote: string; sourceUrl: string };
  brochureMailto: string;
  corporateMailto: string;
};

const SSM_EXTRAS: OfferPageExtras = {
  rating: {
    score: "4.9",
    meta: "Average learner rating · live workshop cohorts",
  },
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
  overviewStats: [
    { num: "2 days", label: "Live weekend workshop · 16 hours" },
    { num: "PI simulation", label: "Full Planning Interval event practice" },
    { num: "100%", label: "Past-batch exam success rate (claimed)" },
  ],
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
  if (SAFE_CERT_CODES.has(code)) {
    return genericCertExtras(certificationName ?? "SAFe® certification");
  }
  return null;
}

export function isRichOfferLayout(code: string): boolean {
  return getOfferPageExtras(code) != null;
}
