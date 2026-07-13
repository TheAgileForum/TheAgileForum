import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { ResourcesPageShell } from "../../../components/forum/ResourcesPageShell";
import { FORUM_TEAL } from "../../../lib/forum-brand";
import { type ResourceSection } from "./resources-sections";

type ResourceSectionPageProps = {
  section: ResourceSection;
};

export function ResourceSectionPage({ section }: ResourceSectionPageProps) {
  return (
    <ResourcesPageShell
      title={section.title}
      summary={section.intro}
      breadcrumbs={[
        { label: "Resources", to: "/resources" },
        { label: section.title },
      ]}
    >
      <Stack spacing={2.5} sx={{ maxWidth: 720 }}>
        <Typography color="text.secondary">{section.summary}</Typography>

        <Box component="ul" sx={{ m: 0, pl: 2.5, color: "text.secondary" }}>
          {section.highlights.map((item) => (
            <Typography key={item} component="li" sx={{ mb: 1, lineHeight: 1.6 }}>
              {item}
            </Typography>
          ))}
        </Box>

        <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
          Full content for this section is being prepared. Explore trainings and certifications
          tailored to your goals, or start with an Assessment for a personalized path.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 0.5 }}>
          <Button
            component={RouterLink}
            to="/diagnosis/step-1"
            variant="contained"
            sx={{ alignSelf: "flex-start", bgcolor: FORUM_TEAL, "&:hover": { bgcolor: "#0b7a6e" } }}
          >
            Start Assessment →
          </Button>
          <Button
            component={RouterLink}
            to="/resources"
            variant="outlined"
            sx={{ alignSelf: "flex-start", borderColor: FORUM_TEAL, color: FORUM_TEAL }}
          >
            ← All resources
          </Button>
        </Stack>
      </Stack>
    </ResourcesPageShell>
  );
}
