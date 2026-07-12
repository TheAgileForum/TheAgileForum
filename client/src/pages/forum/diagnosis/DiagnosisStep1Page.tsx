import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiagnosisStepper } from "../../../components/forum/DiagnosisStepper";
import { useDiagnosis } from "../../../contexts/DiagnosisContext";
import { ApiRequestError } from "../../../lib/api";
import { saveDiagnosisIntent } from "../../../lib/forum-api";

export function DiagnosisStep1Page() {
  const navigate = useNavigate();
  const { sessionId, sessionStarting, startSession, prefetchSession } = useDiagnosis();
  const [targetRole, setTargetRole] = useState("Scrum Master");
  const [timeline, setTimeline] = useState("3 months");
  const [currentStatus, setCurrentStatus] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    prefetchSession("diagnosis-step-1");
  }, [prefetchSession]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!currentStatus.trim()) {
      setError("Current status is required.");
      return;
    }
    if (!consent) {
      setError("Consent is required before continuing.");
      return;
    }
    setSubmitting(true);
    try {
      const id = sessionId ?? (await startSession("diagnosis-step-1"));
      await saveDiagnosisIntent(id, {
        targetRole,
        timeline,
        currentStatus: currentStatus.trim(),
        consentAck: true,
        policyVersion: "diagnosis-v1",
      });
      navigate("/diagnosis/step-2");
    } catch (err: unknown) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save intent.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={2} component="form" onSubmit={(e) => void onSubmit(e)}>
      <DiagnosisStepper activeStep={0} />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Your goal
      </Typography>
      {!sessionId && sessionStarting ? (
        <Alert severity="info" role="status" sx={{ py: 0.5 }}>
          Connecting in the background… you can fill the form now.
        </Alert>
      ) : null}
      <TextField
        select
        label="Target role"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
        required
        disabled={submitting}
      >
        {["Scrum Master", "Product Owner", "SAFe Agilist", "Agile Coach"].map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Timeline"
        value={timeline}
        onChange={(e) => setTimeline(e.target.value)}
        required
        disabled={submitting}
      >
        {["1 month", "3 months", "6 months", "12 months"].map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Current status"
        value={currentStatus}
        onChange={(e) => setCurrentStatus(e.target.value)}
        placeholder="e.g. Developer transitioning to SM"
        required
        fullWidth
        disabled={submitting}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            disabled={submitting}
          />
        }
        label="I consent to resume analysis and personalized recommendations (diagnosis-v1)."
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {submitting ? "Saving…" : "Continue"}
      </Button>
    </Stack>
  );
}
