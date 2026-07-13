import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
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
  variant?: "default" | "info";
  icon?: ReactNode;
};

export function EmiAffordabilityModule({
  amount,
  currency,
  offerId,
  installmentPlans,
  compact,
  variant = "default",
  icon,
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

  const infoBanner = variant === "info";
  const label = `EMI from ${preview.monthlyAmount}/mo · ${preview.termMonths} months`;

  return (
    <Box
      sx={{
        mt: compact ? 0.5 : 1,
        p: compact ? 1 : 1.5,
        borderRadius: infoBanner ? "10px" : 1.5,
        display: infoBanner ? "flex" : "block",
        alignItems: infoBanner ? "center" : undefined,
        gap: infoBanner ? 1 : undefined,
        bgcolor: infoBanner ? "transparent" : "#FFFBEB",
        background: infoBanner
          ? "linear-gradient(90deg, #e0f2fe 0%, rgba(224,242,254,0.4) 100%)"
          : undefined,
        border: 1,
        borderColor: infoBanner ? "rgba(2, 132, 199, 0.15)" : "#FDE68A",
      }}
    >
      {icon ?? null}
      <Typography
        variant={compact ? "caption" : "body2"}
        sx={{ fontWeight: 600, color: infoBanner ? "#0369a1" : "#92400E" }}
      >
        {label}
      </Typography>
      {!compact ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {preview.disclaimer}
        </Typography>
      ) : null}
    </Box>
  );
}
