import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ApiRequestError, wakeApi } from "../../lib/api";
import {
  confirmRazorpayCheckout,
  getRazorpayCheckoutConfig,
  type InstallmentProvider,
  type PaymentMode,
} from "../../lib/forum-api";

type RazorpayCheckoutState = {
  orderId: string;
  orderNumber?: string;
  variant?: "standard" | "org_reimbursement";
  paymentMode?: PaymentMode;
  installmentProvider?: InstallmentProvider | null;
  razorpayCheckout?: {
    mode: "stub" | "live";
    keyId?: string;
    amountMinor?: number;
    currency: string;
    providerOrderId: string;
  };
};

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Razorpay script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay script failed"));
    document.body.appendChild(script);
  });
}

function paymentConfirmErrorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    if (err.code === "REQUEST_TIMEOUT" || err.code === "NETWORK_ERROR") {
      return "Payment succeeded at Razorpay, but confirming your order is taking longer than usual. Please wait a moment or contact support with your order details.";
    }
    return err.message;
  }
  return "Payment confirmation failed. If you were charged, contact support with your order details.";
}

export function ForumRazorpayCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const state = location.state as RazorpayCheckoutState | null;
  const openedRef = useRef(false);

  const orderId = params.get("orderId") ?? state?.orderId;
  const paymentMode = (params.get("mode") as PaymentMode | null) ?? state?.paymentMode ?? "full_pay";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!orderId || openedRef.current) return;
    openedRef.current = true;

    void (async () => {
      try {
        void wakeApi();
        let checkout = state?.razorpayCheckout;
        if (!checkout || checkout.mode !== "live") {
          const fetched = await getRazorpayCheckoutConfig(orderId);
          checkout = {
            mode: "live",
            keyId: fetched.keyId,
            amountMinor: fetched.amountMinor,
            currency: fetched.currency,
            providerOrderId: fetched.providerOrderId,
          };
        }
        if (!checkout.keyId || !checkout.amountMinor || !checkout.providerOrderId) {
          throw new Error("Razorpay checkout configuration is incomplete.");
        }

        await loadRazorpayScript();
        if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable.");

        const rzp = new window.Razorpay({
          key: checkout.keyId,
          amount: checkout.amountMinor,
          currency: checkout.currency,
          name: "The Agile Forum",
          description: state?.orderNumber ? `Order ${state.orderNumber}` : "Course purchase",
          order_id: checkout.providerOrderId,
          method: paymentMode === "installment" ? { emi: true } : undefined,
          handler: (response: RazorpayHandlerResponse) => {
            void (async () => {
              setBusy(true);
              setError(null);
              const confirmInput = {
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMode,
              };
              const successState = {
                orderNumber: state?.orderNumber,
                orderId,
                variant: state?.variant ?? "standard",
                paymentMode,
                installmentProvider:
                  paymentMode === "installment" ? ("razorpay_emi" as const) : null,
                paymentProvider: "razorpay" as const,
                razorpayConfirm: confirmInput,
              };
              try {
                void wakeApi();
                const done = await confirmRazorpayCheckout(confirmInput);
                navigate("/checkout/success", {
                  replace: true,
                  state: {
                    ...successState,
                    orderNumber: done.order.orderNumber,
                    orderId: done.order.id,
                    razorpayConfirm: undefined,
                  },
                });
              } catch (err) {
                // Gateway already charged — never strand the user on this page with
                // catalog-branded timeouts. Hand off to success to retry confirm.
                const retryable =
                  err instanceof ApiRequestError &&
                  (err.retryable ||
                    err.code === "REQUEST_TIMEOUT" ||
                    err.code === "NETWORK_ERROR");
                if (retryable) {
                  navigate("/checkout/success", {
                    replace: true,
                    state: {
                      ...successState,
                      confirmPending: true,
                    },
                  });
                  return;
                }
                setError(paymentConfirmErrorMessage(err));
                setBusy(false);
              }
            })();
          },
          modal: {
            ondismiss: () => {
              setError("Payment cancelled. You can retry from checkout.");
              setBusy(false);
            },
          },
          theme: { color: "#0F766E" },
        });

        rzp.on("payment.failed", (response) => {
          setError(response.error?.description ?? "Payment failed.");
          setBusy(false);
        });
        rzp.open();
      } catch (err) {
        if (err instanceof ApiRequestError) {
          if (err.code === "REQUEST_TIMEOUT" || err.code === "NETWORK_ERROR") {
            setError(
              "Checkout is taking longer than usual. Please try again in a moment.",
            );
          } else {
            setError(err.message);
          }
        } else {
          setError(err instanceof Error ? err.message : "Could not start Razorpay checkout.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, navigate, paymentMode, state]);

  if (!orderId) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Razorpay checkout
        </Typography>
        <Alert severity="error">Missing order context. Return to checkout and try again.</Alert>
        <Button variant="contained" onClick={() => navigate("/checkout")}>
          Back to checkout
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Razorpay {paymentMode === "installment" ? "EMI" : "checkout"}
      </Typography>
      <Typography color="text.secondary">
        Complete payment in the Razorpay window. Sandbox test cards and EMI options are available
        when your Razorpay test account has EMI enabled.
      </Typography>
      {loading || busy ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button variant="text" disabled={busy} onClick={() => navigate("/checkout")}>
        Back to checkout
      </Button>
    </Stack>
  );
}
