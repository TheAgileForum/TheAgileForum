import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { DecisionRationale } from "../../components/DecisionRationale";
import { OrderTimeline } from "../../components/OrderTimeline";
import { TRACKING_STEPS } from "../../demo/mockData";

export function IncidentDetailPage() {
  const { id } = useParams();

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Incident {id}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Context
            </Typography>
            <Typography variant="body2">Order ord-1041 · Tenant demo-east · Payment provider mock-01</Typography>
            <Button sx={{ mt: 2 }} size="small" variant="outlined">
              Copy summary
            </Button>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Timeline
            </Typography>
            <OrderTimeline steps={TRACKING_STEPS} variant="internal" />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Actions
            </Typography>
            <Stack spacing={1}>
              <Button variant="contained" fullWidth>
                Trigger customer comms (demo)
              </Button>
              <Button variant="outlined" fullWidth>
                Flag for ops
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <DecisionRationale
        summary="Prior agent notes"
        details="Retry captured payment after idempotency key refresh; no double charge observed in shadow ledger."
        defaultExpanded
      />
    </Stack>
  );
}
