import { resolveOfferingCode } from "../catalog/catalog-seed-data.js";

/** Canonical Mock Interview offering code. */
export const MOCK_INTERVIEW_OFFERING_CODE = "service-mock-interview-sm";

/**
 * Known public aliases that resolve to the Mock Interview SKU
 * (see OFFERING_CODE_ALIASES + code prefix).
 */
const MOCK_INTERVIEW_CODE_PREFIX = "service-mock-interview";

export const MOCK_INTERVIEW_WELCOME_SUBJECT =
  "Welcome — Scrum Master 1:1 Mock Interview";

/** Public URLs that are already known (Scrum Guide + founder OneDrive SAFe Q&A). */
export const MOCK_INTERVIEW_KNOWN_LINKS = {
  scrumGuidePdf:
    "https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf",
  safeInterviewOnedrive:
    "https://1drv.ms/w/c/c41d39865f7074b7/IQCiGk4r2uNWS78VOeNvJgq_AR3JIcj8LpsGbrd2zaa_nTE?e=kMBKMM",
} as const;

/**
 * Prep material labels. URLs may come from env overrides or remain unset
 * until the founder supplies public Drive/OneDrive links.
 *
 * Env vars (optional):
 * - MOCK_INTERVIEW_RESOURCES_FOLDER_URL — shared folder for all prep files
 * - MOCK_INTERVIEW_RESOURCE_SCRUM_TOPICS_URL
 * - MOCK_INTERVIEW_RESOURCE_INTERVIEW_QUESTIONS_URL
 * - MOCK_INTERVIEW_RESOURCE_SM_SITUATIONAL_URL
 * - MOCK_INTERVIEW_RESOURCE_AGILE_SCRUM_QA_URL
 * - MOCK_INTERVIEW_RESOURCE_SAFE_QA_DOC_URL
 */
export type MockInterviewResource = {
  id: string;
  label: string;
  /** Env var for a direct file/folder link; empty = founder must supply. */
  envKey?: string;
  /** Hard-coded public URL when known. */
  fixedUrl?: string;
};

export const MOCK_INTERVIEW_RESOURCES: MockInterviewResource[] = [
  {
    id: "scrum-topics",
    label: "Scrum Master Plan -Topics.xlsx",
    envKey: "MOCK_INTERVIEW_RESOURCE_SCRUM_TOPICS_URL",
  },
  {
    id: "scrum-guide",
    label: "Scrum Guide 2020 (PDF)",
    fixedUrl: MOCK_INTERVIEW_KNOWN_LINKS.scrumGuidePdf,
  },
  {
    id: "interview-questions",
    label: "Interview Questions",
    envKey: "MOCK_INTERVIEW_RESOURCE_INTERVIEW_QUESTIONS_URL",
  },
  {
    id: "sm-situational",
    label: "SM Situational Questions.pdf",
    envKey: "MOCK_INTERVIEW_RESOURCE_SM_SITUATIONAL_URL",
  },
  {
    id: "agile-scrum-qa",
    label: "Agile_Scrum Interview questions_Answers.docx",
    envKey: "MOCK_INTERVIEW_RESOURCE_AGILE_SCRUM_QA_URL",
  },
  {
    id: "safe-qa-doc",
    label: "SAfe Interview Questions.docx",
    envKey: "MOCK_INTERVIEW_RESOURCE_SAFE_QA_DOC_URL",
  },
  {
    id: "safe-qa-onedrive",
    label: "SAFe interview questions (OneDrive)",
    fixedUrl: MOCK_INTERVIEW_KNOWN_LINKS.safeInterviewOnedrive,
  },
];

export function isMockInterviewOfferingCode(code: string): boolean {
  const resolved = resolveOfferingCode(code);
  return (
    resolved === MOCK_INTERVIEW_OFFERING_CODE ||
    resolved.startsWith(MOCK_INTERVIEW_CODE_PREFIX) ||
    code === MOCK_INTERVIEW_OFFERING_CODE ||
    code.startsWith(MOCK_INTERVIEW_CODE_PREFIX)
  );
}

export function orderIncludesMockInterview(
  items: Array<{ offeringCode: string }>,
): boolean {
  return items.some((item) => isMockInterviewOfferingCode(item.offeringCode));
}

