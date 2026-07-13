import { ResourceSectionPage } from "./ResourceSectionPage";
import { RESOURCE_SECTIONS } from "./resources-sections";

const section = RESOURCE_SECTIONS.find((s) => s.slug === "blogs")!;

export function BlogsPage() {
  return <ResourceSectionPage section={section} />;
}
