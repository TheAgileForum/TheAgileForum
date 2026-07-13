import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { ResourcesPageShell } from "../../components/forum/ResourcesPageShell";
import { FORUM_INK, FORUM_TEAL } from "../../lib/forum-brand";
import { RESOURCE_SECTIONS, resourcePath } from "./resources/resources-sections";

export function ResourcesPage() {
  return (
    <ResourcesPageShell
      title="Resources"
      summary="Guides, playbooks, and reference material for agile practitioners — organized so you can go deep on the topics that matter for your next role."
    >
      <Grid container spacing={2}>
        {RESOURCE_SECTIONS.map((section) => (
          <Grid key={section.slug} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderColor: "divider",
                transition: "border-color 0.2s, box-shadow 0.2s",
                "&:hover": {
                  borderColor: FORUM_TEAL,
                  boxShadow: "0 4px 20px rgba(15, 159, 143, 0.12)",
                },
              }}
            >
              <CardActionArea
                component={RouterLink}
                to={resourcePath(section.slug)}
                sx={{ height: "100%", alignItems: "stretch" }}
              >
                <CardContent sx={{ height: "100%" }}>
                  <Stack spacing={1.5} sx={{ height: "100%" }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        color: FORUM_INK,
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontWeight: 560,
                        fontSize: { xs: "1.1rem", sm: "1.15rem" },
                        lineHeight: 1.3,
                      }}
                    >
                      {section.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ flex: 1, lineHeight: 1.6 }}>
                      {section.summary}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ color: FORUM_TEAL, pt: 0.5, alignItems: "center" }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: "0.02em" }}>
                        Explore
                      </Typography>
                      <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </ResourcesPageShell>
  );
}
