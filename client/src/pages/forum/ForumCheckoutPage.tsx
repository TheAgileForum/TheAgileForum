import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiRequestError } from "../../lib/api";
import {
  completeCheckout,
  getCart,
  listOfferings,
  startCheckout,
  type CartSummary,
  type OrgReimbursementInput,
} from "../../lib/forum-api";

export function ForumCheckoutPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [orgEligible, setOrgEligible] = useState(false);
  const [variant, setVariant] = useState<"standard" | "org_reimbursement">("standard");
  const [org, setOrg] = useState<OrgReimbursementInput>({
    organizationName: "",
    purchaseOrderNumber: "",
    billingContactEmail: user?.email ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emptyCart = cart !== null && cart.items.length === 0;

  useEffect(() => {
    if (!user) return;
    void Promise.all([getCart(), listOfferings()])
      .then(([cartRes, offerings]) => {
        setCart(cartRes);
        const eligibleCodes = new Set(
          offerings.filter((o) => o.safeOrgPaymentEligible).map((o) => o.code),
        );
        setOrgEligible(cartRes.items.some((i) => eligibleCodes.has(i.offeringCode)));
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiRequestError ? err.message : "Could not load cart.");
      });
  }, [user]);

  const lineSummary = useMemo(
    () =>
      cart?.items.map((i) => (
        <Typography key={i.id} variant="body2">
          {i.offeringCode}
          {i.scheduleRef ? ` · ${i.scheduleRef}` : ""} — {i.currency} {i.unitPrice} × {i.quantity}
        </Typography>
      )),
    [cart],
  );

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
    if (!cart || emptyCart) return;
    setBusy(true);
    setError(null);
    try {
      const started = await startCheckout(
        variant,
        variant === "org_reimbursement" ? org : undefined,
      );
      if (started.stripeCheckoutUrl) {
        window.location.href = started.stripeCheckoutUrl;
        return;
      }
      const paymentRef =
        variant === "org_reimbursement" ? `org-po-${org.purchaseOrderNumber.trim()}` : undefined;
      const done = await completeCheckout(started.orderId, paymentRef);
      navigate("/checkout/success", {
        state: {
          orderNumber: done.order.orderNumber,
          orderId: done.order.id,
          variant: started.variant,
        },
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
      <Typography color="text.secondary">Signed in as {user.email}</Typography>
      {loadError ? <Alert severity="error">{loadError}</Alert> : null}
      {emptyCart ? (
        <Alert severity="warning">
          Your cart is empty. <RouterLink to="/">Browse offers</RouterLink>
        </Alert>
      ) : (
        <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Order summary
          </Typography>
          {lineSummary}
          {cart ? (
            <Typography sx={{ mt: 1, fontWeight: 600 }}>
              Subtotal {cart.currency} {cart.subtotal}
            </Typography>
          ) : (
            <LinearProgress sx={{ mt: 1 }} />
          )}
        </Box>
      )}

      {orgEligible ? (
        <RadioGroup
          value={variant}
          onChange={(e) => setVariant(e.target.value as "standard" | "org_reimbursement")}
        >
          <FormControlLabel value="standard" control={<Radio />} label="Pay now (card or stub)" />
          <FormControlLabel
            value="org_reimbursement"
            control={<Radio />}
            label="Organization reimbursement (SAFe eligible)"
          />
        </RadioGroup>
      ) : null}

      {variant === "org_reimbursement" ? (
        <Stack spacing={1.5}>
          <TextField
            label="Organization name"
            value={org.organizationName}
            onChange={(e) => setOrg((o) => ({ ...o, organizationName: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Purchase order number"
            value={org.purchaseOrderNumber}
            onChange={(e) => setOrg((o) => ({ ...o, purchaseOrderNumber: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Billing contact email"
            type="email"
            value={org.billingContactEmail}
            onChange={(e) => setOrg((o) => ({ ...o, billingContactEmail: e.target.value }))}
            required
            fullWidth
          />
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Standard checkout uses stub payment when Stripe is not configured.
        </Typography>
      )}

      {busy ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button
        variant="contained"
        size="large"
        disabled={busy || emptyCart || !cart}
        onClick={() => void pay()}
      >
        {variant === "org_reimbursement" ? "Submit org reimbursement request" : "Confirm payment"}
      </Button>
    </Stack>
  );
}
