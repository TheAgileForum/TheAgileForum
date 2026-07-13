import type { InstallmentProvider, PaymentMode } from "./forum-api";

export const INDIA_FULL_PAY_MESSAGE =
  "All payment Option Available - Credit Card, Debit Card, Installments(EMI), UPI, Netbanking, Wallets Etc.";

export const INSTALLMENT_MODE_LABEL = "Pay in 3/6/12 Monthly installments";

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
    return INDIA_FULL_PAY_MESSAGE;
  }
  if (fullPayProvider === "razorpay") {
    return "Pay in full (Razorpay / UPI)";
  }
  return "Pay in full (card)";
}
