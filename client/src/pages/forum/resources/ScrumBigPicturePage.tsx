import { ResourceSectionPage } from "./ResourceSectionPage";
import { RESOURCE_SECTIONS } from "./resources-sections";

const section = RESOURCE_SECTIONS.find((s) => s.slug === "scrum-big-picture")!;

export function ScrumBigPicturePage() {
  return <ResourceSectionPage section={section} />;
}
