import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { CURRENCY_CHANGE_EVENT, usePricing } from "../../contexts/PricingContext";
import { EMI_TERM_MONTHS, emiPreviewFromPlans } from "../../lib/emi-resolver";
import {
  getPaymentModes,
  postInstallmentPlans,
  type InstallmentProvider,
  type PaymentMode,
  type PaymentModesResponse,
} from "../../lib/forum-api";
import { formatPrice } from "../../lib/format-price";
import { trackEvent } from "../../lib/analytics";

const PROVIDER_LABELS: Record<InstallmentProvider, string> = {
  razorpay_emi: "Razorpay EMI",
  affirm: "Affirm",
  klarna: "Klarna",
  clearpay: "Clearpay",
  afterpay: "Afterpay",
  zip: "Zip",
};

const LOCAL_METHOD_LABELS: Record<"upi" | "paynow" | "cards", string> = {
  upi: "UPI",
  paynow: "PayNow",
  cards: "Cards",
};

type CheckoutPaymentModeSelectorProps = {
  cartSubtotal: string;
  cartCurrency: string;
  paymentMode: PaymentMode;
  installmentProvider: InstallmentProvider | null;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onInstallmentProviderChange: (provider: InstallmentProvider | null) => void;
};

export function CheckoutPaymentModeSelector({
  cartSubtotal,
  cartCurrency,
  paymentMode,
  installmentProvider,
  onPaymentModeChange,
  onInstallmentProviderChange,
}: CheckoutPaymentModeSelectorProps) {
  const { geo } = usePricing();
  const [modes, setModes] = useState<PaymentModesResponse | null>(null);
  const [installmentPlans, setInstallmentPlans] = useState<
    Awaited<ReturnType<typeof postInstallmentPlans>>["plans"]
  >();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [modesRes, plansRes] = await Promise.all([
          getPaymentModes(geo),
          postInstallmentPlans({
            amount: cartSubtotal,
            currency: cartCurrency,
            geo,
          }),
        ]);
        if (!cancelled) {
          setModes(modesRes);
          setInstallmentPlans(plansRes.plans);
          if (plansRes.plans?.length) {
            trackEvent("installment_option_impression", {
              provider: plansRes.provider ?? plansRes.plans[0]?.provider,
              geo,
            });
          }
        }
      } catch {
        if (!cancelled) {
          setModes(null);
          setInstallmentPlans(undefined);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const onCurrencyChange = () => void load();
    void load();
    window.addEventListener(CURRENCY_CHANGE_EVENT, onCurrencyChange);
    return () => {
      cancelled = true;
      window.removeEventListener(CURRENCY_CHANGE_EVENT, onCurrencyChange);
    };
  }, [geo, cartSubtotal, cartCurrency]);

  const emiPreview = useMemo(
    () => emiPreviewFromPlans(installmentPlans),
    [installmentPlans],
  );

  const subtotal = Number.parseFloat(cartSubtotal);
  const installmentAvailable =
    modes !== null &&
    modes.availableModes.includes("installment") &&
    modes.installmentProviders.length > 0 &&
    Number.isFinite(subtotal) &&
    subtotal > 0 &&
    Boolean(emiPreview);

  useEffect(() => {
    if (!installmentAvailable && paymentMode === "installment") {
      onPaymentModeChange("full_pay");
      onInstallmentProviderChange(null);
    }
  }, [
    installmentAvailable,
    onInstallmentProviderChange,
    onPaymentModeChange,
    paymentMode,
  ]);

  useEffect(() => {
    if (
      installmentAvailable &&
      paymentMode === "installment" &&
      modes &&
      !installmentProvider &&
      modes.installmentProviders[0]
    ) {
      onInstallmentProviderChange(modes.installmentProviders[0]);
    }
  }, [
    installmentAvailable,
    installmentProvider,
    modes,
    onInstallmentProviderChange,
    paymentMode,
  ]);

  if (loading) return <LinearProgress sx={{ my: 1 }} />;
  if (!modes) return null;

  const fullPayLabel =
    modes.fullPayProvider === "razorpay"
      ? "Pay in full (Razorpay / UPI)"
      : "Pay in full (card)";

  return (
    <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Payment method
      </Typography>

      <RadioGroup
        value={paymentMode}
        onChange={(e) => {
          const next = e.target.value as PaymentMode;
          onPaymentModeChange(next);
          if (next === "full_pay") {
            onInstallmentProviderChange(null);
          } else if (modes.installmentProviders[0]) {
            onInstallmentProviderChange(modes.installmentProviders[0]);
          }
        }}
      >
        <FormControlLabel value="full_pay" control={<Radio />} label={fullPayLabel} />
        {installmentAvailable ? (
          <FormControlLabel
            value="installment"
            control={<Radio />}
            label={`Pay in ${EMI_TERM_MONTHS} installments`}
          />
        ) : null}
      </RadioGroup>

      {paymentMode === "installment" && installmentAvailable && emiPreview ? (
        <Stack spacing={1.5} sx={{ mt: 1.5, pl: 4 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: "#FFFBEB",
              border: 1,
              borderColor: "#FDE68A",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#92400E" }}>
              {emiPreview.monthlyAmount}/mo · {emiPreview.termMonths} months · total{" "}
              {formatPrice(cartCurrency, cartSubtotal)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              {emiPreview.disclaimer}
            </Typography>
          </Box>

          {modes.installmentProviders.length > 1 ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {modes.installmentProviders.map((provider) => (
                <Chip
                  key={provider}
                  label={PROVIDER_LABELS[provider]}
                  color={installmentProvider === provider ? "primary" : "default"}
                  variant={installmentProvider === provider ? "filled" : "outlined"}
                  onClick={() => onInstallmentProviderChange(provider)}
                  clickable
                />
              ))}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      {modes.localPaymentMethods.length > 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
          Also available at payment:{" "}
          {modes.localPaymentMethods.map((m) => LOCAL_METHOD_LABELS[m]).join(", ")}
        </Typography>
      ) : null}
    </Box>
  );
}
