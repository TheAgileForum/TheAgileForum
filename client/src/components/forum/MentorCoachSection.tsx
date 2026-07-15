import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { trackEvent } from "../../lib/analytics";

const ROYAL_BLUE = "#1a4a7a";
const LIGHT_BLUE = "#3d8fd4";
const DARK_BLUE = "#0d2d5c";
const INK = "#0a1628";

/** Wix CDN portrait — Dhirender Verma on theagileforum.com mentor section */
export const MENTOR_PORTRAIT_URL =
  "https://static.wixstatic.com/media/473f1f_441a2d1dd4324ae2b3a719edf7771b2c~mv2.png/v1/fill/w_520,h_675,al_c,q_85,enc_auto/473f1f_441a2d1dd4324ae2b3a719edf7771b2c~mv2.png";

/** Live Wix homepage CTA — BOOK A 1:1 COACHING CALL */
export const MENTOR_COACHING_BOOKING_URL = "https://calendly.com/coach_Dhirender_Verma";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/dhirender.verma",
    Icon: FacebookIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dhirenderverma/",
    Icon: LinkedInIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/theagileforum/",
    Icon: InstagramIcon,
  },
] as const;

const HANDHOLD_ROLES = [
  "Scrum Masters",
  "Agile Project managers",
  "Product owners/managers &",
  "Agile Coaches with right knowledge and complete career guidance.",
] as const;

