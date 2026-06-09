import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useLocation } from "react-router-dom";
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
  const state = location.state as SuccessState | null;
  const modeLabel = paymentModeLabel(state);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Payment confirmed
      </Typography>
      <Typography color="text.secondary">
        Order {state?.orderNumber ?? state?.orderId ?? "—"} is confirmed.
        {state?.variant === "org_reimbursement"
          ? " Your organization reimbursement request was submitted to ops."
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
