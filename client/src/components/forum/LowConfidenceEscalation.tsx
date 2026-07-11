import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { EscalationOptions } from "../../lib/forum-api";
import { trackEvent } from "../../lib/analytics";

type LowConfidenceEscalationProps = {
  escalation: EscalationOptions;
};

export function LowConfidenceEscalation({ escalation }: LowConfidenceEscalationProps) {
  return (
    <Alert severity="warning" sx={{ alignItems: "flex-start" }}>
      <AlertTitle sx={{ fontWeight: 700 }}>{escalation.title}</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        {escalation.message}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button
          variant="contained"
          color="warning"
          size="medium"
          href={escalation.mentorHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("diagnosis_mentor_escalation_click")}
        >
          {escalation.mentorCtaLabel}
        </Button>
        <Button variant="outlined" color="inherit" size="medium" href={escalation.supportHref}>
          Contact support
        </Button>
      </Stack>
      <Typography variant="caption" sx={{ mt: 1.5, color: "text.secondary", display: "block" }}>
        Geo pricing: India ₹49 · USA $9 · Override via session currency when booking opens.
      </Typography>
      <Link href={escalation.supportHref} variant="caption" sx={{ display: "block", mt: 0.5 }}>
        Prefer email? Write to support
      </Link>
    </Alert>
  );
}
