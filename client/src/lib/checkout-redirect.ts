import type { NavigateFunction } from "react-router-dom";
import type { CheckoutStartResult } from "./forum-api";

export type CheckoutRedirectState = {
  orderId: string;
  orderNumber: string;
  variant?: CheckoutStartResult["variant"];
  paymentMode?: CheckoutStartResult["paymentMode"];
  installmentProvider?: CheckoutStartResult["installmentProvider"];
  razorpayCheckout?: CheckoutStartResult["razorpayCheckout"];
};

/** Route in-app payment stubs internally; send external gateways to full redirect. */
export function redirectAfterCheckoutStart(
  started: CheckoutStartResult,
  navigate: NavigateFunction,
): boolean {
  const state: CheckoutRedirectState = {
    orderId: started.orderId,
    orderNumber: started.orderNumber,
    variant: started.variant,
    paymentMode: started.paymentMode,
    installmentProvider: started.installmentProvider,
    razorpayCheckout: started.razorpayCheckout,
  };

  if (started.stripeCheckoutUrl) {
    window.location.href = started.stripeCheckoutUrl;
    return true;
  }

  if (started.razorpayCheckoutUrl) {
    try {
      const parsed = new URL(started.razorpayCheckoutUrl, window.location.origin);
      if (parsed.origin === window.location.origin) {
        navigate(`${parsed.pathname}${parsed.search}`, { state });
        return true;
      }
    } catch {
      /* fall through to external redirect */
    }
    window.location.href = started.razorpayCheckoutUrl;
    return true;
  }

  return false;
}

export function resolveStubPaymentRef(started: CheckoutStartResult): string {
  if (started.razorpayPaymentRef) {
    return started.razorpayPaymentRef;
  }
  if (started.paymentMode === "installment" && started.installmentProvider) {
    return `installment:${started.installmentProvider}`;
  }
  return "stub-payment";
}