const HOW_I_HELP = [
  "Complete End to End live project (in JIRA & Confluence) mentorship and masterclass",
  "Interview Preparation & Mock Interviews",
  "Correct resume to land a high paying Job",
  "All relevant Certifications for Scrum & SAFe",
  "Job Help",
  "Correct tool knowledge of tools like JIRA + Confluence, miro, figma etc",
] as const;

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.25, "& li": { mb: 0.75 } }}>
      {items.map((item) => (
        <Typography key={item} component="li" sx={{ fontSize: "0.95rem", color: "text.secondary", lineHeight: 1.55 }}>
          {item}
        </Typography>
      ))}
    </Box>
  );
}

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <Box
      component="section"
      id="mentor-coach"
      aria-labelledby="mentor-coach-heading"
      sx={{
        bgcolor: "#fff",
        pt: { xs: 7, md: 10 },
        // Extra bottom space so sticky mobile CTA does not cover last lines
        pb: { xs: "calc(7rem + env(safe-area-inset-bottom))", md: 10 },
        px: { xs: 2.5, md: 6 },
        overflow: "visible",
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto", minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

export function MentorCoachSection() {
  function openBooking(source: string) {
    trackEvent("home_mentor_coach_booking_click", { source });
    window.open(MENTOR_COACHING_BOOKING_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <SectionShell>
      {/*
        Mobile order: heading → portrait → bio.
        Desktop: portrait left, heading+bio right (grid column placement).
      */}
      <Box
        sx={{
          display: "grid",
          gap: { xs: 3.5, md: 6 },
          alignItems: { md: "start" },
          gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 0.9fr) 1.1fr" },
          gridTemplateRows: { md: "auto auto" },
        }}
      >
        <Typography
          id="mentor-coach-heading"
          component="h2"
          sx={{
            m: 0,
            mb: { xs: 0, md: 2 },
            gridColumn: { xs: "1", md: "2" },
            gridRow: { md: "1" },
            order: { xs: 1, md: 0 },
            fontFamily: '"Sora", system-ui, sans-serif',
            fontWeight: 800,
            fontSize: { xs: "1.5rem", sm: "1.65rem", md: "2rem" },
            lineHeight: 1.25,
            color: ROYAL_BLUE,
            textWrap: "balance",
            overflowWrap: "anywhere",
          }}
        >
          Looking for a Mentor &amp; Coach ?
        </Typography>

        {/* Portrait + callout + CTA */}
        <Box
          sx={{
            maxWidth: { xs: 360, md: "none" },
            mx: { xs: "auto", md: 0 },
            width: "100%",
            gridColumn: { xs: "1", md: "1" },
            gridRow: { md: "1 / span 2" },
            order: { xs: 2, md: 0 },
            overflow: "visible",
          }}
        >
          <Box sx={{ position: "relative", pb: { xs: 11, sm: 12 }, overflow: "visible" }}>
            <Box
              component="img"
              src={MENTOR_PORTRAIT_URL}
              alt="Dhirender Verma — Enterprise Agile Coach and SAFe Authorized Trainer"
              loading="lazy"
              sx={{
                display: "block",
                width: "100%",
                maxWidth: 420,
                mx: "auto",
                aspectRatio: "463 / 600",
                objectFit: "cover",
                objectPosition: "center top",
                borderRadius: "50%",
                boxShadow: "0 20px 48px rgba(26, 74, 122, 0.22)",
              }}
            />

            <Box
              component="a"
              href={MENTOR_COACHING_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("home_mentor_coach_booking_click", { source: "career_guidance_callout" })}
              sx={{
                position: "absolute",
                left: "50%",
                bottom: { xs: 48, sm: 52 },
                transform: "translateX(-50%)",
                width: { xs: "min(100%, 340px)", sm: "88%" },
                maxWidth: 380,
                bgcolor: ROYAL_BLUE,
                color: "#fff",
                textDecoration: "none",
                borderRadius: 3,
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1.75, sm: 2 },
                textAlign: "center",
                boxShadow: "0 14px 36px rgba(26, 74, 122, 0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
                overflow: "visible",
                zIndex: 1,
                "&:hover": {
                  transform: "translateX(-50%) translateY(-2px)",
                  boxShadow: "0 18px 42px rgba(26, 74, 122, 0.42)",
                },
              }}
            >
              <Typography
                sx={{
                  m: 0,
                  fontWeight: 700,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  lineHeight: 1.45,
                  textWrap: "balance",
                  overflowWrap: "anywhere",
                }}
              >
                Connect With me for a FREE Career Guidance &amp; strategy session for landing a high paying Job!
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => openBooking("primary_cta")}
            sx={{
              maxWidth: 420,
              mx: "auto",
              display: "flex",
              bgcolor: DARK_BLUE,
              color: "#fff",
              fontWeight: 800,
              fontSize: { xs: "0.78rem", sm: "0.85rem" },
              letterSpacing: "0.06em",
              py: 1.75,
              boxShadow: "0 12px 32px rgba(13, 45, 92, 0.28)",
              "&:hover": {
                bgcolor: INK,
                boxShadow: "0 16px 40px rgba(10, 22, 40, 0.35)",
                transform: "translateY(-1px)",
              },
            }}
          >
            BOOK A 1:1 COACHING CALL
          </Button>
        </Box>

        {/* Bio body (heading is above on mobile / grid row 1 on desktop) */}
        <Box
          sx={{
            gridColumn: { xs: "1", md: "2" },
            gridRow: { md: "2" },
            order: { xs: 3, md: 0 },
            minWidth: 0,
            overflow: "visible",
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ mb: 2.5 }}>
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <IconButton
                key={label}
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                size="small"
                onClick={() => trackEvent("home_mentor_coach_social_click", { network: label.toLowerCase() })}
                sx={{
                  color: ROYAL_BLUE,
                  border: "1px solid",
                  borderColor: "rgba(26, 74, 122, 0.2)",
                  "&:hover": { bgcolor: "rgba(26, 74, 122, 0.08)", borderColor: ROYAL_BLUE },
                }}
              >
                <Icon fontSize="small" />
              </IconButton>
            ))}
          </Stack>

          <Typography sx={{ m: 0, mb: 2, lineHeight: 1.35 }}>
            <Box
              component="span"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontStyle: "italic",
                fontSize: { xs: "1.35rem", md: "1.75rem" },
                color: ROYAL_BLUE,
                mr: 0.75,
              }}
            >
              Hello!
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: '"Sora", system-ui, sans-serif',
                fontWeight: 600,
                fontSize: { xs: "1.05rem", md: "1.3rem" },
                color: LIGHT_BLUE,
                overflowWrap: "anywhere",
              }}
            >
              I&apos;m Dhirender Verma
            </Box>
          </Typography>

          <Typography
            sx={{
              m: 0,
              mb: 3,
              fontSize: "0.95rem",
              color: "text.secondary",
              lineHeight: 1.65,
              overflowWrap: "anywhere",
            }}
          >
            Enterprise Agile Coach, Large Scale Agile Transformation Consultant, SPC - SAFe Authorized Trainer &amp;
            Speaker, 10+ yrs as Agile Program/Project Manager, RTE, Scrum Master, Agilist, Agile, Scrum, kanban, SAFe
            Expert.
          </Typography>

          <Typography sx={{ m: 0, mb: 1.25, fontWeight: 700, fontSize: "1rem", color: INK }}>
            As a Mentor &amp; Certified Trainer for SAFe, Scrum and kanban, i handhold:
          </Typography>
          <Box sx={{ mb: 3 }}>
            <BulletList items={HANDHOLD_ROLES} />
          </Box>

          <Typography sx={{ m: 0, mb: 1.25, fontWeight: 700, fontSize: "1rem", color: INK }}>
            How I help ?
          </Typography>
          <BulletList items={HOW_I_HELP} />
        </Box>
      </Box>
    </SectionShell>
  );
}
