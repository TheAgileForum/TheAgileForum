import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ApiRequestError } from "../../lib/api";
import { completeCheckout } from "../../lib/forum-api";
import type { InstallmentProvider, PaymentMode } from "../../lib/forum-api";

type RazorpayStubState = {
  orderId: string;
  orderNumber?: string;
  variant?: "standard" | "org_reimbursement";
  paymentMode?: PaymentMode;
  installmentProvider?: InstallmentProvider | null;
};

export function ForumRazorpayStubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const state = location.state as RazorpayStubState | null;
  const paymentRef = params.get("ref");
  const orderNumber = params.get("order") ?? state?.orderNumber;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = state?.orderId;

  async function confirmPayment() {
    if (!orderId || !paymentRef) {
      setError("Missing order or payment reference. Return to checkout and try again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const done = await completeCheckout(orderId, paymentRef);
      navigate("/checkout/success", {
        replace: true,
        state: {
          orderNumber: done.order.orderNumber,
          orderId: done.order.id,
          variant: state?.variant ?? "standard",
          paymentMode: state?.paymentMode ?? "full_pay",
          installmentProvider: state?.installmentProvider ?? null,
          paymentProvider: "razorpay",
        },
      });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Payment confirmation failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!orderId || !paymentRef) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Razorpay checkout
        </Typography>
        <Alert severity="error">
          This payment session is invalid or expired. Start checkout again from your cart.
        </Alert>
        <Button variant="contained" onClick={() => navigate("/checkout")}>
          Back to checkout
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Razorpay (test mode)
      </Typography>
      <Typography color="text.secondary">
        Confirm payment for order {orderNumber ?? orderId}. This stub simulates Razorpay full-pay for
        India geo (FR-170).
      </Typography>
      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 12 }}>
        {paymentRef}
      </Typography>
      {busy ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button variant="contained" size="large" disabled={busy} onClick={() => void confirmPayment()}>
        Pay with Razorpay (stub)
      </Button>
      <Button variant="text" disabled={busy} onClick={() => navigate("/checkout")}>
        Cancel
      </Button>
    </Stack>
  );
}
