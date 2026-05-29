import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiagnosisStepper } from "../../../components/forum/DiagnosisStepper";
import { useDiagnosis } from "../../../contexts/DiagnosisContext";
import { ApiRequestError } from "../../../lib/api";
import { requestAnalysis, saveJdInput, uploadResumeMetadata } from "../../../lib/forum-api";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_MB = 5;

export function DiagnosisStep2Page() {
  const navigate = useNavigate();
  const { sessionId, setRunId } = useDiagnosis();
  const [tab, setTab] = useState(0);
  const [jdText, setJdText] = useState("");
  const [targetRole, setTargetRole] = useState("Scrum Master");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!sessionId) {
    return (
      <Alert severity="warning">
        No active session.{" "}
        <Button size="small" onClick={() => navigate("/diagnosis/step-1")}>
          Start at step 1
        </Button>
      </Alert>
    );
  }

  async function onAnalyze() {
    setError(null);
    if (!file) {
      setError("Upload a resume (PDF or Word) before running analysis.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, DOC, or DOCX files are supported.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB}MB.`);
      return;
    }
    setSubmitting(true);
    try {
      const sid = sessionId;
      if (!sid) {
        setError("Session missing.");
        return;
      }
      await uploadResumeMetadata(sid, {
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      if (jdText.trim()) {
        await saveJdInput(sid, { jdText: jdText.trim(), targetRole });
      }
      const run = await requestAnalysis(sid, "user-initiated");
      setRunId(run.analysisRunId);
      navigate("/diagnosis/step-3");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload or analysis request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <DiagnosisStepper activeStep={1} />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Resume & job context
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Upload resume" />
        <Tab label="Paste JD (optional)" />
      </Tabs>
      {tab === 0 ? (
        <Stack spacing={1}>
          <Button variant="outlined" component="label">
            {file ? file.name : "Choose file"}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          <Typography variant="caption" color="text.secondary">
            PDF or Word, max {MAX_MB}MB
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <TextField
            label="Target role for JD match"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            fullWidth
          />
          <TextField
            label="Job description"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            multiline
            minRows={4}
            fullWidth
            placeholder="Paste JD text to improve gap analysis (optional)"
          />
        </Stack>
      )}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button variant="contained" size="large" disabled={submitting} onClick={() => void onAnalyze()}>
        Run analysis
      </Button>
    </Stack>
  );
}
