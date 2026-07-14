import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import VerifiedIcon from "@mui/icons-material/Verified";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { trackEvent } from "../../lib/analytics";

const INK = "#0a1628";
const HERO_IMAGE = "/assets/career-outcomes-hero.png";
const CTA_PINK = "#e91e8c";

const STAT_BADGES = [
  {
    id: "career-advanced",
    value: "1000+",
    label: "Career Advanced",
    icon: EmojiEventsIcon,
    position: { top: "6%", left: "4%" },
  },
  {
    id: "max-hike",
    value: "UPTO 175%",
    label: "Salary Hike",
    icon: RocketLaunchIcon,
    position: { top: "6%", right: "4%" },
  },
  {
    id: "avg-hike",
    value: "65%",
    label: "Avg Salary Hike",
    icon: ShowChartIcon,
    position: { bottom: "14%", left: "4%" },
  },
  {
    id: "pass-rate",
    value: "100%",
    label: "Passing Success Rate",
    icon: VerifiedIcon,
    position: { bottom: "14%", right: "4%" },
  },
] as const;

function BadgeDisc({
  value,
  label,
  Icon,
  size,
}: {
  value: string;
  label: string;
  Icon: typeof EmojiEventsIcon;
  size: "overlay" | "grid";
}) {
  const isGrid = size === "grid";

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "1",
        display: "grid",
        placeItems: "center",
        color: "#fff",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.14), transparent 55%),
            linear-gradient(145deg, #1a2438 0%, ${INK} 55%, #050a12 100%)`,
          boxShadow: "0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: "-6%",
          borderRadius: "50%",
          background:
            "repeating-conic-gradient(from 0deg, rgba(15,159,143,0.35) 0deg 8deg, transparent 8deg 16deg)",
          opacity: 0.45,
          filter: "blur(0.5px)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          px: isGrid ? 1 : { sm: 1.1, md: 1.25 },
          boxSizing: "border-box",
          minWidth: 0,
          textAlign: "center",
        }}
      >
        <Icon
          sx={{
            fontSize: isGrid ? 18 : { sm: 22, md: 26 },
            color: "#f5c842",
            mb: isGrid ? 0.25 : 0.35,
          }}
          aria-hidden
        />
        <Typography
          sx={{
            m: 0,
            fontWeight: 800,
            fontSize: isGrid ? "0.62rem" : { sm: "0.68rem", md: "0.78rem" },
            letterSpacing: "0.03em",
            lineHeight: 1.15,
            textTransform: "uppercase",
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            m: 0,
            mt: isGrid ? 0.2 : 0.25,
            fontSize: isGrid ? "0.5rem" : { sm: "0.55rem", md: "0.62rem" },
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

/** Desktop/tablet overlays — hidden below `md` so they never collide with the JOB OFFER card. */
function OverlayStatBadge({
  value,
  label,
  Icon,
  position,
}: {
  value: string;
  label: string;
  Icon: typeof EmojiEventsIcon;
  position: Record<string, string>;
}) {
  return (
    <Box
      sx={{
        display: { xs: "none", md: "block" },
        position: "absolute",
        ...position,
        zIndex: 2,
        width: { md: 148 },
        maxWidth: "42%",
        pointerEvents: "none",
      }}
    >
      <BadgeDisc value={value} label={label} Icon={Icon} size="overlay" />
    </Box>
  );
}

/** Mobile-only compact metric strip under the hero image (no absolute overlays). */
function MobileStatsStrip() {
  return (
    <Box
      component="ul"
      aria-label="Career outcome statistics"
      sx={{
        display: { xs: "grid", md: "none" },
        gridTemplateColumns: "1fr 1fr",
        gap: { xs: 1.5, sm: 2 },
        listStyle: "none",
        m: 0,
        mt: { xs: 2, sm: 2.5 },
        p: 0,
        maxWidth: 360,
        mx: "auto",
        width: "100%",
      }}
    >
      {STAT_BADGES.map(({ id, value, label, icon: Icon }) => (
        <Box
          component="li"
          key={id}
          sx={{
            width: "100%",
            maxWidth: { xs: 88, sm: 100 },
            justifySelf: "center",
          }}
        >
          <BadgeDisc value={value} label={label} Icon={Icon} size="grid" />
        </Box>
      ))}
    </Box>
  );
}

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <Box
      component="section"
      id="career-outcomes"
      aria-labelledby="career-outcomes-heading"
      sx={{
        bgcolor: "#f7f9fc",
        py: { xs: 6, md: 9 },
        px: { xs: 2.5, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>{children}</Box>
    </Box>
  );
}

export function CareerOutcomesSection() {
  return (
    <SectionShell>
      <Typography
        id="career-outcomes-heading"
        component="h2"
        sx={{
          m: 0,
          mb: { xs: 3, md: 4.5 },
          textAlign: "center",
          fontFamily: '"Sora", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: { xs: "1.2rem", sm: "1.75rem", md: "2.15rem" },
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          color: "#1a4a7a",
          textWrap: "balance",
          overflowWrap: "anywhere",
          maxWidth: 920,
          mx: "auto",
          px: { xs: 0.5, sm: 0 },
        }}
      >
        Become a AI Scrum Master, Agile Project Manager &amp; PO with job-focused mentorship, AI masterclass &amp;
        certifications
      </Typography>

      <Box
        sx={{
          position: "relative",
          maxWidth: 980,
          mx: "auto",
          mb: { xs: 2.5, md: 3 },
          overflow: { xs: "hidden", md: "visible" },
          width: "100%",
        }}
      >
        {STAT_BADGES.map(({ icon: Icon, ...badge }) => (
          <OverlayStatBadge key={badge.id} Icon={Icon} {...badge} />
        ))}

        <Box
          component="img"
          src={HERO_IMAGE}
          alt="Graduate celebrating a job offer — Placement powered by The Agile Forum"
          loading="lazy"
          sx={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: { xs: 2, md: 3 },
            boxShadow: "0 20px 50px rgba(10, 22, 40, 0.18)",
          }}
        />

        <MobileStatsStrip />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "center",
          gap: { xs: 2, sm: 2.5 },
          maxWidth: 980,
          mx: "auto",
          px: { xs: 2.5, sm: 3.5 },
          py: { xs: 2.5, sm: 2.75 },
          bgcolor: INK,
          borderRadius: { xs: 2, md: 999 },
          boxShadow: "0 16px 40px rgba(10, 22, 40, 0.2)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flex: 1,
            justifyContent: { xs: "center", sm: "flex-start" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <ThumbUpIcon
            sx={{
              fontSize: { xs: 28, md: 32 },
              color: "#f5c842",
              flexShrink: 0,
            }}
            aria-hidden
          />
          <Typography
            sx={{
              m: 0,
              color: "#fff",
              fontWeight: 700,
              fontSize: { xs: "0.9rem", sm: "1.05rem", md: "1.12rem" },
              lineHeight: 1.35,
              textWrap: "balance",
              overflowWrap: "anywhere",
            }}
          >
            Start Your IT Career, Land Your high paying IT Dream Job!
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to="/testimonials"
          variant="contained"
          size="large"
          onClick={() => trackEvent("home_career_outcomes_testimonials_click", { source: "career_outcomes_cta" })}
          sx={{
            flexShrink: 0,
            bgcolor: CTA_PINK,
            color: "#fff",
            fontWeight: 800,
            fontSize: { xs: "0.82rem", md: "0.9rem" },
            letterSpacing: "0.04em",
            textTransform: "none",
            px: { xs: 3, md: 3.5 },
            py: 1.5,
            alignSelf: { xs: "center", sm: "auto" },
            boxShadow: "0 10px 28px rgba(233, 30, 140, 0.35)",
            "&:hover": {
              bgcolor: "#ff2da0",
              boxShadow: "0 14px 36px rgba(233, 30, 140, 0.45)",
              transform: "translateY(-1px)",
            },
          }}
        >
          Check Testimonials
        </Button>
      </Box>
    </SectionShell>
  );
}
