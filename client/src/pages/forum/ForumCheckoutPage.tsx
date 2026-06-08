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
import { CheckoutPaymentModeSelector } from "../../components/forum/CheckoutPaymentModeSelector";
import { useAuth } from "../../contexts/AuthContext";
import { usePricing } from "../../contexts/PricingContext";
import { ApiRequestError } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";
import {
  redirectAfterCheckoutStart,
  resolveStubPaymentRef,
} from "../../lib/checkout-redirect";
import { getCommerceJourneyOrigin } from "../../lib/commerce-journey";
import { formatPrice } from "../../lib/format-price";
import {
  completeCheckout,
  getCart,
  listOfferings,
  startCheckout,
  type CartSummary,
  type InstallmentProvider,
  type OrgReimbursementInput,
  type PaymentMode,
} from "../../lib/forum-api";

export function ForumCheckoutPage() {
  const { user, loading } = useAuth();
  const { currency, geo } = usePricing();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [orgEligible, setOrgEligible] = useState(false);
  const [variant, setVariant] = useState<"standard" | "org_reimbursement">("standard");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full_pay");
  const [installmentProvider, setInstallmentProvider] = useState<InstallmentProvider | null>(null);
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
    void Promise.all([getCart({ geo, currency }), listOfferings()])
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
  }, [user, geo, currency]);

  const lineSummary = useMemo(
    () =>
      cart?.items.map((i) => (
        <Typography key={i.id} variant="body2">
          {i.offeringCode}
          {i.scheduleRef ? ` · ${i.scheduleRef}` : ""} — {formatPrice(i.currency, i.unitPrice)} × {i.quantity}
        </Typography>
      )),
    [cart],
  );

  const confirmLabel = useMemo(() => {
    if (variant === "org_reimbursement") {
      return "Submit org reimbursement request";
    }
    if (paymentMode === "installment" && installmentProvider) {
      return "Continue to installment checkout";
    }
    if (currency === "INR" || geo === "IN") {
      return "Continue to Razorpay";
    }
    return "Confirm payment";
  }, [currency, geo, installmentProvider, paymentMode, variant]);

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
      if (variant === "org_reimbursement") {
        trackEvent("checkout_org_submitted");
      }
      if (variant === "standard" && paymentMode === "installment" && installmentProvider) {
        trackEvent("installment_checkout_started", {
          provider: installmentProvider,
          origin: getCommerceJourneyOrigin(),
        });
      }
      trackEvent("checkout_started", {
        origin: getCommerceJourneyOrigin(),
        variant,
        paymentMode: variant === "standard" ? paymentMode : "full_pay",
      });

      const started = await startCheckout(variant, {
        orgReimbursement: variant === "org_reimbursement" ? org : undefined,
        paymentMode: variant === "standard" ? paymentMode : undefined,
        installmentProvider:
          variant === "standard" && paymentMode === "installment"
            ? (installmentProvider ?? undefined)
            : undefined,
        pricing: { geo, currency },
      });

      if (variant === "standard" && redirectAfterCheckoutStart(started, navigate)) {
        return;
      }

      const paymentRef =
        variant === "org_reimbursement"
          ? `org-po-${org.purchaseOrderNumber.trim()}`
          : resolveStubPaymentRef(started);

      const done = await completeCheckout(started.orderId, paymentRef);
      navigate("/checkout/success", {
        state: {
          orderNumber: done.order.orderNumber,
          orderId: done.order.id,
          variant: started.variant,
          paymentMode: started.paymentMode ?? "full_pay",
          installmentProvider: started.installmentProvider ?? null,
          paymentProvider: started.paymentProvider ?? null,
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
              Subtotal {formatPrice(cart.currency, cart.subtotal)}
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
          <FormControlLabel value="standard" control={<Radio />} label="Pay now (card or installment)" />
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
      ) : cart ? (
        <CheckoutPaymentModeSelector
          cartSubtotal={cart.subtotal}
          cartCurrency={cart.currency}
          paymentMode={paymentMode}
          installmentProvider={installmentProvider}
          onPaymentModeChange={setPaymentMode}
          onInstallmentProviderChange={setInstallmentProvider}
        />
      ) : null}

      <Box
        sx={{
          border: 1,
          borderStyle: "dashed",
          borderColor: "divider",
          borderRadius: 1,
          p: 1.5,
          fontSize: 13,
          color: "text.secondary",
        }}
      >
        Have a code? Coupon field collapsed here — not marketed on catalog (FR-179).
      </Box>

      {busy ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button
        variant="contained"
        size="large"
        disabled={busy || emptyCart || !cart}
        onClick={() => void pay()}
      >
        {confirmLabel}
      </Button>
    </Stack>
  );
}
