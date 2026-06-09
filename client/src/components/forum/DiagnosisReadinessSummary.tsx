import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ConfidenceTier } from "../../lib/forum-api";

const TIER_LABEL: Record<ConfidenceTier, { label: string; color: "success" | "info" | "warning" }> = {
  high: { label: "High confidence", color: "success" },
  medium: { label: "Moderate confidence", color: "info" },
  low: { label: "Lower confidence — validate with a mentor", color: "warning" },
};

type DiagnosisReadinessSummaryProps = {
  targetRole: string | null;
  readinessScore: number;
  summaryPlain: string;
  confidenceTier: ConfidenceTier;
  confidenceScore: number;
};

export function DiagnosisReadinessSummary({
  targetRole,
  readinessScore,
  summaryPlain,
  confidenceTier,
  confidenceScore,
}: DiagnosisReadinessSummaryProps) {
  const tier = TIER_LABEL[confidenceTier];

  return (
    <Card variant="outlined" sx={{ borderColor: confidenceTier === "low" ? "warning.light" : undefined }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Readiness for {targetRole ?? "your role"}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "baseline" }}>
          <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>
            {readinessScore}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            model confidence {Math.round(confidenceScore * 100)}%
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.55 }}>
          {summaryPlain}
        </Typography>
        <Chip label={tier.label} size="small" color={tier.color} variant={confidenceTier === "high" ? "outlined" : "filled"} />
      </CardContent>
    </Card>
  );
}
