import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

export function CheckoutPage() {
  const { lines, totalCents, clear } = useCart();
  const [validating, setValidating] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const navigate = useNavigate();

  if (lines.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Checkout</Typography>
        <Typography color="text.secondary">Add items before checkout.</Typography>
        <Button component={RouterLink} to="/demo/menu" variant="contained">
          Menu
        </Button>
      </Stack>
    );
  }

  async function placeOrder() {
    setValidating(true);
    setBlocked(false);
    await new Promise((r) => setTimeout(r, 900));
    setValidating(false);
    const conflict = Math.random() > 0.55;
    if (conflict) {
      setBlocked(true);
      return;
    }
    const orderId = `ord-${Date.now()}`;
    clear();
    navigate("/checkout/success", { state: { orderId } });
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Checkout
      </Typography>
      {validating ? <LinearProgress /> : null}
      <Typography color="text.secondary">Modeled ETA: 28–36 min · Demo validation simulates occasional conflicts.</Typography>
      <Stack spacing={1}>
        {lines.map(({ item, qty }) => (
          <Typography key={item.id}>
            {qty}× {item.name} — ${((item.priceCents * qty) / 100).toFixed(2)}
          </Typography>
        ))}
      </Stack>
      <Typography sx={{ fontWeight: 600 }}>Total ${(totalCents / 100).toFixed(2)}</Typography>
      {blocked ? (
        <Alert severity="warning">
          Kitchen can&apos;t fulfill as ordered.{" "}
          <Button size="small" component={RouterLink} to="/recovery">
            Open recovery
          </Button>
        </Alert>
      ) : null}
      <Button variant="contained" size="large" disabled={validating} onClick={() => void placeOrder()}>
        Place order
      </Button>
      <Typography variant="body2">
        <RouterLink to="/consent">Review consent</RouterLink>
      </Typography>
    </Stack>
  );
}
