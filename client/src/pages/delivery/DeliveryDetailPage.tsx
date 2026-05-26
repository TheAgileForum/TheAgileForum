import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useParams } from "react-router-dom";
import { DELIVERY_TASKS } from "../../demo/mockData";
import { statusChipProps } from "../../lib/statusMapping";

export function DeliveryDetailPage() {
  const { id } = useParams();
  const task = DELIVERY_TASKS.find((t) => t.id === id) ?? DELIVERY_TASKS[0];
  const c = statusChipProps(task.status.replace(/\s+/g, "_").toLowerCase());

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Task {task.id}
        </Typography>
        <Chip label={c.label} color={c.color} size="small" />
      </Stack>
      <Typography>{task.address}</Typography>
      <Typography color="text.secondary">ETA {task.eta}</Typography>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Milestones
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap" }}>
        <Button variant="outlined">Arrived at pickup</Button>
        <Button variant="outlined">Picked up</Button>
        <Button variant="contained">Delivered</Button>
      </Stack>
    </Stack>
  );
}
