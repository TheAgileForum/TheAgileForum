import { describe, expect, it } from "vitest";
import {
  buildMockInterviewGreeting,
  buildMockInterviewWelcomeHtml,
  listMissingMockInterviewResourceUrls,
  MOCK_INTERVIEW_KNOWN_LINKS,
  resolveMockInterviewCalendlyUrl,
  resolveMockInterviewResources,
} from "./mock-interview-welcome-email.js";

describe("mock-interview-welcome-email", () => {
  it("greets with name when present, otherwise Hi,", () => {
    expect(buildMockInterviewGreeting("Alex")).toBe("Hi Alex,");
    expect(buildMockInterviewGreeting("  ")).toBe("Hi,");
    expect(buildMockInterviewGreeting(null)).toBe("Hi,");
  });

  it("resolves all prep resources from hardcoded defaults with no env", () => {
    const resources = resolveMockInterviewResources({});
    expect(listMissingMockInterviewResourceUrls({})).toEqual([]);
    expect(resources).toHaveLength(7);
    expect(resources.every((r) => r.url && !r.viaFolder)).toBe(true);

    const byId = Object.fromEntries(resources.map((r) => [r.id, r]));
    expect(byId["scrum-topics"]?.url).toBe(MOCK_INTERVIEW_KNOWN_LINKS.scrumTopicsXlsx);
    expect(byId["scrum-guide"]?.url).toBe(MOCK_INTERVIEW_KNOWN_LINKS.scrumGuidePdf);
    expect(byId["interview-questions"]?.url).toBe(
      MOCK_INTERVIEW_KNOWN_LINKS.interviewQuestionsFolder,
    );
    expect(byId["sm-situational"]?.url).toBe(MOCK_INTERVIEW_KNOWN_LINKS.smSituationalPdf);
    expect(byId["agile-scrum-qa"]?.url).toBe(MOCK_INTERVIEW_KNOWN_LINKS.agileScrumQaDocx);
    expect(byId["safe-qa-doc"]?.url).toBe(MOCK_INTERVIEW_KNOWN_LINKS.safeInterviewDocx);
    expect(byId["safe-qa-onedrive"]?.url).toBe(
      MOCK_INTERVIEW_KNOWN_LINKS.scaledAgileQuestions,
    );
  });

  it("lets env override a hardcoded resource URL", () => {
    const override = "https://example.com/custom-topics.xlsx";
    const resources = resolveMockInterviewResources({
      MOCK_INTERVIEW_RESOURCE_SCRUM_TOPICS_URL: override,
    });
    expect(resources.find((r) => r.id === "scrum-topics")?.url).toBe(override);
  });

  it("includes founder copy, all resource hrefs, and calendly with no placeholders", () => {
    const html = buildMockInterviewWelcomeHtml({
      displayName: "Priya",
      orderNumber: "ORD-MI-1",
      itemSummary: "Mock Interview (1 × USD 249.00)",
    });

    expect(html).toContain("Hi Priya,");
    expect(html).toContain("Greetings of the day, and hope you are keeping safe and well.");
    expect(html).toContain("Congratulations on the enrolment for the");
    expect(html).toContain("Preparation:-");
    expect(html).not.toContain("Prepration");
    expect(html).toContain("Please feel free to reach out to me");
    expect(html).toContain("After your preparation we will be have 1:1 interview");
    expect(html).not.toContain("link forthcoming");

    for (const url of Object.values(MOCK_INTERVIEW_KNOWN_LINKS)) {
      expect(html).toContain(url);
    }
  });

  it("resolves calendly from env override", () => {
    expect(resolveMockInterviewCalendlyUrl({})).toBe(
      MOCK_INTERVIEW_KNOWN_LINKS.calendlyBookSessions,
    );
    expect(
      resolveMockInterviewCalendlyUrl({
        MOCK_INTERVIEW_CALENDLY_URL: "https://calendly.com/custom",
      }),
    ).toBe("https://calendly.com/custom");
  });
});
