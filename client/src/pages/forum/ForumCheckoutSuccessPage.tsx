import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useLocation } from "react-router-dom";

export function ForumCheckoutSuccessPage() {
  const location = useLocation();
  const state = location.state as { orderNumber?: string; orderId?: string } | null;

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Payment confirmed
      </Typography>
      <Typography color="text.secondary">
        Order {state?.orderNumber ?? state?.orderId ?? "—"} is confirmed.
        {(state as { variant?: string } | null)?.variant === "org_reimbursement"
          ? " Your organization reimbursement request was submitted to ops."
          : " Welcome to your program."}
      </Typography>
      <Button variant="contained" component={RouterLink} to="/">
        Back to home
      </Button>
    </Stack>
  );
}