export type ResolvedMockInterviewResource = {
  id: string;
  label: string;
  url: string | null;
  /** True when only the shared folder URL is available (no file-specific link). */
  viaFolder: boolean;
};

export function resolveMockInterviewResources(
  env: NodeJS.ProcessEnv = process.env,
): ResolvedMockInterviewResource[] {
  const sharedFolder = env.MOCK_INTERVIEW_RESOURCES_FOLDER_URL?.trim() || null;

  return MOCK_INTERVIEW_RESOURCES.map((resource) => {
    const direct =
      resource.fixedUrl?.trim() ||
      (resource.envKey ? env[resource.envKey]?.trim() || null : null);
    if (direct) {
      return { id: resource.id, label: resource.label, url: direct, viaFolder: false };
    }
    if (sharedFolder) {
      return {
        id: resource.id,
        label: resource.label,
        url: sharedFolder,
        viaFolder: true,
      };
    }
    return { id: resource.id, label: resource.label, url: null, viaFolder: false };
  });
}

/** Resources still needing a founder-supplied public URL (no fixed/env/folder). */
export function listMissingMockInterviewResourceUrls(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  return resolveMockInterviewResources(env)
    .filter((r) => !r.url)
    .map((r) => r.label);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resourceAnchor(label: string, url: string | null, viaFolder: boolean): string {
  const safeLabel = escapeHtml(label);
  if (!url) {
    return `<strong>${safeLabel}</strong> <em>(link forthcoming — coach will share)</em>`;
  }
  const safeUrl = escapeHtml(url);
  const suffix = viaFolder
    ? ` <em>(shared prep folder)</em>`
    : "";
  return `<a href="${safeUrl}">${safeLabel}</a>${suffix}`;
}

export function buildMockInterviewGreeting(displayName: string | null | undefined): string {
  const name = displayName?.trim();
  if (name) return `Hi ${escapeHtml(name)},`;
  return "Hi,";
}

export function buildMockInterviewWelcomeHtml(input: {
  displayName?: string | null;
  orderNumber: string;
  itemSummary: string;
}): string {
  const resources = resolveMockInterviewResources();
  const byId = Object.fromEntries(resources.map((r) => [r.id, r]));

  const link = (id: string) => {
    const r = byId[id];
    return resourceAnchor(r?.label ?? id, r?.url ?? null, r?.viaFolder ?? false);
  };

  const greeting = buildMockInterviewGreeting(input.displayName);

  return `
<div style="font-family:Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:640px;">
  <p>${greeting}</p>
  <p>Greetings of the day, and hope you are keeping safe and well.</p>
  <p>Congratulations on the enrolment for the <strong>Scrum Master 1:1 Mock Interview</strong>.</p>

  <h2 style="font-size:16px;margin:24px 0 8px;">Pre-requisite</h2>
  <ul style="padding-left:20px;margin:0 0 16px;">
    <li>Deep understanding of topics mentioned here: ${link("scrum-topics")}</li>
    <li>Deep understanding of the Scrum Guide 2020: ${link("scrum-guide")}</li>
    <li>Practical implementation knowledge of Scrum, Kanban, XP, SAFe, etc.</li>
    <li>Examples to support the work and experience mentioned in your resume.</li>
  </ul>

  <h2 style="font-size:16px;margin:24px 0 8px;">Preparation</h2>
  <ul style="padding-left:20px;margin:0 0 16px;">
    <li>Prepare all topics mentioned in the Pre-requisite section above.</li>
    <li>Read / re-write answers for all questions and answers in: ${link("interview-questions")}</li>
    <li>Write all answers to the questions in: ${link("sm-situational")}</li>
    <li>Read all questions and answers in: ${link("agile-scrum-qa")}</li>
    <li>Go through SAFe interview questions: ${link("safe-qa-doc")} &amp; ${link("safe-qa-onedrive")}</li>
  </ul>

  <p style="margin-top:24px;color:#444;font-size:14px;">
    Order <strong>${escapeHtml(input.orderNumber)}</strong><br/>
    ${escapeHtml(input.itemSummary)}
  </p>
  <p style="color:#666;font-size:13px;">— The Agile Forum · Coach Dhirender Verma</p>
</div>
`.trim();
}
