import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiRequestError } from "../../lib/api";
import { completeCheckout, startCheckout } from "../../lib/forum-api";

export function ForumCheckoutPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <LinearProgress />;
  if (!user) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Checkout</Typography>
        <Alert severity="info">Sign in to complete your purchase.</Alert>
        <Button variant="contained" component={RouterLink} to="/login" state={{ returnTo: "/checkout" }}>
          Sign in
        </Button>
      </Stack>
    );
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const started = await startCheckout("standard");
      const done = await completeCheckout(started.orderId);
      navigate("/checkout/success", {
        state: { orderNumber: done.order.orderNumber, orderId: done.order.id },
      });
    } catch (err) {
      setError(err instanceof ApiRequestError ? `${err.code}: ${err.message}` : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Checkout
      </Typography>
      <Typography color="text.secondary">
        Signed in as {user.email}. Demo uses stub payment — no card required.
      </Typography>
      {busy ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button variant="contained" size="large" disabled={busy} onClick={() => void pay()}>
        Confirm payment
      </Button>
    </Stack>
  );
}
