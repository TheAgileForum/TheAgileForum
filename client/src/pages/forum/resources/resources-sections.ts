export type ResourceSection = {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  highlights: string[];
};

export const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    slug: "interview-questions-and-support",
    title: "Interview Questions and Support",
    summary:
      "Role-specific interview prep, mock scenarios, and mentor support for Scrum and Agile roles.",
    intro:
      "Whether you are targeting your first Scrum Master role or stepping into a senior Agile coach position, this section brings together curated question banks, answer frameworks, and guidance on how to demonstrate real-world experience in interviews.",
    highlights: [
      "Scrum Master, Product Owner, and Agile Coach question sets",
      "Behavioral and situational prompts with mentor-backed talking points",
      "Mock interview support through trainings and community sessions",
    ],
  },
  {
    slug: "blogs",
    title: "Blogs",
    summary:
      "Practical articles on delivery, leadership, and career growth from practitioners in the field.",
    intro:
      "Short, actionable reads on topics that matter day to day — facilitation, stakeholder alignment, metrics that help teams, and lessons from real transformations. New posts will be added regularly.",
    highlights: [
      "Career paths in Agile and product leadership",
      "Team health, retrospectives, and continuous improvement",
      "Certification journeys explained without the hype",
    ],
  },
  {
    slug: "scrum-big-picture",
    title: "The Scrum Big Picture",
    summary:
      "A visual, plain-language map of Scrum roles, events, artifacts, and how they connect.",
    intro:
      "Scrum can feel fragmented when you learn it piece by piece. The Big Picture ties roles, accountabilities, events, and artifacts into one coherent view so you can explain Scrum confidently to teams and stakeholders.",
    highlights: [
      "How Product Goal, Sprint Goal, and Increment relate",
      "When each Scrum event creates clarity vs. when it drifts",
      "Common anti-patterns and healthier alternatives",
    ],
  },
];

export function resourcePath(slug: string) {
  return `/resources/${slug}`;
}
