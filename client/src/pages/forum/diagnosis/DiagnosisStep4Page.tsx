import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { DiagnosisStepper } from "../../../components/forum/DiagnosisStepper";
import { useDiagnosis } from "../../../contexts/DiagnosisContext";
import { getAnalysisResult, type PrimaryAction } from "../../../lib/forum-api";

export function DiagnosisStep4Page() {
  const navigate = useNavigate();
  const { runId, sessionId } = useDiagnosis();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readinessScore, setReadinessScore] = useState(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [primaryAction, setPrimaryAction] = useState<PrimaryAction | null>(null);
  const [rationale, setRationale] = useState<Array<{ label: string; detail: string }>>([]);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getAnalysisResult(runId);
        if (cancelled) return;
        setReadinessScore(res.readinessScore);
        setStrengths(res.insights.strengths);
        setGaps(res.insights.gaps);
        setPrimaryAction(res.primaryAction);
        setRationale(res.rationale);
      } catch {
        if (!cancelled) setError("Results not ready yet.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (!sessionId || !runId) {
    return (
      <Alert severity="warning">
        No results available.{" "}
        <Button size="small" onClick={() => navigate("/diagnosis/step-1")}>
          Start diagnosis
        </Button>
      </Alert>
    );
  }

  const offerCode = primaryAction?.offeringCode ?? "agile-readiness";

  return (
    <Stack spacing={2}>
      <DiagnosisStepper activeStep={3} />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Your readiness snapshot
      </Typography>
      {loading ? (
        <Typography color="text.secondary">Loading results…</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Readiness score
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {readinessScore}%
              </Typography>
            </CardContent>
          </Card>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Strengths
                </Typography>
                {strengths.map((s) => (
                  <Chip key={s} label={s} size="small" sx={{ mr: 0.5, mb: 0.5 }} color="success" variant="outlined" />
                ))}
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Gaps
                </Typography>
                {gaps.map((g) => (
                  <Chip key={g} label={g} size="small" sx={{ mr: 0.5, mb: 0.5 }} color="warning" variant="outlined" />
                ))}
              </CardContent>
            </Card>
          </Stack>
          {rationale.map((r) => (
            <Typography key={r.label} variant="body2" color="text.secondary">
              <strong>{r.label}:</strong> {r.detail}
            </Typography>
          ))}
          {primaryAction ? (
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to={`/offers/${offerCode}`}
            >
              {primaryAction.label}
            </Button>
          ) : null}
        </>
      )}
    </Stack>
  );
}
