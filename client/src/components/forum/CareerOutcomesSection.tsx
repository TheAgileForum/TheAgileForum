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
    mobileValue: "1000+",
    label: "Career Advanced",
    shortLabel: "Careers",
    icon: EmojiEventsIcon,
    /** Mobile: outer corners — keep clear of JOB OFFER / face. */
    mobilePosition: { top: "3%", left: "4px" },
    desktopPosition: { top: "6%", left: "4%" },
  },
  {
    id: "max-hike",
    value: "UPTO 175%",
    mobileValue: "175%",
    label: "Salary Hike",
    shortLabel: "Max hike",
    icon: RocketLaunchIcon,
    mobilePosition: { top: "3%", right: "4px" },
    desktopPosition: { top: "6%", right: "4%" },
  },
  {
    id: "avg-hike",
    value: "65%",
    mobileValue: "65%",
    label: "Avg Salary Hike",
    shortLabel: "Avg hike",
    icon: ShowChartIcon,
    mobilePosition: { bottom: "3%", left: "4px" },
    desktopPosition: { bottom: "14%", left: "4%" },
  },
  {
    id: "pass-rate",
    value: "100%",
    mobileValue: "100%",
    label: "Passing Success Rate",
    shortLabel: "Pass rate",
    icon: VerifiedIcon,
    mobilePosition: { bottom: "3%", right: "4px" },
    desktopPosition: { bottom: "14%", right: "4%" },
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
  size: "mobile" | "desktop";
}) {
  const isMobile = size === "mobile";

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
          boxShadow: isMobile
            ? "0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: isMobile ? "-5%" : "-6%",
          borderRadius: "50%",
          background:
            "repeating-conic-gradient(from 0deg, rgba(15,159,143,0.35) 0deg 8deg, transparent 8deg 16deg)",
          opacity: isMobile ? 0.35 : 0.45,
          filter: "blur(0.5px)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          px: isMobile ? 0.6 : { md: 1.25 },
          boxSizing: "border-box",
          minWidth: 0,
          textAlign: "center",
        }}
      >
        <Icon
          sx={{
            fontSize: isMobile ? 14 : { md: 26 },
            color: "#f5c842",
            mb: isMobile ? 0.1 : 0.35,
          }}
          aria-hidden
        />
        <Typography
          sx={{
            m: 0,
            fontWeight: 800,
            fontSize: isMobile ? "0.52rem" : { md: "0.78rem" },
            letterSpacing: "0.02em",
            lineHeight: 1.1,
            textTransform: "uppercase",
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            m: 0,
            mt: isMobile ? 0.1 : 0.25,
            fontSize: isMobile ? "0.42rem" : { md: "0.62rem" },
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.15,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

/** Desktop overlays at md+ — larger discs on the sides of the hero. */
function DesktopOverlayBadge({
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
      <BadgeDisc value={value} label={label} Icon={Icon} size="desktop" />
    </Box>
  );
}

/**
 * Mobile overlays (xs–sm): small corner discs on the hero image.
 * Tuned so pairs never intersect and the JOB OFFER envelope stays clear.
 */
function MobileOverlayBadge({
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
        display: { xs: "block", md: "none" },
        position: "absolute",
        ...position,
        zIndex: 2,
        width: { xs: 52, sm: 60 },
        pointerEvents: "none",
      }}
    >
      <BadgeDisc value={value} label={label} Icon={Icon} size="mobile" />
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
        component="figure"
        aria-label="Career outcome statistics"
        sx={{
          position: "relative",
          maxWidth: 980,
          width: "100%",
          mx: "auto",
          mt: 0,
          mb: { xs: 2.5, md: 3 },
          overflow: { xs: "hidden", md: "visible" },
        }}
      >
        {STAT_BADGES.map(({ icon: Icon, ...badge }) => (
          <DesktopOverlayBadge
            key={`desktop-${badge.id}`}
            Icon={Icon}
            value={badge.value}
            label={badge.label}
            position={badge.desktopPosition}
          />
        ))}

        {STAT_BADGES.map(({ icon: Icon, ...badge }) => (
          <MobileOverlayBadge
            key={`mobile-${badge.id}`}
            Icon={Icon}
            value={badge.mobileValue}
            label={badge.shortLabel}
            position={badge.mobilePosition}
          />
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
