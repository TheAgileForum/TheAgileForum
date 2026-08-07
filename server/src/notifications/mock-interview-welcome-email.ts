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

/**
 * Founder-supplied public prep URLs (hardcoded defaults so links work without
 * Render env vars). Per-file env keys still override when set.
 */
export const MOCK_INTERVIEW_KNOWN_LINKS = {
  scrumTopicsXlsx:
    "https://1drv.ms/x/s!Ard0cF-GOR3Esx700Rpz1gJSltbQ?e=8rjGFo",
  scrumGuidePdf:
    "https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf",
  interviewQuestionsFolder:
    "https://1drv.ms/f/s!Ard0cF-GOR3ErglcUZ4xiPj4khvz?e=yfDwIy",
  smSituationalPdf:
    "https://1drv.ms/b/s!Ard0cF-GOR3EsFTyJLlloW1XSeK4?e=Phq0bL",
  agileScrumQaDocx:
    "https://1drv.ms/w/s!Ard0cF-GOR3EswSSNshnSS_0ATtu?e=sZ99Z6",
  safeInterviewDocx:
    "https://1drv.ms/w/s!Ard0cF-GOR3EtX5smsju6ULpjIMV?e=Wi5EPb",
  scaledAgileQuestions:
    "https://1drv.ms/w/c/c41d39865f7074b7/IQCiGk4r2uNWS78VOeNvJgq_AR3JIcj8LpsGbrd2zaa_nTE?e=kMBKMM",
  calendlyBookSessions: "https://calendly.com/coach_Dhirender_Verma",
} as const;

/**
 * Prep material labels. Defaults come from MOCK_INTERVIEW_KNOWN_LINKS;
 * env vars override when set.
 *
 * Env vars (optional overrides):
 * - MOCK_INTERVIEW_RESOURCES_FOLDER_URL — fallback shared folder if a file URL is missing
 * - MOCK_INTERVIEW_RESOURCE_SCRUM_TOPICS_URL
 * - MOCK_INTERVIEW_RESOURCE_INTERVIEW_QUESTIONS_URL
 * - MOCK_INTERVIEW_RESOURCE_SM_SITUATIONAL_URL
 * - MOCK_INTERVIEW_RESOURCE_AGILE_SCRUM_QA_URL
 * - MOCK_INTERVIEW_RESOURCE_SAFE_QA_DOC_URL
 * - MOCK_INTERVIEW_RESOURCE_SAFE_QA_ONEDRIVE_URL
 * - MOCK_INTERVIEW_CALENDLY_URL
 */
export type MockInterviewResource = {
  id: string;
  label: string;
  /** Env var for a direct file/folder link override. */
  envKey?: string;
  /** Hard-coded public URL default. */
  fixedUrl?: string;
};

export const MOCK_INTERVIEW_RESOURCES: MockInterviewResource[] = [
  {
    id: "scrum-topics",
    label: "Scrum Master Plan -Topics.xlsx",
    envKey: "MOCK_INTERVIEW_RESOURCE_SCRUM_TOPICS_URL",
    fixedUrl: MOCK_INTERVIEW_KNOWN_LINKS.scrumTopicsXlsx,
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
    fixedUrl: MOCK_INTERVIEW_KNOWN_LINKS.interviewQuestionsFolder,
  },
  {
    id: "sm-situational",
    label: "SM Situational Questions.pdf",
    envKey: "MOCK_INTERVIEW_RESOURCE_SM_SITUATIONAL_URL",
    fixedUrl: MOCK_INTERVIEW_KNOWN_LINKS.smSituationalPdf,
  },
  {
    id: "agile-scrum-qa",
    label: "Agile_Scrum Interview questions_Answers.docx",
    envKey: "MOCK_INTERVIEW_RESOURCE_AGILE_SCRUM_QA_URL",
    fixedUrl: MOCK_INTERVIEW_KNOWN_LINKS.agileScrumQaDocx,
  },
  {
    id: "safe-qa-doc",
    label: "SAfe Interview Questions.docx",
    envKey: "MOCK_INTERVIEW_RESOURCE_SAFE_QA_DOC_URL",
    fixedUrl: MOCK_INTERVIEW_KNOWN_LINKS.safeInterviewDocx,
  },
  {
    id: "safe-qa-onedrive",
    label: "Scaled agile questions",
    envKey: "MOCK_INTERVIEW_RESOURCE_SAFE_QA_ONEDRIVE_URL",
    fixedUrl: MOCK_INTERVIEW_KNOWN_LINKS.scaledAgileQuestions,
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
    // Env override wins over hardcoded default so ops can rotate links without redeploy.
    const direct =
      (resource.envKey ? env[resource.envKey]?.trim() || null : null) ||
      resource.fixedUrl?.trim() ||
      null;
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

export function resolveMockInterviewCalendlyUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return (
    env.MOCK_INTERVIEW_CALENDLY_URL?.trim() ||
    MOCK_INTERVIEW_KNOWN_LINKS.calendlyBookSessions
  );
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
  const calendlyUrl = resolveMockInterviewCalendlyUrl();

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

  <h2 style="font-size:16px;margin:24px 0 8px;">Pre-requisite:-</h2>
  <ol style="padding-left:20px;margin:0 0 16px;">
    <li>Deep understanding of topics mentioned here:- ${link("scrum-topics")}</li>
    <li>Deep understanding of scrum Guide 2020:- ${link("scrum-guide")}</li>
    <li>Practical implementation knowledge of the scrum, kanban, XP, SAFe etc.</li>
    <li>Examples to support the work and experience mentioned in the resume.</li>
  </ol>

  <h2 style="font-size:16px;margin:24px 0 8px;">Preparation:-</h2>
  <ol style="padding-left:20px;margin:0 0 16px;">
    <li>Prepare all topics mentioned in upper Pre-requisite section.</li>
    <li>Read/re-write Answers of All questions and answers mentioned in : ${link("interview-questions")}</li>
    <li>Write all answers to the questions present in: ${link("sm-situational")}</li>
    <li>Read All questions and answers mentioned in : ${link("agile-scrum-qa")}</li>
    <li>Go through SAFe interview questions:
      <ul style="margin:8px 0 0;padding-left:20px;">
        <li>${link("safe-qa-doc")}</li>
        <li>${link("safe-qa-onedrive")}</li>
      </ul>
    </li>
  </ol>

  <p>Please feel free to reach out to me in case you need any more information from me.</p>
  <p>After your preparation we will be have 1:1 interview</p>
  <p>Please Book your sessions via link: <a href="${escapeHtml(calendlyUrl)}">${escapeHtml(calendlyUrl)}</a></p>

  <p style="margin-top:24px;color:#444;font-size:14px;">
    Order <strong>${escapeHtml(input.orderNumber)}</strong><br/>
    ${escapeHtml(input.itemSummary)}
  </p>
  <p style="color:#666;font-size:13px;">— The Agile Forum · Coach Dhirender Verma</p>
</div>
`.trim();
}
