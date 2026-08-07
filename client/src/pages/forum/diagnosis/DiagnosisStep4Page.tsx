import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiagnosisActionModule } from "../../../components/forum/DiagnosisActionModule";
import { DiagnosisReadinessSummary } from "../../../components/forum/DiagnosisReadinessSummary";
import { DiagnosisStepper } from "../../../components/forum/DiagnosisStepper";
import { RecommendationRationaleCard } from "../../../components/forum/RecommendationRationaleCard";
import { RoadmapPreview } from "../../../components/forum/RoadmapPreview";
import { RoleBasedUpsellRail } from "../../../components/forum/RoleBasedUpsellRail";
import { SkillGapPanel } from "../../../components/forum/SkillGapPanel";
import { useDiagnosis } from "../../../contexts/DiagnosisContext";
import { useForumCart } from "../../../contexts/ForumCartContext";
import { ApiRequestError } from "../../../lib/api";
import { trackEvent } from "../../../lib/analytics";
import {
  cacheAnalysisResult,
  getAnalysisResult,
  getCachedAnalysisResult,
  getStoredRunId,
  storeDiagnosisPersonalization,
  type AnalysisResult,
} from "../../../lib/forum-api";
import { MENTORSHIP_OFFER_CODE } from "../../../lib/offer-routes";

export function DiagnosisStep4Page() {
  const navigate = useNavigate();
  const { runId, sessionId, resumeLoading, setRunId } = useDiagnosis();
  const { addItem } = useForumCart();
  const effectiveRunId = runId ?? getStoredRunId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(() => {
    const id = runId ?? getStoredRunId();
    return id ? getCachedAnalysisResult(id) : null;
  });

  useEffect(() => {
    if (!runId && effectiveRunId) setRunId(effectiveRunId);
  }, [runId, effectiveRunId, setRunId]);

  useEffect(() => {
    if (resumeLoading) return;
    if (!effectiveRunId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const cached = getCachedAnalysisResult(effectiveRunId);
    if (cached) {
      setResult(cached);
      setError(null);
      setLoading(false);
    }

    const load = async () => {
      try {
        const res = await getAnalysisResult(effectiveRunId);
        if (cancelled) return;
        setResult(res);
        setError(null);
        cacheAnalysisResult(effectiveRunId, res);
        storeDiagnosisPersonalization(res.targetRole, res.insights.gaps);
        trackEvent("diagnosis_results_viewed", {
          tier: res.confidenceTier,
          score: res.readinessScore,
        });
      } catch (err) {
        if (cancelled) return;
        // Keep cached results visible when revalidation fails (e.g. after View → /offers → back).
        if (cached || getCachedAnalysisResult(effectiveRunId)) {
          setError(null);
          return;
        }
        const notReady =
          err instanceof ApiRequestError &&
          (err.status === 409 || err.code === "ANALYSIS_NOT_READY");
        setError(notReady ? "Results not ready yet." : "Could not load results. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [effectiveRunId, resumeLoading]);

  if (resumeLoading) {
    return <Typography color="text.secondary">Restoring your results…</Typography>;
  }

  if (!sessionId || !effectiveRunId) {
    return (
      <Alert severity="warning">
        No results available.{" "}
        <Button size="small" onClick={() => navigate("/diagnosis/step-1")}>
          Start diagnosis
        </Button>
      </Alert>
    );
  }

  const offerCode = result?.primaryAction.offeringCode ?? MENTORSHIP_OFFER_CODE;

  return (
    <Stack spacing={2.5}>
      <DiagnosisStepper activeStep={3} />
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
        Your diagnosis results
      </Typography>

      {loading && !result ? (
        <Typography color="text.secondary">Loading results…</Typography>
      ) : error || !result ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setLoading(true);
                setError(null);
                void getAnalysisResult(effectiveRunId)
                  .then((res) => {
                    setResult(res);
                    cacheAnalysisResult(effectiveRunId, res);
                    storeDiagnosisPersonalization(res.targetRole, res.insights.gaps);
                  })
                  .catch(() => setError("Could not load results. Please try again."))
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </Button>
          }
        >
          {error ?? "Could not load results."}
        </Alert>
      ) : (
        <>
          {result.usedStubFallback ? (
            <Alert severity="info">
              Quick estimate based on your role — AI analysis temporarily unavailable.
            </Alert>
          ) : null}

          {result.resumeInputStatus === "unreadable" ? (
            <Alert severity="warning">
              We couldn&apos;t read text from your resume file — try a text-based PDF or DOCX (not a
              scanned/image PDF). The match % below is a limited estimate until we can read your resume.
            </Alert>
          ) : null}

          {result.resumeInputStatus === "missing" ? (
            <Alert severity="info">
              No resume was provided, so this estimate is based on your role and other answers only.
            </Alert>
          ) : null}

          <DiagnosisReadinessSummary
            targetRole={result.targetRole}
            readinessScore={result.readinessScore}
            matchHeadline={result.matchHeadline}
            summaryPlain={result.summaryPlain}
            confidenceTier={result.confidenceTier}
          />

          <Card variant="outlined" sx={{ overflow: "visible", minWidth: 0 }}>
            <CardContent sx={{ minWidth: 0, overflow: "visible" }}>
              <SkillGapPanel strengths={result.insights.strengths} gaps={result.insights.gaps} />
            </CardContent>
          </Card>

          <RoadmapPreview milestones={result.roadmapPreview} />

          <RecommendationRationaleCard rationale={result.rationale} />

          <DiagnosisActionModule
            primaryAction={result.primaryAction}
            secondaryActions={result.secondaryActions}
            escalation={result.escalation}
            offerCode={offerCode}
          />

          <RoleBasedUpsellRail
            targetRole={result.targetRole}
            context="diagnosis"
            gapTags={result.insights.gaps}
            yearsOfExperience={result.yearsOfExperience}
            onAddOffering={(code, scheduleRef, label) => addItem(code, scheduleRef, label)}
          />
        </>
      )}
    </Stack>
  );
}
