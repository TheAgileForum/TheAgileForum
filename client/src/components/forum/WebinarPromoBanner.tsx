import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { trackEvent } from "../../lib/analytics";

const INK = "#0a1628";
const ACCENT = "#0f9f8f";
const WEBINAR_REGISTER_URL = "https://www.meetup.com/the-agile-forum/events/";

export function WebinarPromoBanner() {
  return (
    <Box
      component="section"
      id="webinar-promo"
      aria-labelledby="webinar-promo-heading"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 7, md: 10 },
        px: { xs: 2.5, md: 6 },
        color: "#fff",
        textAlign: "center",
        background: `
          linear-gradient(180deg, rgba(26, 74, 122, 0.55) 0%, rgba(10, 22, 40, 0.92) 45%, ${INK} 100%),
          radial-gradient(ellipse 90% 60% at 50% 0%, rgba(15, 159, 143, 0.22), transparent 55%),
          linear-gradient(165deg, #1e3a5f 0%, ${INK} 70%)
        `,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to top, ${INK} 0%, transparent 35%),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 48px 100%, 100% 32px",
          opacity: 0.85,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: { xs: "28%", md: "32%" },
          background: `
            linear-gradient(to top, ${INK}, transparent),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.07) 0px,
              rgba(255,255,255,0.07) 2px,
              transparent 2px,
              transparent 38px
            )
          `,
          maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 900, mx: "auto" }}>
        <Typography
          component="p"
          sx={{
            m: 0,
            mb: { xs: 1.5, md: 2 },
            fontSize: { xs: "0.72rem", md: "0.78rem" },
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          Enroll for
        </Typography>

        <Typography
          id="webinar-promo-heading"
          component="h2"
          sx={{
            m: 0,
            mb: { xs: 3, md: 4 },
            fontFamily: '"Sora", system-ui, sans-serif',
            fontWeight: 800,
            fontSize: { xs: "1.55rem", sm: "2rem", md: "2.65rem" },
            lineHeight: 1.15,
            letterSpacing: { xs: "0.02em", md: "0.04em" },
            textTransform: "uppercase",
            textWrap: "balance",
          }}
        >
          Free AI Scrum Master – Product Owner Webinar
        </Typography>

        <Button
          component="a"
          href={WEBINAR_REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          size="large"
          onClick={() => trackEvent("home_webinar_promo_click", { webinar: "ai_sm_po" })}
          sx={{
            bgcolor: ACCENT,
            color: "#04241f",
            fontWeight: 800,
            fontSize: { xs: "0.82rem", md: "0.9rem" },
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            px: { xs: 3, md: 4 },
            py: 1.75,
            boxShadow: "0 12px 32px rgba(15, 159, 143, 0.35)",
            "&:hover": {
              bgcolor: "#12b5a3",
              boxShadow: "0 16px 40px rgba(15, 159, 143, 0.45)",
              transform: "translateY(-1px)",
            },
          }}
        >
          Reserve free seat
        </Button>

        <Typography
          component="p"
          sx={{
            mt: 2.25,
            mb: 0,
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Or{" "}
          <Box
            component={RouterLink}
            to="/webinars"
            onClick={() => trackEvent("home_webinar_promo_webinars_link", { source: "promo_banner" })}
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              "&:hover": { color: ACCENT },
            }}
          >
            browse all webinars
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
