import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useSearchParams } from "react-router-dom";
import { ApiRequestError } from "../../lib/api";
import { confirmStripeCheckout } from "../../lib/forum-api";
import type { InstallmentProvider, PaymentProvider } from "../../lib/forum-api";

const PROVIDER_LABELS: Record<InstallmentProvider, string> = {
  razorpay_emi: "Razorpay EMI",
  affirm: "Affirm",
  klarna: "Klarna",
  clearpay: "Clearpay",
  afterpay: "Afterpay",
  zip: "Zip",
};

type SuccessState = {
  orderNumber?: string;
  orderId?: string;
  variant?: "standard" | "org_reimbursement";
  paymentMode?: "full_pay" | "installment";
  installmentProvider?: InstallmentProvider | null;
  paymentProvider?: PaymentProvider | null;
};

function paymentModeLabel(state: SuccessState | null): string | null {
  if (!state || state.variant === "org_reimbursement") return null;
  if (state.paymentMode === "installment" && state.installmentProvider) {
    return `Installment · ${PROVIDER_LABELS[state.installmentProvider]}`;
  }
  if (state.paymentProvider === "razorpay") {
    return "Paid in full · Razorpay";
  }
  if (state.paymentProvider === "stripe") {
    return "Paid in full · Card (Stripe)";
  }
  return "Paid in full";
}

export function ForumCheckoutSuccessPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const routeState = location.state as SuccessState | null;

  const orderNumber = routeState?.orderNumber ?? params.get("order") ?? undefined;
  const orderId = routeState?.orderId ?? params.get("orderId") ?? undefined;
  const stripeSessionId = params.get("session_id");
  const isStripeReturn = params.get("provider") === "stripe" && Boolean(stripeSessionId && orderId);

  const [state, setState] = useState<SuccessState | null>(
    routeState ?? {
      orderNumber,
      orderId,
      paymentProvider: isStripeReturn ? "stripe" : null,
      paymentMode: "full_pay",
    },
  );
  const [busy, setBusy] = useState(isStripeReturn);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isStripeReturn || !orderId || !stripeSessionId) return;

    void (async () => {
      try {
        const done = await confirmStripeCheckout({
          orderId,
          stripeSessionId,
        });
        setState((prev) => ({
          ...prev,
          orderId: done.order.id,
          orderNumber: done.order.orderNumber,
          paymentProvider: "stripe",
          paymentMode: "full_pay",
        }));
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not confirm Stripe payment. Your card may have been charged — contact support with your order number.",
        );
      } finally {
        setBusy(false);
      }
    })();
  }, [isStripeReturn, orderId, stripeSessionId]);

  const modeLabel = paymentModeLabel(state);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Payment confirmed
      </Typography>
      {busy ? <LinearProgress /> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Typography color="text.secondary">
        Order {state?.orderNumber ?? state?.orderId ?? orderNumber ?? "—"} is confirmed.
        {state?.variant === "org_reimbursement"
          ? " Your organization reimbursement request was submitted to ops."
          : busy
            ? " Confirming your Stripe payment…"
            : " Welcome to your program."}
      </Typography>
      {modeLabel ? (
        <Typography variant="body2" color="text.secondary">
          Payment method: {modeLabel}
        </Typography>
      ) : null}
      <Button variant="contained" component={RouterLink} to="/">
        Back to home
      </Button>
    </Stack>
  );
}
