export type UpcomingWebinar = {
  id: string;
  title: string;
  dateLabel: string;
  duration: string;
  audience: string;
  summary: string;
  registerUrl: string;
};

export type PastRecording = {
  id: string;
  title: string;
  dateLabel: string;
  duration: string;
  summary: string;
  recordingUrl: string;
};

export const UPCOMING_WEBINARS: UpcomingWebinar[] = [
  {
    id: "po-backlog-mastery",
    title: "PO Backlog Mastery",
    dateLabel: "Thu, 24 Jul 2026 · 7:00 PM IST",
    duration: "45 min",
    audience: "Product Owners",
    summary: "Prioritize with confidence, write crisp backlog items, and align stakeholders without endless refinement meetings.",
    registerUrl: "https://www.meetup.com/the-agile-forum/events/",
  },
  {
    id: "sm-facilitation-lab",
    title: "Scrum Master Facilitation Lab",
    dateLabel: "Wed, 6 Aug 2026 · 6:30 PM IST",
    duration: "60 min",
    audience: "Scrum Masters",
    summary: "Practice facilitation patterns for sprint planning, retros, and conflict — with live scenarios from the community.",
    registerUrl: "https://www.meetup.com/the-agile-forum/events/",
  },
  {
    id: "agile-leadership-roundtable",
    title: "Agile Leadership Roundtable",
    dateLabel: "Tue, 19 Aug 2026 · 8:00 PM IST",
    duration: "50 min",
    audience: "Leaders & coaches",
    summary: "Discuss scaling delivery, coaching managers, and building psychological safety across distributed teams.",
    registerUrl: "https://www.meetup.com/the-agile-forum/events/",
  },
];

export const PAST_RECORDINGS: PastRecording[] = [
  {
    id: "intro-product-ownership",
    title: "Introduction to Product Ownership",
    dateLabel: "Recorded · Jun 2026",
    duration: "42 min",
    summary: "Foundations of the PO role, stakeholder mapping, and defining outcomes before writing user stories.",
    recordingUrl: "https://www.youtube.com/watch?v=placeholder-po-intro",
  },
  {
    id: "retros-that-work",
    title: "Sprint Retrospectives That Work",
    dateLabel: "Recorded · May 2026",
    duration: "38 min",
    summary: "Formats that surface real improvement actions — and how to follow through when the team is remote.",
    recordingUrl: "https://www.youtube.com/watch?v=placeholder-retro",
  },
  {
    id: "scaling-without-drama",
    title: "Scaling Agile Without the Drama",
    dateLabel: "Recorded · Apr 2026",
    duration: "55 min",
    summary: "When to add ceremonies, when to simplify, and how to keep teams autonomous as you grow.",
    recordingUrl: "https://www.youtube.com/watch?v=placeholder-scaling",
  },
];
