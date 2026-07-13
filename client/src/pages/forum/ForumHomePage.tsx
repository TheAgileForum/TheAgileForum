import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { CareerOutcomesSection } from "../../components/forum/CareerOutcomesSection";
import { MentorCoachSection } from "../../components/forum/MentorCoachSection";
import { ProofStrip } from "../../components/forum/ProofStrip";
import { StickyMobileCta } from "../../components/forum/StickyMobileCta";
import { WebinarPromoBanner } from "../../components/forum/WebinarPromoBanner";
import { useAuth } from "../../contexts/AuthContext";
import { useDiagnosis } from "../../contexts/DiagnosisContext";
import { trackEvent } from "../../lib/analytics";
import { apiUrl } from "../../lib/api-base";
import { openMentorBooking } from "../../lib/mentor-booking";

const ACCENT = "#0f9f8f";
const INK = "#0a1628";
const PAPER = "#f3f6f9";

const PATHWAYS = [
  {
    icon: "S",
    title: "Scrum Master",
    detail: "Interview-ready facilitation, ceremonies, and stakeholder confidence — built from your current baseline.",
    link: "Assessment for SM →",
  },
  {
    icon: "P",
    title: "Product Owner",
    detail: "Backlog mastery, discovery habits, and delivery partnership for people pivoting into PO.",
    link: "Assessment for PO →",
  },
  {
    icon: "L",
    title: "Agile Leader",
    detail: "RTE and leadership tracks for professionals ready to scale teams, not just run sprints.",
    link: "Assessment for leadership Roles →",
  },
] as const;

const STATS = [
  { target: 1000, suffix: "+", label: "Learners guided", icon: "learners" },
  { target: 40, suffix: "+", label: "Countries reached", icon: "globe" },
  { target: 12, suffix: "k+", label: "Assessments done", icon: "check" },
  { target: 6, suffix: "+", label: "Years of trust", icon: "star" },
  { target: 100, suffix: "+", label: "Guided placements", icon: "place" },
] as const;

const MOMENTS = [
  {
    num: "01",
    title: "Too many options, not enough signal",
    body: "Catalogs create decision fatigue. You need a readiness read, not another brochure.",
  },
  {
    num: "02",
    title: "Role transitions need a map",
    body: "Scrum Master, PO, and leadership paths look similar until you see what’s missing for you.",
  },
  {
    num: "03",
    title: "One next action beats ten courses",
    body: "We compress analysis into a single trusted recommendation — with rationale you can believe.",
  },
] as const;

const MAP_NODES = [
  { title: "Assessment", detail: "Resume · target role · gaps", active: true },
  { title: "Recommend", detail: "One path with clear rationale", active: false },
  { title: "Guide & practice", detail: "Trainings · exams · mentor", active: false },
  { title: "Advance", detail: "Interview-ready momentum", active: false },
] as const;

const STAGES = [
  { num: "01", title: "Assessment", body: "Share context. We map strengths, gaps, and role fit in plain language." },
  { num: "02", title: "Recommend", body: "One primary next action with transparent rationale — not a wall of options." },
  { num: "03", title: "Guide", body: "Trainings, micro-exams, webinars, or mentor time — sequenced to your goal." },
  { num: "04", title: "Advance", body: "Return to a living readiness snapshot. Continue where you left off." },
] as const;

