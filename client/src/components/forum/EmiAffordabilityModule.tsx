import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { usePricing } from "../../contexts/PricingContext";
import { emiPreviewFromPlans, type EmiPreview } from "../../lib/emi-resolver";
import { postInstallmentPlans, type PriceQuote } from "../../lib/forum-api";

type EmiAffordabilityModuleProps = {
  amount: string;
  currency: string;
  offerId?: string;
  installmentPlans?: PriceQuote["installmentPlans"];
  compact?: boolean;
};

export function EmiAffordabilityModule({
  amount,
  currency,
  offerId,
  installmentPlans,
  compact,
}: EmiAffordabilityModuleProps) {
  const { geo } = usePricing();
  const [preview, setPreview] = useState<EmiPreview | null>(() =>
    emiPreviewFromPlans(
      installmentPlans?.map((plan) => ({
        ...plan,
        termMonths: 6,
      })),
    ),
  );

  useEffect(() => {
    const fromCatalog = emiPreviewFromPlans(
      installmentPlans?.map((plan) => ({ ...plan, termMonths: 6 })),
    );
    if (fromCatalog) {
      setPreview(fromCatalog);
      return;
    }

    let cancelled = false;
    void postInstallmentPlans({
      offerId,
      amount,
      currency,
      geo,
    })
      .then((res) => {
        if (!cancelled) setPreview(emiPreviewFromPlans(res.plans));
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });

    return () => {
      cancelled = true;
    };
  }, [amount, currency, geo, offerId, installmentPlans]);

  if (!preview) return null;

  return (
    <Box
      sx={{
        mt: compact ? 0.5 : 1,
        p: compact ? 1 : 1.5,
        borderRadius: 1.5,
        bgcolor: "#FFFBEB",
        border: 1,
        borderColor: "#FDE68A",
      }}
    >
      <Typography variant={compact ? "caption" : "body2"} sx={{ fontWeight: 600, color: "#92400E" }}>
        EMI from {preview.monthlyAmount}/mo · {preview.termMonths} months
      </Typography>
      {!compact ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {preview.disclaimer}
        </Typography>
      ) : null}
    </Box>
  );
}
