import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { OrderTimeline } from "../../components/OrderTimeline";
import { TRACKING_STEPS } from "../../demo/mockData";
import { statusChipProps } from "../../lib/statusMapping";

export function OrderTrackPage() {
  const { orderId } = useParams();
  const chip = statusChipProps("preparing");

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Order {orderId}
        </Typography>
        <Chip size="small" label={chip.label} color={chip.color} />
      </Stack>
      <Typography color="text.secondary">ETA window: 24–32 min (demo)</Typography>
      <OrderTimeline steps={TRACKING_STEPS} variant="customer" />
    </Stack>
  );
}
