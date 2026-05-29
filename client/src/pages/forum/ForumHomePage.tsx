import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useDiagnosis } from "../../contexts/DiagnosisContext";

export function ForumHomePage() {
  const navigate = useNavigate();
  const { loading, resumeStep, startSession } = useDiagnosis();

  async function handleStart() {
    await startSession("home-hero");
    navigate("/diagnosis/step-1");
  }

  function handleContinue() {
    if (resumeStep === "step_2") navigate("/diagnosis/step-2");
    else if (resumeStep === "step_3") navigate("/diagnosis/step-3");
    else if (resumeStep === "step_4") navigate("/diagnosis/step-4");
    else navigate("/diagnosis/step-1");
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
        Clarity for your agile career path
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: "1.05rem" }}>
        Diagnose your readiness, get one clear next step, and move forward with confidence.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button variant="contained" size="large" disabled={loading} onClick={() => void handleStart()}>
          Start diagnosis
        </Button>
        {resumeStep && resumeStep !== "step_1" ? (
          <Button variant="outlined" size="large" disabled={loading} onClick={handleContinue}>
            Continue where you left off
          </Button>
        ) : null}
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {[
          { title: "Scrum Master", detail: "Team facilitation & delivery" },
          { title: "Product Owner", detail: "Backlog & stakeholder value" },
          { title: "SAFe Leader", detail: "Program-level agility" },
        ].map((pathway) => (
          <Card key={pathway.title} variant="outlined" sx={{ flex: 1 }}>
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
      <Typography variant="body2" color="text.secondary">
        Free webinar this week · Mentor calls from $9 / ₹49 · No spam — consent required before analysis
      </Typography>
    </Stack>
  );
}
