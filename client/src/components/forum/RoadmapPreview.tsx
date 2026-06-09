import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { RoadmapMilestone } from "../../lib/forum-api";

const DOT_COLOR = {
  current: "primary.main",
  upcoming: "info.main",
  future: "grey.400",
} as const;

type RoadmapPreviewProps = {
  milestones: RoadmapMilestone[];
};

export function RoadmapPreview({ milestones }: RoadmapPreviewProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          4–8 week roadmap preview
        </Typography>
        <Stack spacing={2} component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {milestones.map((m) => (
            <Stack
              key={m.phase}
              component="li"
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "flex-start" }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: DOT_COLOR[m.status],
                  mt: 0.75,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {m.phase} · {m.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {m.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
