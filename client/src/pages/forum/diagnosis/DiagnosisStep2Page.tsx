import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiagnosisStepper } from "../../../components/forum/DiagnosisStepper";
import { ResumeDropZone } from "../../../components/forum/ResumeDropZone";
import { useDiagnosis } from "../../../contexts/DiagnosisContext";
import { ApiRequestError } from "../../../lib/api";
import { trackEvent } from "../../../lib/analytics";
import { requestAnalysis, saveJdInput, uploadResumeMetadata } from "../../../lib/forum-api";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_MB = 5;
const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function draftKey(sessionId: string) {
  return `af_diagnosis_step2_${sessionId}`;
}

type Step2Draft = { jdText: string; targetRole: string };

function inferResumeMimeType(file: File): string {
  if (file.type && ALLOWED_TYPES.includes(file.type)) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return file.type;
}

export function DiagnosisStep2Page() {
  const navigate = useNavigate();
  const { sessionId, setRunId } = useDiagnosis();
  const [tab, setTab] = useState(0);
  const [jdText, setJdText] = useState("");
  const [targetRole, setTargetRole] = useState("Scrum Master");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    try {
      const raw = sessionStorage.getItem(draftKey(sessionId));
      if (!raw) return;
      const draft = JSON.parse(raw) as Step2Draft;
      setJdText(draft.jdText ?? "");
      setTargetRole(draft.targetRole ?? "Scrum Master");
    } catch {
      /* ignore corrupt draft */
    }
  }, [sessionId]);

  const persistDraft = useCallback(() => {
    if (!sessionId) return;
    sessionStorage.setItem(draftKey(sessionId), JSON.stringify({ jdText, targetRole }));
    setDraftSaved(true);
    const t = window.setTimeout(() => setDraftSaved(false), 2000);
    return () => window.clearTimeout(t);
  }, [sessionId, jdText, targetRole]);

  useEffect(() => {
    if (!sessionId) return;
    const timer = window.setTimeout(persistDraft, 600);
    return () => window.clearTimeout(timer);
  }, [sessionId, jdText, targetRole, persistDraft]);

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
      trackEvent("diagnosis_resume_upload_failure", { reason: "missing_file" });
      return;
    }
    if (!ALLOWED_TYPES.includes(inferResumeMimeType(file))) {
      setError("Only PDF, DOC, or DOCX files are supported.");
      trackEvent("diagnosis_resume_upload_failure", { reason: "invalid_type" });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB}MB.`);
      trackEvent("diagnosis_resume_upload_failure", { reason: "oversize" });
      return;
    }
    setSubmitting(true);
    try {
      const sid = sessionId;
      if (!sid) {
        setError("Session missing.");
        return;
      }
      const mimeType = inferResumeMimeType(file);
      await uploadResumeMetadata(sid, {
        fileName: file.name,
        mimeType,
        sizeBytes: file.size,
      });
      const trimmedJd = jdText.trim();
      if (trimmedJd) {
        await saveJdInput(sid, { jdText: trimmedJd, targetRole });
      }
      trackEvent("diagnosis_resume_upload_success", { hasJd: Boolean(jdText.trim()) });
      const run = await requestAnalysis(sid, "user-initiated");
      setRunId(run.analysisRunId);
      sessionStorage.removeItem(draftKey(sid));
      navigate("/diagnosis/step-3");
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Upload or analysis request failed.";
      setError(message);
      trackEvent("diagnosis_resume_upload_failure", { reason: "api_error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <DiagnosisStepper activeStep={1} />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Resume &amp; job context
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Upload resume" />
        <Tab label="Paste JD (optional)" />
      </Tabs>
      {tab === 0 ? (
        <ResumeDropZone file={file} onFile={setFile} maxMb={MAX_MB} accept={ACCEPT} />
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
      {tab === 0 && jdText ? (
        <Typography variant="caption" color="text.secondary">
          JD draft saved · switch to Paste JD tab to edit
        </Typography>
      ) : null}
      {draftSaved ? (
        <Typography variant="caption" color="success.main">
          Draft saved
        </Typography>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button variant="contained" size="large" disabled={submitting} onClick={() => void onAnalyze()}>
        Run analysis
      </Button>
    </Stack>
  );
}