function useCountUp(target: number, durationMs: number, delayMs: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Do not gate on a "started" ref — React Strict Mode remounts effects and
    // would leave the animation cancelled with value stuck at 0.
    let frame = 0;
    let cancelled = false;
    const startAt = performance.now() + delayMs;

    const tick = (now: number) => {
      if (cancelled) return;
      if (now < startAt) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startAt;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(Math.floor(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setValue(target);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [target, durationMs, delayMs]);

  return value;
}

function StatIcon({ kind }: { kind: (typeof STATS)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: 24,
    height: 24,
  };
  switch (kind) {
    case "learners":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case "place":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <path d="M12 14l2 2 4-4" />
        </svg>
      );
  }
}

function StatCard({
  target,
  suffix,
  label,
  icon,
  index,
}: {
  target: number;
  suffix: string;
  label: string;
  icon: (typeof STATS)[number]["icon"];
  index: number;
}) {
  const duration = target >= 500 ? 2400 : 2000;
  const value = useCountUp(target, duration, 350 + index * 140);

  return (
    <Box
      component="article"
      sx={{
        textAlign: "center",
        py: { xs: 2.5, lg: 1 },
        px: 1.25,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        borderTop: { xs: "1px solid rgba(255,255,255,0.1)", lg: 0 },
        borderLeft: { lg: index === 0 ? 0 : "1px solid rgba(255,255,255,0.1)" },
        opacity: 0,
        transform: "translateY(10px)",
        animation: "homeRiseIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        animationDelay: `${0.3 + index * 0.1}s`,
        transition: "transform 0.25s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <Box sx={{ color: ACCENT, display: "grid", placeItems: "center", width: 32, height: 32 }} aria-hidden>
        <StatIcon kind={icon} />
      </Box>
      <Typography
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: { xs: "1.65rem", md: "2.2rem" },
          fontWeight: 560,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: "#fff",
          fontVariantNumeric: "tabular-nums",
          minWidth: "4ch",
        }}
      >
        {value.toLocaleString("en-US")}
        <Box component="span" sx={{ fontSize: "0.55em", color: ACCENT, ml: "1px" }}>
          {suffix}
        </Box>
      </Typography>
      <Typography
        sx={{
          m: 0,
          fontSize: "0.68rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          fontWeight: 500,
          maxWidth: "16ch",
          lineHeight: 1.35,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <Typography
      sx={{
        fontSize: "0.72rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontWeight: 600,
        color: light ? "rgba(255,255,255,0.45)" : "text.secondary",
        mb: 1.25,
      }}
    >
      {children}
    </Typography>
  );
}

function DisplayHeading({
  children,
  component = "h2",
  sx,
}: {
  children: ReactNode;
  component?: "h1" | "h2";
  sx?: object;
}) {
  return (
    <Typography
      component={component}
      sx={{
        fontFamily: '"Fraunces", Georgia, serif',
        fontWeight: 560,
        letterSpacing: "-0.02em",
        lineHeight: 1.12,
        "& em": { fontStyle: "italic", color: ACCENT, fontWeight: 500 },
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

function PrimaryCta({
  children,
  onClick,
  disabled,
  onWarm,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  onWarm?: () => void;
}) {
  return (
    <Button
      variant="contained"
      size="large"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onWarm}
      onFocus={onWarm}
      sx={{
        bgcolor: ACCENT,
        color: "#04241f",
        fontWeight: 700,
        px: 2.75,
        py: 1.5,
        boxShadow: "none",
        "&:hover": {
          bgcolor: "#12b5a3",
          boxShadow: "0 8px 28px rgba(15, 159, 143, 0.35)",
          transform: "translateY(-1px)",
        },
      }}
    >
      {children}
    </Button>
  );
}

function GhostCta({
  children,
  onClick,
  dark,
}: {
  children: ReactNode;
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <Button
      variant="outlined"
      size="large"
      onClick={onClick}
      sx={{
        borderColor: dark ? "divider" : "rgba(255,255,255,0.35)",
        color: dark ? "text.primary" : "#fff",
        fontWeight: 600,
        px: 2.75,
        py: 1.5,
        "&:hover": {
          borderColor: dark ? ACCENT : "rgba(255,255,255,0.7)",
          bgcolor: dark ? "transparent" : "rgba(255,255,255,0.06)",
          color: dark ? "#0b7a6e" : "#fff",
        },
      }}
    >
      {children}
    </Button>
  );
}

function SectionInner({ children }: { children: ReactNode }) {
  return <Box sx={{ maxWidth: 1100, mx: "auto" }}>{children}</Box>;
}

export function ForumHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resumeLoading, resumeStep, startSession, prefetchSession } = useDiagnosis();
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    void fetch(apiUrl("/api/v1/health"), { credentials: "include" }).catch(() => undefined);
    prefetchSession();
  }, [prefetchSession]);

  function handleStart(source = "hero") {
    setStartError(null);
    setStarting(true);
    trackEvent("home_hero_cta_click", { source });
    navigate("/diagnosis/step-1");
    const campaignId = source === "hero" ? "home-hero" : `home-${source}`;
    void startSession(campaignId)
      .catch((error) => {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Could not start assessment. Check that the API is running and try again.";
        setStartError(message);
      })
      .finally(() => setStarting(false));
  }

  const warmSession = () => prefetchSession();

  function handleContinue() {
    trackEvent("home_continue_journey_click", { step: resumeStep ?? "unknown" });
    if (resumeStep === "step_2") navigate("/diagnosis/step-2");
    else if (resumeStep === "step_3") navigate("/diagnosis/step-3");
    else if (resumeStep === "step_4") navigate("/diagnosis/step-4");
    else navigate("/diagnosis/step-1");
  }

  function handleMentorCall() {
    trackEvent("home_hero_cta_click", { source: "mentor_call" });
    openMentorBooking();
  }

  return (
    <Box
      sx={{
        "@keyframes homeRiseIn": {
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes homeGridDrift": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "28px 28px" },
        },
      }}
    >
      {startError ? (
        <Alert severity="error" onClose={() => setStartError(null)} sx={{ m: 2 }}>
          {startError}
        </Alert>
      ) : null}

      {/* —— Hero —— */}
      <Box
        component="header"
        sx={{
          position: "relative",
          minHeight: { xs: "auto", md: "calc(100svh - 72px)" },
          background: `
            radial-gradient(ellipse 80% 50% at 70% 20%, rgba(15, 159, 143, 0.18), transparent 55%),
            radial-gradient(ellipse 60% 40% at 10% 80%, rgba(37, 99, 235, 0.12), transparent 50%),
            linear-gradient(165deg, #061018 0%, ${INK} 45%, #0d1f33 100%)
          `,
          color: "#fff",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 2.5, md: 6 },
          pt: { xs: 5, md: 6 },
          pb: 5,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.11) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 85%)",
            pointerEvents: "none",
            animation: "homeGridDrift 40s linear infinite",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 920,
            mx: "auto",
            textAlign: "center",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: 0,
            transform: "translateY(18px)",
            animation: "homeRiseIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards",
          }}
        >
          <Eyebrow light>Career clarity for Agile professionals</Eyebrow>
          <Box
            component="img"
            src="/logo-the-agile-forum.png"
            alt="The Agile Forum"
            sx={{
              height: { xs: 56, sm: 72, md: 88 },
              width: "auto",
              display: "block",
              mx: "auto",
              mb: 2.75,
            }}
          />
          <DisplayHeading
            component="h1"
            sx={{
              m: 0,
              mb: 2.5,
              fontSize: { xs: "2.35rem", sm: "3.25rem", md: "4.25rem" },
              color: "#fff",
            }}
          >
            Know where you stand.
            <br />
            Get <em>one clear next action</em>.
          </DisplayHeading>
          <Typography
            sx={{
              mx: "auto",
              mb: 4.5,
              maxWidth: 540,
              fontSize: { xs: "1rem", md: "1.15rem" },
              color: "rgba(255,255,255,0.72)",
              fontWeight: 400,
            }}
          >
            Assess skill gaps in minutes. Skip the course catalog maze — leave with a trusted path toward Scrum
            Master, Product Owner, Product Manager, or Agile leadership.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <PrimaryCta
              disabled={starting}
              onWarm={warmSession}
              onClick={() => void handleStart("hero")}
            >
              Start Assessment →
            </PrimaryCta>
            <GhostCta onClick={handleMentorCall}>Book mentor call</GhostCta>
          </Stack>
        </Box>

        {/* Stats strip */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: 1100,
            mx: "auto",
            mt: 6,
          }}
          aria-label="Impact metrics"
        >
          <Box
            sx={{
              display: "grid",
              gap: { xs: 1.5, lg: 1 },
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(5, 1fr)",
              },
            }}
          >
            {STATS.map((stat, index) => (
              <StatCard key={stat.label} {...stat} index={index} />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Resume journey */}
      {user && resumeStep && resumeStep !== "step_1" ? (
        <Box sx={{ bgcolor: "#e8eef4", borderBottom: 1, borderColor: "divider", px: { xs: 2.5, md: 6 }, py: 2.5 }}>
          <SectionInner>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                alignItems: { sm: "center" },
                justifyContent: "space-between",
                border: "1px solid",
                borderColor: "primary.main",
                bgcolor: "rgba(15, 159, 143, 0.08)",
                p: 2.5,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Continue where you left off</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your assessment progress is saved — pick up at step {resumeStep.replace("step_", "")}.
                </Typography>
              </Box>
              <Button variant="contained" disabled={resumeLoading} onClick={handleContinue} sx={{ flexShrink: 0 }}>
                Resume journey
              </Button>
            </Stack>
          </SectionInner>
        </Box>
      ) : null}

      <ProofStrip />

      {/* Why */}
      <Box component="section" id="why" sx={{ bgcolor: "#fff", py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 6 } }}>
        <SectionInner>
          <Box sx={{ maxWidth: 640, mb: 6 }}>
            <Eyebrow>Why this moment matters</Eyebrow>
            <DisplayHeading sx={{ fontSize: { xs: "1.85rem", md: "2.75rem" }, mb: 1.75 }}>
              Courses don’t create clarity.
              <br />
              <em>Assessment does.</em>
            </DisplayHeading>
            <Typography color="text.secondary" sx={{ fontSize: "1.05rem", m: 0 }}>
              Most platforms push inventory first. We reverse it — understand your gap, then recommend one move that
              actually advances your career.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: { xs: 5, md: 7 },
              alignItems: "center",
              gridTemplateColumns: { md: "1fr 1fr" },
            }}
          >
            <Stack spacing={3.5}>
              {MOMENTS.map((item, i) => (
                <Box
                  key={item.num}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr",
                    gap: 2,
                    opacity: 0,
                    transform: "translateY(12px)",
                    animation: "homeRiseIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                    animationDelay: `${0.05 + i * 0.1}s`,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontSize: "1.35rem",
                      color: "primary.dark",
                      pt: 0.25,
                    }}
                  >
                    {item.num}
                  </Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: "1.15rem", mb: 0.75 }}>{item.title}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: "0.95rem", m: 0 }}>
                      {item.body}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            <Box
              component="aside"
              aria-label="Readiness map preview"
              sx={{
                bgcolor: INK,
                color: "#fff",
                minHeight: 320,
                p: 3.5,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  opacity: 0.6,
                },
              }}
            >
              <Typography
                sx={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  mb: 3,
                }}
              >
                Your readiness map
              </Typography>
              <Stack spacing={1.75} sx={{ position: "relative", zIndex: 1 }}>
                {MAP_NODES.map((node) => (
                  <Box
                    key={node.title}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.75,
                      px: 2,
                      py: 1.75,
                      border: "1px solid",
                      borderColor: node.active ? ACCENT : "rgba(255,255,255,0.12)",
                      bgcolor: node.active ? "rgba(15, 159, 143, 0.12)" : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        flexShrink: 0,
                        bgcolor: node.active ? ACCENT : "rgba(255,255,255,0.35)",
                        boxShadow: node.active ? "0 0 12px rgba(15, 159, 143, 0.35)" : "none",
                      }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.92rem" }}>{node.title}</Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>
                        {node.detail}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </SectionInner>
      </Box>

      {/* Paths */}
      <Box component="section" id="paths" sx={{ bgcolor: PAPER, py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 6 } }}>
        <SectionInner>
          <Box sx={{ maxWidth: 640, mx: "auto", textAlign: "center", mb: 6 }}>
            <Eyebrow>Choose your path</Eyebrow>
            <DisplayHeading sx={{ fontSize: { xs: "1.85rem", md: "2.75rem" }, mb: 1.75 }}>
              Where are you <em>headed</em>?
            </DisplayHeading>
            <Typography color="text.secondary" sx={{ fontSize: "1.05rem", m: 0 }}>
              Pick a direction to frame your Assessment. Same flow — sharper context.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { md: "repeat(3, 1fr)" },
            }}
          >
            {PATHWAYS.map((pathway) => (
              <Box
                key={pathway.title}
                component="button"
                type="button"
                disabled={starting}
                onClick={() => {
                  trackEvent("home_pathway_card_click", { pathway: pathway.title });
                  void handleStart(`pathway-${pathway.title}`);
                }}
                sx={{
                  all: "unset",
                  boxSizing: "border-box",
                  cursor: starting ? "wait" : "pointer",
                  bgcolor: "#fff",
                  border: "1px solid",
                  borderColor: "divider",
                  p: 3.5,
                  minHeight: 280,
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: ACCENT,
                    boxShadow: "0 16px 40px rgba(10, 22, 40, 0.08)",
                    "& .path-link": { color: ACCENT },
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    mb: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "grid",
                    placeItems: "center",
                    color: "primary.dark",
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontSize: "1.1rem",
                  }}
                >
                  {pathway.icon}
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 1.25 }}>{pathway.title}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: "0.92rem", flex: 1, m: 0 }}>
                  {pathway.detail}
                </Typography>
                <Typography
                  className="path-link"
                  sx={{ mt: 3, color: "primary.dark", fontWeight: 600, fontSize: "0.88rem" }}
                >
                  {pathway.link}
                </Typography>
              </Box>
            ))}
          </Box>
        </SectionInner>
      </Box>

      {/* Stages */}
      <Box component="section" id="how" sx={{ bgcolor: INK, color: "#fff", py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 6 } }}>
        <SectionInner>
          <Box sx={{ maxWidth: 640, mx: "auto", textAlign: "center", mb: 6 }}>
            <Eyebrow light>How it works</Eyebrow>
            <DisplayHeading sx={{ fontSize: { xs: "1.85rem", md: "2.75rem" }, mb: 1.75, color: "#fff" }}>
              Assessment. Recommend. Guide. <em>Advance.</em>
            </DisplayHeading>
            <Typography sx={{ fontSize: "1.05rem", m: 0, color: "rgba(255,255,255,0.6)" }}>
              A four-stage loop designed for clarity — not catalog browsing.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { md: "repeat(4, 1fr)" },
            }}
          >
            {STAGES.map((stage, i) => (
              <Box
                key={stage.num}
                sx={{
                  p: 3.5,
                  borderTop: { xs: "1px solid rgba(255,255,255,0.12)", md: 0 },
                  borderLeft: { md: i === 0 ? 0 : "1px solid rgba(255,255,255,0.12)" },
                  pl: { md: i === 0 ? 0 : 3.5 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontSize: "0.95rem",
                    color: ACCENT,
                    mb: 1.5,
                    display: "block",
                  }}
                >
                  {stage.num}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", mb: 1 }}>{stage.title}</Typography>
                <Typography sx={{ m: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.55)" }}>
                  {stage.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </SectionInner>
      </Box>

      {/* Secondary browse */}
      <Box component="section" id="browse" sx={{ bgcolor: "#fff", py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 6 } }}>
        <SectionInner>
          <Box sx={{ maxWidth: 640, mb: 6 }}>
            <Eyebrow>Already know what you need?</Eyebrow>
            <DisplayHeading sx={{ fontSize: { xs: "1.85rem", md: "2.75rem" }, mb: 1.75 }}>
              Browse without losing the <em>thread</em>
            </DisplayHeading>
            <Typography color="text.secondary" sx={{ fontSize: "1.05rem", m: 0 }}>
              Catalog access stays available — demoted so Assessment remains the hero.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { sm: "1.4fr 1fr" },
            }}
          >
            <Box sx={{ border: "1px solid", borderColor: "divider", p: 3.5, bgcolor: PAPER }}>
              <Typography sx={{ fontWeight: 600, fontSize: "1.15rem", mb: 1 }}>Explore offerings</Typography>
              <Typography color="text.secondary" sx={{ fontSize: "0.92rem", mb: 2.25 }}>
                Jump straight to inventory when you’re ready — trainings, certifications, and services.
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {[
                  { to: "/trainings", label: "Trainings" },
                  { to: "/certifications", label: "Certifications" },
                  { to: "/services", label: "Services" },
                ].map((chip) => (
                  <Button
                    key={chip.to}
                    component={RouterLink}
                    to={chip.to}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "divider",
                      color: "text.primary",
                      bgcolor: "#fff",
                      borderRadius: 0,
                      "&:hover": { borderColor: ACCENT, color: "primary.dark" },
                    }}
                  >
                    {chip.label}
                  </Button>
                ))}
              </Stack>
            </Box>
            <Box sx={{ border: "1px solid", borderColor: "divider", p: 3.5, bgcolor: PAPER }}>
              <Typography sx={{ fontWeight: 600, fontSize: "1.15rem", mb: 1 }}>Live session</Typography>
              <Typography color="text.secondary" sx={{ fontSize: "0.92rem", mb: 2.25 }}>
                Free webinar · PO Backlog Mastery
                <br />
                Thu · 45 min · Product Owners
              </Typography>
              <GhostCta
                dark
                onClick={() => trackEvent("home_webinar_register_click", { webinar: "po_backlog" })}
              >
                Register interest
              </GhostCta>
            </Box>
          </Box>
        </SectionInner>
      </Box>

      {/* Closing CTA */}
      <Box
        component="section"
        sx={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 0%, rgba(15, 159, 143, 0.2), transparent 60%),
            ${INK}
          `,
          color: "#fff",
          textAlign: "center",
          py: { xs: 8, md: 12 },
          px: { xs: 2.5, md: 6 },
        }}
      >
        <SectionInner>
          <DisplayHeading sx={{ fontSize: { xs: "1.85rem", md: "2.6rem" }, mb: 1.75, color: "#fff" }}>
            Ready for clarity — not another catalog?
          </DisplayHeading>
          <Typography sx={{ mx: "auto", mb: 3.5, maxWidth: 480, color: "rgba(255,255,255,0.65)" }}>
            Ten minutes. A personalized readiness read. One trusted next step.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <PrimaryCta
              disabled={starting}
              onWarm={warmSession}
              onClick={() => void handleStart("close-cta")}
            >
              Start Assessment →
            </PrimaryCta>
            <GhostCta onClick={handleMentorCall}>Or book a mentor call</GhostCta>
          </Stack>
        </SectionInner>
      </Box>

      <WebinarPromoBanner />

      <CareerOutcomesSection />

      <MentorCoachSection />

      <StickyMobileCta
        label="Start Assessment →"
        disabled={starting}
        onWarm={warmSession}
        onClick={() => void handleStart("sticky")}
      />
    </Box>
  );
}
