import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { RoleBasedUpsellRail } from "../../components/forum/RoleBasedUpsellRail";
import { useAuth } from "../../contexts/AuthContext";
import { useForumCart } from "../../contexts/ForumCartContext";
import { usePricing } from "../../contexts/PricingContext";
import { ApiRequestError } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";
import { setCommerceJourneyOrigin } from "../../lib/commerce-journey";
import { formatPrice } from "../../lib/format-price";
import { getStoredDiagnosisGapTags, getStoredDiagnosisTargetRole, listOfferings } from "../../lib/forum-api";

export function ForumCartPage() {
  const { user } = useAuth();
  const { cart, loading, itemCount, removeItem, setQuantity, addItem, refresh } = useForumCart();
  const navigate = useNavigate();
  const { currency } = usePricing();
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setCommerceJourneyOrigin("catalog");
  }, []);

  useEffect(() => {
    void listOfferings().then((items) => {
      const map: Record<string, string> = {};
      items.forEach((o) => {
        map[o.code] = o.title;
      });
      setTitles(map);
    });
  }, []);

  const empty = !cart || cart.items.length === 0;

  useEffect(() => {
    void refresh();
  }, [currency, refresh]);

  const upsellRole = getStoredDiagnosisTargetRole();
  const upsellGaps = getStoredDiagnosisGapTags();

  async function handleRemove(itemId: string) {
    setBusyId(itemId);
    setError(null);
    try {
      await removeItem(itemId);
      trackEvent("cart_line_removed");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not remove item.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleQty(itemId: string, quantity: number) {
    setBusyId(itemId);
    setError(null);
    try {
      await setQuantity(itemId, quantity);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update quantity.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LinearProgress />;

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
        Your cart · {itemCount} {itemCount === 1 ? "item" : "items"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {user ? "Signed in" : "Guest cart"} · Session currency {currency} · No promo chips (FR-179)
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {empty ? (
        <Alert severity="info">
          Your cart is empty.{" "}
          <RouterLink to="/trainings">Browse trainings</RouterLink> or start with{" "}
          <RouterLink to="/diagnosis/step-1">diagnosis</RouterLink>.
        </Alert>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              {cart!.items.map((line) => (
                <Stack
                  key={line.id}
                  direction={{ xs: "column", sm: "row" }}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: { sm: "flex-start" },
                    gap: 1,
                    borderBottom: 1,
                    borderColor: "divider",
                    pb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">
                      {titles[line.offeringCode] ?? line.offeringCode}
                    </Typography>
                    {line.scheduleRef ? (
                      <Typography variant="caption" color="text.secondary">
                        Schedule: {line.scheduleRef}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {formatPrice(line.currency, line.unitPrice)} each
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <TextField
                      select
                      size="small"
                      label="Qty"
                      value={line.quantity}
                      disabled={busyId === line.id}
                      onChange={(e) => void handleQty(line.id, Number(e.target.value))}
                      sx={{ width: 80 }}
                    >
                      {[1, 2, 3].map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      size="small"
                      color="inherit"
                      disabled={busyId === line.id}
                      onClick={() => void handleRemove(line.id)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Stack>
              ))}
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Subtotal {formatPrice(cart!.currency, cart!.subtotal)}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!empty ? (
        <RoleBasedUpsellRail
          targetRole={upsellRole}
          context="cart"
          gapTags={upsellGaps}
          onAddOffering={(code, scheduleRef, label) => addItem(code, scheduleRef, label)}
        />
      ) : null}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button variant="outlined" component={RouterLink} to="/trainings">
          Continue browsing
        </Button>
        {!empty ? (
          <Button
            variant="contained"
            onClick={() => navigate(user ? "/checkout" : "/login", { state: { returnTo: "/checkout" } })}
          >
            {user ? "Proceed to checkout" : "Sign in to checkout"}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
