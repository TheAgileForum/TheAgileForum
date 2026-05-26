import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { OrderTimeline } from "../../components/OrderTimeline";
import { TRACKING_STEPS } from "../../demo/mockData";
import { statusChipProps } from "../../lib/statusMapping";

export function OrderDetailPage() {
  const { id } = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const chip = statusChipProps("new");

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Order {id}
        </Typography>
        <Chip label={chip.label} color={chip.color} size="small" />
        <Chip label="Reroute" color="warning" size="small" variant="outlined" />
      </Stack>
      <OrderTimeline steps={TRACKING_STEPS} variant="internal" />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
        <Button variant="contained" color="success" onClick={() => setConfirmOpen(true)}>
          Accept
        </Button>
        <Button variant="outlined" color="error">
          Reject
        </Button>
      </Stack>
      <TextField label="Reject reason (demo)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} fullWidth multiline minRows={2} />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Accept order?</DialogTitle>
        <DialogContent>This confirms prep will start for the current line (demo).</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setConfirmOpen(false)}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
