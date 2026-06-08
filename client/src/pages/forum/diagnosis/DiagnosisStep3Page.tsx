import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiagnosisStepper } from "../../../components/forum/DiagnosisStepper";
import { useDiagnosis } from "../../../contexts/DiagnosisContext";
import { trackEvent } from "../../../lib/analytics";
import { getAnalysisStatus } from "../../../lib/forum-api";

const STAGE_LABELS: Record<string, string> = {
  parsing: "Parsing resume",
  mapping: "Mapping skills to role",
  insights: "Generating insights",
};

const POLL_MS = 400;
const MAX_POLLS = 150; // ~60s before timeout fallback

const SUPPORT_MAIL = "mailto:support@theagileforum.com?subject=Diagnosis%20analysis%20help";

export function DiagnosisStep3Page() {
  const navigate = useNavigate();
  const { runId, sessionId } = useDiagnosis();
  const [status, setStatus] = useState<string>("queued");
  const [stage, setStage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const pollCount = useRef(0);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    pollCount.current = 0;

    const poll = async () => {
      if (cancelled) return;
      pollCount.current += 1;
      if (pollCount.current > MAX_POLLS) {
        setTimedOut(true);
        setError("Analysis is taking longer than expected.");
        trackEvent("diagnosis_analysis_timeout");
        return;
      }
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
        window.setTimeout(() => void poll(), POLL_MS);
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
          severity={timedOut ? "warning" : "error"}
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/diagnosis/step-2")}>
              Retry
            </Button>
          }
        >
          {error}
          {timedOut ? (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Need help?{" "}
              <Link href={SUPPORT_MAIL}>Contact support</Link> or retry with a smaller resume file.
            </Typography>
          ) : null}
        </Alert>
      ) : null}
      {!error ? (
        <Typography variant="caption" color="text.secondary">
          Taking too long?{" "}
          <Link href={SUPPORT_MAIL} variant="caption">
            Get support
          </Link>
        </Typography>
      ) : null}
    </Stack>
  );
}
