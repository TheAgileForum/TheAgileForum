import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ResourcesPageShell } from "../../components/forum/ResourcesPageShell";
import { FORUM_INK, FORUM_TEAL } from "../../lib/forum-brand";
import { PAST_RECORDINGS, UPCOMING_WEBINARS } from "./webinars-data";

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Stack spacing={0.75}>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          color: FORUM_INK,
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 560,
          fontSize: { xs: "1.25rem", sm: "1.4rem" },
        }}
      >
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 640, lineHeight: 1.6 }}>
        {subtitle}
      </Typography>
    </Stack>
  );
}

export function WebinarsPage() {
  return (
    <ResourcesPageShell
      title="Webinars"
      summary="Live sessions and recorded talks for product owners, Scrum Masters, and leaders — join upcoming events or catch up on past recordings."
    >
      <Stack spacing={4}>
        <Stack spacing={2}>
          <SectionHeading
            title="Join upcoming webinars"
            subtitle="Reserve your spot for live community sessions. Registration links open in a new tab."
          />
          <Grid container spacing={2}>
            {UPCOMING_WEBINARS.map((webinar) => (
              <Grid key={webinar.id} size={{ xs: 12, md: 4 }}>
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
                  <CardContent sx={{ height: "100%" }}>
                    <Stack spacing={1.5} sx={{ height: "100%" }}>
                      <Chip
                        label="Upcoming"
                        size="small"
                        sx={{
                          alignSelf: "flex-start",
                          bgcolor: "rgba(15, 159, 143, 0.1)",
                          color: FORUM_TEAL,
                          fontWeight: 600,
                        }}
                      />
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          color: FORUM_INK,
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontWeight: 560,
                          fontSize: { xs: "1.05rem", sm: "1.1rem" },
                          lineHeight: 1.3,
                        }}
                      >
                        {webinar.title}
                      </Typography>
                      <Stack spacing={0.75}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {webinar.dateLabel}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <ScheduleOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {webinar.duration} · {webinar.audience}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Typography color="text.secondary" sx={{ flex: 1, lineHeight: 1.6, fontSize: "0.92rem" }}>
                        {webinar.summary}
                      </Typography>
                      <Button
                        component="a"
                        href={webinar.registerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        sx={{
                          alignSelf: "flex-start",
                          bgcolor: FORUM_TEAL,
                          "&:hover": { bgcolor: "#0b7a6e" },
                        }}
                      >
                        Register →
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>

        <Box
          component="hr"
          sx={{
            border: 0,
            borderTop: "1px solid",
            borderColor: "divider",
            my: 0,
          }}
        />

        <Stack spacing={2}>
          <SectionHeading
            title="Watch previous session recordings"
            subtitle="Catch up on past webinars and video sessions at your own pace."
          />
          <Grid container spacing={2}>
            {PAST_RECORDINGS.map((recording) => (
              <Grid key={recording.id} size={{ xs: 12, md: 4 }}>
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
                  <CardContent sx={{ height: "100%" }}>
                    <Stack spacing={1.5} sx={{ height: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 120,
                          borderRadius: 1,
                          bgcolor: "rgba(10, 22, 40, 0.04)",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 48, color: FORUM_TEAL, opacity: 0.85 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          color: FORUM_INK,
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontWeight: 560,
                          fontSize: { xs: "1.05rem", sm: "1.1rem" },
                          lineHeight: 1.3,
                        }}
                      >
                        {recording.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {recording.dateLabel} · {recording.duration}
                      </Typography>
                      <Typography color="text.secondary" sx={{ flex: 1, lineHeight: 1.6, fontSize: "0.92rem" }}>
                        {recording.summary}
                      </Typography>
                      <Button
                        component="a"
                        href={recording.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        startIcon={<PlayCircleOutlineOutlinedIcon />}
                        sx={{
                          alignSelf: "flex-start",
                          borderColor: FORUM_TEAL,
                          color: FORUM_TEAL,
                          "&:hover": { borderColor: "#0b7a6e", bgcolor: "rgba(15, 159, 143, 0.06)" },
                        }}
                      >
                        Watch recording
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </ResourcesPageShell>
  );
}
