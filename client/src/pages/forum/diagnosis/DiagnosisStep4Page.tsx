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
import { trackEvent } from "../../../lib/analytics";
import { getAnalysisResult, storeDiagnosisPersonalization, type AnalysisResult } from "../../../lib/forum-api";

export function DiagnosisStep4Page() {
  const navigate = useNavigate();
  const { runId, sessionId } = useDiagnosis();
  const { addItem } = useForumCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getAnalysisResult(runId);
        if (cancelled) return;
        setResult(res);
        storeDiagnosisPersonalization(res.targetRole, res.insights.gaps);
        trackEvent("diagnosis_results_viewed", {
          tier: res.confidenceTier,
          score: res.readinessScore,
        });
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

  const offerCode =
    result?.primaryAction.offeringCode ?? "course-agile-fundamentals";

  return (
    <Stack spacing={2.5}>
      <DiagnosisStepper activeStep={3} />
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
        Your diagnosis results
      </Typography>

      {loading ? (
        <Typography color="text.secondary">Loading results…</Typography>
      ) : error || !result ? (
        <Alert severity="error">{error ?? "Could not load results."}</Alert>
      ) : (
        <>
          <DiagnosisReadinessSummary
            targetRole={result.targetRole}
            readinessScore={result.readinessScore}
            summaryPlain={result.summaryPlain}
            confidenceTier={result.confidenceTier}
            confidenceScore={result.insights.confidence}
          />

          <Card variant="outlined">
            <CardContent>
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
            onAddOffering={(code, scheduleRef, label) => addItem(code, scheduleRef, label)}
          />
        </>
      )}
    </Stack>
  );
}
