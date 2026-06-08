import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ProofStrip } from "../../components/forum/ProofStrip";
import { StickyMobileCta } from "../../components/forum/StickyMobileCta";
import { useAuth } from "../../contexts/AuthContext";
import { useDiagnosis } from "../../contexts/DiagnosisContext";
import { trackEvent } from "../../lib/analytics";

const PATHWAYS = [
  { title: "Scrum Master", detail: "Interview-ready SM path" },
  { title: "Product Owner", detail: "PO transition program" },
  { title: "Agile Leader", detail: "RTE & leadership tracks" },
] as const;

export function ForumHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, resumeStep, startSession } = useDiagnosis();

  async function handleStart() {
    trackEvent("home_hero_cta_click", { source: "hero" });
    await startSession("home-hero");
    navigate("/diagnosis/step-1");
  }

  function handleContinue() {
    trackEvent("home_continue_journey_click", { step: resumeStep ?? "unknown" });
    if (resumeStep === "step_2") navigate("/diagnosis/step-2");
    else if (resumeStep === "step_3") navigate("/diagnosis/step-3");
    else if (resumeStep === "step_4") navigate("/diagnosis/step-4");
    else navigate("/diagnosis/step-1");
  }

  function handleMentorCall() {
    trackEvent("home_hero_cta_click", { source: "mentor_call" });
    window.open("mailto:support@theagileforum.com?subject=Mentor%20call%20request", "_blank");
  }

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #0F766E 100%)",
          color: "#fff",
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "2rem" }, mb: 1 }}>
            Your clearest path to Scrum Master, PO, or Agile leadership
          </Typography>
          <Typography sx={{ opacity: 0.92, mb: 2 }}>
            Diagnose skill gaps in minutes. Get one trusted next action—not another course catalog.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              disabled={loading}
              onClick={() => void handleStart()}
              sx={{ bgcolor: "#fff", color: "primary.dark", "&:hover": { bgcolor: "#f1f5f9" } }}
            >
              Start diagnosis
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleMentorCall}
              sx={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
            >
              Book mentor call
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {user && resumeStep && resumeStep !== "step_1" ? (
        <Card variant="outlined" sx={{ borderColor: "primary.main", bgcolor: "primary.50" }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Continue where you left off
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Your diagnosis progress is saved—pick up at step {resumeStep.replace("step_", "")}.
            </Typography>
            <Button variant="contained" disabled={loading} onClick={handleContinue}>
              Resume journey
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <ProofStrip />

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Already know what you need?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Browse trainings, certifications, and services without starting diagnosis.
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Button component={RouterLink} to="/trainings" size="small" variant="outlined">
              Trainings
            </Button>
            <Button component={RouterLink} to="/certifications" size="small" variant="outlined">
              Certifications
            </Button>
            <Button component={RouterLink} to="/services" size="small" variant="outlined">
              Services
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            How it works
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ① Diagnose your readiness → ② Get one recommendation → ③ Advance with trainings, exams, or mentor support.
          </Typography>
        </CardContent>
      </Card>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {PATHWAYS.map((pathway) => (
          <Card
            key={pathway.title}
            variant="outlined"
            sx={{ flex: 1, cursor: "pointer" }}
            onClick={() => {
              trackEvent("home_pathway_card_click", { pathway: pathway.title });
              void handleStart();
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {pathway.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pathway.detail}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Free webinar · PO Backlog Mastery
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Thu 30 May · 45 min · Live session for Product Owners
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => trackEvent("home_webinar_register_click", { webinar: "po_backlog" })}
          >
            Register interest
          </Button>
        </CardContent>
      </Card>

      <StickyMobileCta label="Start diagnosis" disabled={loading} onClick={() => void handleStart()} />
    </Stack>
  );
}
