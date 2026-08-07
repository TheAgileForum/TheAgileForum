import type { InstallmentProvider, PaymentMode } from "./forum-api";

export const INDIA_FULL_PAY_MESSAGE =
  "All payment Option Available On Checkout - Credit Card, Debit Card, Installments(EMI), UPI, Netbanking, Wallets Etc.";

export const FULL_PAYMENT_MODE_LABEL = "Full Payment";

export const INSTALLMENT_MODE_LABEL = "Installments";

export function isIndiaCheckoutContext(geo: string, currency: string): boolean {
  return geo === "IN" || currency === "INR";
}

export function getCheckoutConfirmLabel(options: {
  variant: "standard" | "org_reimbursement";
  geo: string;
  currency: string;
  paymentMode: PaymentMode;
  installmentProvider: InstallmentProvider | null;
}): string {
  const { geo, currency, paymentMode, installmentProvider } = options;

  if (isIndiaCheckoutContext(geo, currency)) {
    return "Continue to Pay";
  }
  if (paymentMode === "installment" && installmentProvider) {
    return "Continue to installment checkout";
  }
  return "Confirm payment";
}

export function getFullPayModeLabel(
  fullPayProvider: "stripe" | "razorpay",
  geo: string,
  currency: string,
): string {
  if (fullPayProvider === "razorpay" && isIndiaCheckoutContext(geo, currency)) {
    return FULL_PAYMENT_MODE_LABEL;
  }
  if (fullPayProvider === "razorpay") {
    return "Pay in full (Razorpay / UPI)";
  }
  return "Pay in full (card)";
}
