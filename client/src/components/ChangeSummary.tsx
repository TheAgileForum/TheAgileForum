import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DecisionRationale } from "./DecisionRationale";

/** UX-DR3 — before/after disruption summary for recovery flows. */
export function ChangeSummary({
  beforeLabel,
  afterLabel,
  onAccept,
  onEditCart,
  onCancel,
}: {
  beforeLabel: string;
  afterLabel: string;
  onAccept?: () => void;
  onEditCart?: () => void;
  onCancel?: () => void;
}) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">We adjusted your order</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">
            Before
          </Typography>
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: "action.hover", mt: 0.5 }}>
            <Typography variant="body2">{beforeLabel}</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">
            After
          </Typography>
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: "primary.main", color: "primary.contrastText", mt: 0.5 }}>
            <Typography variant="body2">{afterLabel}</Typography>
          </Box>
        </Grid>
      </Grid>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Chip label="ETA +4 min" color="warning" size="small" />
        <Chip label="Same total" color="success" size="small" variant="outlined" />
      </Stack>
      <DecisionRationale
        summary="Why we proposed this"
        details="Kitchen load exceeded prep window for penne. Substituting fusilli keeps quality and avoids canceling the line."
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="contained" color="primary" onClick={onAccept} fullWidth>
          Accept changes
        </Button>
        <Button variant="outlined" onClick={onEditCart} fullWidth>
          Edit cart
        </Button>
        <Button color="inherit" onClick={onCancel} fullWidth>
          Cancel order
        </Button>
      </Stack>
    </Stack>
  );
}
