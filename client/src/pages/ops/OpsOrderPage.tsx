import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { OrderTimeline } from "../../components/OrderTimeline";
import { TRACKING_STEPS } from "../../demo/mockData";
import { DecisionRationale } from "../../components/DecisionRationale";

export function OpsOrderPage() {
  const { id } = useParams();

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Ops intervention — {id}
      </Typography>
      <DecisionRationale
        summary="Automation proposal"
        details="Courier reassignment suggested due to SLA risk; customer ETA improves by 6 minutes."
        defaultExpanded
      />
      <OrderTimeline steps={TRACKING_STEPS} variant="internal" />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
        <Button variant="contained">Apply override</Button>
        <Button variant="outlined">Reassign courier (demo)</Button>
      </Stack>
    </Stack>
  );
}
