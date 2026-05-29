import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiagnosisStepper } from "../../../components/forum/DiagnosisStepper";
import { useDiagnosis } from "../../../contexts/DiagnosisContext";
import { getAnalysisStatus } from "../../../lib/forum-api";

const STAGE_LABELS: Record<string, string> = {
  parsing: "Parsing resume",
  mapping: "Mapping skills to role",
  insights: "Generating insights",
};

export function DiagnosisStep3Page() {
  const navigate = useNavigate();
  const { runId, sessionId } = useDiagnosis();
  const [status, setStatus] = useState<string>("queued");
  const [stage, setStage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await getAnalysisStatus(runId);
        if (cancelled) return;
        setStatus(res.status);
        setStage(res.stage);
        setProgress(res.progressPct);
        if (res.status === "completed") {
          navigate("/diagnosis/step-4");
          return;
        }
        if (res.status === "failed" || res.status === "timeout") {
          setError(res.errorMessage ?? "Analysis failed. Please retry.");
          return;
        }
        setTimeout(() => void poll(), 400);
      } catch {
        if (!cancelled) setError("Could not reach analysis service.");
      }
    };
    void poll();
    return () => {
      cancelled = true;
    };
  }, [runId, navigate]);

  if (!sessionId || !runId) {
    return (
      <Alert severity="warning">
        No analysis in progress.{" "}
        <Button size="small" onClick={() => navigate("/diagnosis/step-2")}>
          Back to step 2
        </Button>
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <DiagnosisStepper activeStep={2} />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Analyzing your profile
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
      <Typography color="text.secondary">
        {stage ? STAGE_LABELS[stage] ?? stage : "Starting…"} · {progress}%
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Status: {status}
      </Typography>
      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/diagnosis/step-2")}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}
    </Stack>
  );
}
