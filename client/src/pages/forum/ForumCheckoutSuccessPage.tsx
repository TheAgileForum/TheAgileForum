import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useSearchParams } from "react-router-dom";
import { ApiRequestError } from "../../lib/api";
import {
  confirmRazorpayCheckout,
  confirmStripeCheckout,
  type InstallmentProvider,
  type PaymentMode,
  type PaymentProvider,
} from "../../lib/forum-api";

const PROVIDER_LABELS: Record<InstallmentProvider, string> = {
  razorpay_emi: "Razorpay EMI",
  affirm: "Affirm",
  klarna: "Klarna",
  clearpay: "Clearpay",
  afterpay: "Afterpay",
  zip: "Zip",
};

type RazorpayConfirmPayload = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMode?: PaymentMode;
};

type SuccessState = {
  orderNumber?: string;
  orderId?: string;
  variant?: "standard" | "org_reimbursement";
  paymentMode?: "full_pay" | "installment";
  installmentProvider?: InstallmentProvider | null;
  paymentProvider?: PaymentProvider | null;
  confirmPending?: boolean;
  razorpayConfirm?: RazorpayConfirmPayload;
};

function paymentModeLabel(state: SuccessState | null): string | null {
  if (!state) return null;
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

function confirmFailureMessage(err: unknown, provider: "stripe" | "razorpay"): string {
  if (err instanceof ApiRequestError) {
    if (err.code === "REQUEST_TIMEOUT" || err.code === "NETWORK_ERROR") {
      return `Your ${provider === "razorpay" ? "Razorpay" : "card"} payment was received, but order confirmation is still catching up. You may already be enrolled — contact support with your order number if access does not appear shortly.`;
    }
    return err.message;
  }
  return `Could not confirm ${provider === "razorpay" ? "Razorpay" : "Stripe"} payment. If you were charged, contact support with your order number.`;
}

export function ForumCheckoutSuccessPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const routeState = location.state as SuccessState | null;

  const orderNumber = routeState?.orderNumber ?? params.get("order") ?? undefined;
  const orderId = routeState?.orderId ?? params.get("orderId") ?? undefined;
  const stripeSessionId = params.get("session_id");
  const isStripeReturn = params.get("provider") === "stripe" && Boolean(stripeSessionId && orderId);
  const razorpayConfirm = routeState?.razorpayConfirm;
  const needsRazorpayConfirm = Boolean(razorpayConfirm);

  const [state, setState] = useState<SuccessState | null>(
    routeState ?? {
      orderNumber,
      orderId,
      paymentProvider: isStripeReturn ? "stripe" : null,
      paymentMode: "full_pay",
    },
  );
  const [busy, setBusy] = useState(isStripeReturn || needsRazorpayConfirm);
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
          confirmPending: false,
        }));
      } catch (err) {
        setError(confirmFailureMessage(err, "stripe"));
      } finally {
        setBusy(false);
      }
    })();
  }, [isStripeReturn, orderId, stripeSessionId]);

  useEffect(() => {
    if (!needsRazorpayConfirm || !razorpayConfirm) return;

    void (async () => {
      try {
        const done = await confirmRazorpayCheckout(razorpayConfirm);
        setState((prev) => ({
          ...prev,
          orderId: done.order.id,
          orderNumber: done.order.orderNumber,
          paymentProvider: "razorpay",
          paymentMode: razorpayConfirm.paymentMode ?? prev?.paymentMode ?? "full_pay",
          confirmPending: false,
          razorpayConfirm: undefined,
        }));
        setError(null);
      } catch (err) {
        setError(confirmFailureMessage(err, "razorpay"));
      } finally {
        setBusy(false);
      }
    })();
  }, [needsRazorpayConfirm, razorpayConfirm]);

  const modeLabel = paymentModeLabel(state);
  const confirmingCopy = isStripeReturn
    ? " Confirming your Stripe payment…"
    : needsRazorpayConfirm || state?.confirmPending
      ? " Confirming your Razorpay payment…"
      : "";

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {busy ? "Confirming payment" : "Payment confirmed"}
      </Typography>
      {busy ? <LinearProgress /> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Typography color="text.secondary">
        Order {state?.orderNumber ?? state?.orderId ?? orderNumber ?? "—"}
        {busy ? ` is being confirmed.${confirmingCopy}` : " is confirmed. Welcome to your program."}
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
