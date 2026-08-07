import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { EscalationOptions, PrimaryAction, SecondaryAction } from "../../lib/forum-api";
import { trackEvent } from "../../lib/analytics";
import { offerDetailPath } from "../../lib/offer-routes";
import { LowConfidenceEscalation } from "./LowConfidenceEscalation";

type DiagnosisActionModuleProps = {
  primaryAction: PrimaryAction;
  secondaryActions: SecondaryAction[];
  escalation: EscalationOptions | null;
  offerCode: string;
};

export function DiagnosisActionModule({
  primaryAction,
  secondaryActions,
  escalation,
  offerCode,
}: DiagnosisActionModuleProps) {
  const [snack, setSnack] = useState<string | null>(null);

  function handleSecondary(action: SecondaryAction) {
    trackEvent("diagnosis_secondary_action_click", { action: action.id });
    if (action.type === "micro_exam") {
      setSnack("Micro-exams unlock from your dashboard after you start a program.");
      return;
    }
    if (action.href.startsWith("mailto:") || action.href.startsWith("http")) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Stack spacing={2}>
      {escalation ? <LowConfidenceEscalation escalation={escalation} /> : null}

      <Card variant="outlined" sx={{ bgcolor: "primary.50", borderColor: "primary.light" }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            color="primary.dark"
            sx={{ fontWeight: 700, mb: 0.5 }}
          >
            Recommended next step
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            One primary action keeps your path focused—secondary options are below if you want alternatives.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This Live Project training is also a prerequisite for taking the PSM certification exam.
          </Typography>
          <Button
            variant="contained"
            size="large"
            fullWidth
            component={RouterLink}
            to={offerDetailPath(offerCode)}
            onClick={() => trackEvent("diagnosis_primary_cta_click", { offering: offerCode })}
          >
            {primaryAction.label}
          </Button>
        </CardContent>
      </Card>

      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
          Further steps
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          {secondaryActions.map((action) => (
            <Button
              key={action.id}
              variant="outlined"
              size="small"
              color={action.type === "mentor" && escalation ? "warning" : "inherit"}
              onClick={() => handleSecondary(action)}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Stack>
  );
}
