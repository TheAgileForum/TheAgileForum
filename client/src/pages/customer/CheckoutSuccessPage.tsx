import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useLocation } from "react-router-dom";

type LocationState = { orderId?: string };

export function CheckoutSuccessPage() {
  const { state } = useLocation();
  const orderId = (state as LocationState | null)?.orderId ?? "ord-demo";

  return (
    <Stack spacing={2}>
      <Alert severity="success">Order placed</Alert>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Thank you
      </Typography>
      <Typography>
        Order ID:{" "}
        <Typography component="span" sx={{ fontFamily: "monospace" }}>
          {orderId}
        </Typography>
      </Typography>
      <Button variant="contained" component={RouterLink} to={`/orders/${orderId}`}>
        Track order
      </Button>
      <Button component={RouterLink} to="/demo/menu">
        Order something else
      </Button>
    </Stack>
  );
}
