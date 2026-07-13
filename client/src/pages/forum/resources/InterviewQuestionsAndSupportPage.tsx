import { ResourceSectionPage } from "./ResourceSectionPage";
import { RESOURCE_SECTIONS } from "./resources-sections";

const section = RESOURCE_SECTIONS.find((s) => s.slug === "interview-questions-and-support")!;

export function InterviewQuestionsAndSupportPage() {
  return <ResourceSectionPage section={section} />;
}
