import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ConfidenceTier } from "../../lib/forum-api";

const TIER_LABEL: Record<ConfidenceTier, { label: string; color: "success" | "info" | "warning" }> = {
  high: { label: "Strong estimate", color: "success" },
  medium: { label: "Moderate estimate", color: "info" },
  low: { label: "Lower certainty — validate with a mentor", color: "warning" },
};

type DiagnosisReadinessSummaryProps = {
  targetRole: string | null;
  readinessScore: number;
  matchHeadline?: string;
  summaryPlain: string;
  confidenceTier: ConfidenceTier;
};

export function DiagnosisReadinessSummary({
  targetRole,
  readinessScore,
  matchHeadline,
  summaryPlain,
  confidenceTier,
}: DiagnosisReadinessSummaryProps) {
  const tier = TIER_LABEL[confidenceTier];
  const role = targetRole ?? "your target role";
  const headline =
    matchHeadline ??
    (readinessScore < 50
      ? `Your resume is just ${readinessScore}% match to ${role}`
      : readinessScore < 75
        ? `Your resume is a ${readinessScore}% match to ${role}`
        : `Your resume is a strong ${readinessScore}% match to ${role}`);

  // Strip a leading match sentence if the API still embeds it in summaryPlain.
  const supportingPlain = summaryPlain.startsWith(headline)
    ? summaryPlain.slice(headline.length).replace(/^[.\s]+/, "").trim()
    : summaryPlain;

  return (
    <Card variant="outlined" sx={{ borderColor: confidenceTier === "low" ? "warning.light" : undefined }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Resume match for {role}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mb: 1, alignItems: "baseline" }}>
          <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>
            {readinessScore}%
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
            {headline}
          </Typography>
        </Stack>
        {supportingPlain ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.55 }}>
            {supportingPlain}
          </Typography>
        ) : null}
        <Chip label={tier.label} size="small" color={tier.color} variant={confidenceTier === "high" ? "outlined" : "filled"} />
      </CardContent>
    </Card>
  );
}
