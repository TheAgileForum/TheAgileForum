import { describe, expect, it } from "vitest";
import {
  buildMockInterviewGreeting,
  buildMockInterviewWelcomeHtml,
  isMockInterviewOfferingCode,
  listMissingMockInterviewResourceUrls,
  MOCK_INTERVIEW_KNOWN_LINKS,
  MOCK_INTERVIEW_WELCOME_SUBJECT,
  orderIncludesMockInterview,
  resolveMockInterviewResources,
} from "./mock-interview-welcome-email.js";

describe("mock-interview-welcome-email", () => {
  it("exports a clear welcome subject", () => {
    expect(MOCK_INTERVIEW_WELCOME_SUBJECT).toMatch(/Mock Interview/i);
  });

  it("recognizes canonical and alias Mock Interview offering codes", () => {
    expect(isMockInterviewOfferingCode("service-mock-interview-sm")).toBe(true);
    expect(
      isMockInterviewOfferingCode("mock-interview-series-with-interview-preparation"),
    ).toBe(true);
    expect(isMockInterviewOfferingCode("service-mock-interview-pm")).toBe(true);
    expect(isMockInterviewOfferingCode("course-agile-fundamentals")).toBe(false);
  });

  it("detects Mock Interview lines in an order", () => {
    expect(
      orderIncludesMockInterview([
        { offeringCode: "course-agile-fundamentals" },
        { offeringCode: "service-mock-interview-sm" },
      ]),
    ).toBe(true);
    expect(
      orderIncludesMockInterview([{ offeringCode: "exam-practice-free" }]),
    ).toBe(false);
  });

  it("personalizes greeting from displayName", () => {
    expect(buildMockInterviewGreeting("Priya")).toBe("Hi Priya,");
    expect(buildMockInterviewGreeting("  ")).toBe("Hi,");
    expect(buildMockInterviewGreeting(null)).toBe("Hi,");
  });

  it("builds HTML with known Scrum Guide and OneDrive links", () => {
    const html = buildMockInterviewWelcomeHtml({
      displayName: "Priya",
      orderNumber: "ORD-MI-1",
      itemSummary: "Mock Interview (1 × USD 249.00)",
    });

    expect(html).toContain("Hi Priya,");
    expect(html).toContain("Congratulations on the enrolment");
    expect(html).toContain("Scrum Master 1:1 Mock Interview");
    expect(html).toContain(MOCK_INTERVIEW_KNOWN_LINKS.scrumGuidePdf);
    expect(html).toContain(MOCK_INTERVIEW_KNOWN_LINKS.safeInterviewOnedrive);
    expect(html).toContain("ORD-MI-1");
    expect(html).toContain("link forthcoming");
  });

  it("escapes display names in HTML", () => {
    const html = buildMockInterviewWelcomeHtml({
      displayName: '<script>alert(1)</script>',
      orderNumber: "ORD-X",
      itemSummary: "a & b",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("a &amp; b");
  });

  it("lists missing resource URLs until founder supplies them", () => {
    const missing = listMissingMockInterviewResourceUrls({});
    expect(missing).toEqual(
      expect.arrayContaining([
        "Scrum Master Plan -Topics.xlsx",
        "Interview Questions",
        "SM Situational Questions.pdf",
        "Agile_Scrum Interview questions_Answers.docx",
        "SAfe Interview Questions.docx",
      ]),
    );
    expect(missing).not.toContain("Scrum Guide 2020 (PDF)");
  });

  it("uses shared folder URL when individual file URLs are unset", () => {
    const resolved = resolveMockInterviewResources({
      MOCK_INTERVIEW_RESOURCES_FOLDER_URL: "https://1drv.ms/f/example-folder",
    });
    const topics = resolved.find((r) => r.id === "scrum-topics");
    expect(topics?.url).toBe("https://1drv.ms/f/example-folder");
    expect(topics?.viaFolder).toBe(true);

    const guide = resolved.find((r) => r.id === "scrum-guide");
    expect(guide?.url).toBe(MOCK_INTERVIEW_KNOWN_LINKS.scrumGuidePdf);
    expect(guide?.viaFolder).toBe(false);
  });

  it("prefers per-file env URL over shared folder", () => {
    const resolved = resolveMockInterviewResources({
      MOCK_INTERVIEW_RESOURCES_FOLDER_URL: "https://1drv.ms/f/example-folder",
      MOCK_INTERVIEW_RESOURCE_SCRUM_TOPICS_URL: "https://1drv.ms/x/topics-file",
    });
    const topics = resolved.find((r) => r.id === "scrum-topics");
    expect(topics?.url).toBe("https://1drv.ms/x/topics-file");
    expect(topics?.viaFolder).toBe(false);
  });
});
