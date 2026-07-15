import CheckIcon from "@mui/icons-material/Check";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { catalogDisplayPrice } from "../../lib/catalog-display-price";
import {
  catalogSocialProof,
  isPopularOffering,
  resolveCertBadge,
} from "../../lib/cert-badge";
import type { CatalogOffering } from "../../lib/forum-api";
import { resolvedOfferingPrice } from "../../lib/format-price";
import { EmiAffordabilityModule } from "./EmiAffordabilityModule";

type CatalogOfferingCardProps = {
  offering: CatalogOffering;
  onAdd: (offering: CatalogOffering) => void;
  adding?: boolean;
};

function roleLabel(tag: string): string {
  return tag.replace(/_/g, " ");
}

function FeatureCheck() {
  return (
    <Box
      sx={{
        flexShrink: 0,
        width: 16,
        height: 16,
        borderRadius: "50%",
        bgcolor: "#dcfce7",
        color: "#16a34a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mt: "1px",
      }}
    >
      <CheckIcon sx={{ fontSize: 10 }} />
    </Box>
  );
}

export function CatalogOfferingCard({ offering, onAdd, adding }: CatalogOfferingCardProps) {
  const priced = resolvedOfferingPrice(offering);
  const displayPrice = catalogDisplayPrice(
    priced.currency,
    priced.amount,
    offering.code,
  );
  const badge = resolveCertBadge(offering);
  const social = catalogSocialProof(offering);
  const popular = isPopularOffering(offering.code);

  const primaryMeta =
    offering.certificationName || offering.roleTags.slice(0, 2).map(roleLabel).join(" · ");
  const durationMeta = offering.durationHours
    ? `${offering.durationHours} hrs`
    : offering.durationLabel;
  // Avoid "7.5 hrs · 7.5 hrs" when duration is already embedded in certificationName/subtitle.
  const durationAlreadyInMeta =
    Boolean(durationMeta) &&
    Boolean(primaryMeta) &&
    primaryMeta.toLowerCase().includes(durationMeta!.toLowerCase());
  const metaParts = [
    primaryMeta,
    offering.certBody,
    durationAlreadyInMeta ? undefined : durationMeta,
  ].filter(Boolean);

  const features = (offering.includes ?? offering.learningOutcomes ?? []).slice(0, 4);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
        transition: "box-shadow 0.3s, transform 0.3s",
        "&:hover": {
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.14)",
          transform: "translateY(-3px)",
        },
      }}
    >
      {/* Hero header */}
      <Box
        sx={{
          position: "relative",
          background: badge.heroGradient,
          pt: 3,
          pb: 2.5,
          minHeight: 148,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 20% 100%, rgba(255,255,255,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 90% 10%, rgba(245,158,11,0.15) 0%, transparent 50%)
            `,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
            height: 24,
            bgcolor: "background.paper",
            borderRadius: "14px 14px 0 0",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            flexWrap: "wrap",
            zIndex: 2,
          }}
        >
          <Chip
            label={offering.deliveryMode === "live" ? "Live Class" : "Self-paced"}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.03em",
              bgcolor: "rgba(255,255,255,0.22)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(8px)",
              "& .MuiChip-label": { px: 1 },
            }}
          />
          {offering.upcomingBatchId ? (
            <Chip
              label="Batch open"
              size="small"
              sx={{
                height: 22,
                fontSize: "0.65rem",
                fontWeight: 600,
                bgcolor: "rgba(255,255,255,0.95)",
                color: "primary.dark",
                border: "none",
                "& .MuiChip-label": { px: 1 },
              }}
            />
          ) : null}
          {popular ? (
            <Chip
              label="Popular"
              size="small"
              sx={{
                height: 22,
                fontSize: "0.65rem",
                fontWeight: 600,
                ml: "auto",
                bgcolor: "#0284c7",
                color: "#fff",
                border: "none",
                "& .MuiChip-label": { px: 1 },
              }}
            />
          ) : null}
        </Stack>

        <Box
          component="img"
          src={badge.src}
          alt=""
          sx={{
            position: "relative",
            zIndex: 1,
            width: 88,
            height: "auto",
            maxHeight: 100,
            objectFit: "contain",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
            mb: -1,
          }}
        />
      </Box>

      {/* Body */}
      <Box sx={{ px: 2.5, pt: 2, pb: 2.5, display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography
          component="h3"
          variant="h6"
          sx={{
            fontWeight: 650,
            fontSize: "1.05rem",
            lineHeight: 1.35,
            color: "text.primary",
            letterSpacing: "-0.01em",
            mb: 0.5,
          }}
        >
          {offering.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.8rem",
            lineHeight: 1.45,
            textTransform: "capitalize",
            mb: 1.5,
          }}
        >
          {metaParts.join(" · ")}
        </Typography>

        <Stack
          direction="row"
          spacing={1.25}
          useFlexGap
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
            mb: 1.75,
            pb: 1.75,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" aria-hidden>
            {social.avatars.map((av, i) => (
              <Box
                key={av.initials}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "background.paper",
                  ml: i === 0 ? 0 : "-8px",
                  background: av.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {av.initials}
              </Box>
            ))}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: "background.paper",
                ml: "-8px",
                bgcolor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.55rem",
                fontWeight: 700,
                color: "text.secondary",
              }}
            >
              +
            </Box>
          </Stack>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "text.primary" }}>
            {social.enrolledLabel}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ ml: "auto", alignItems: "center" }}>
            <Typography component="span" sx={{ color: "#f59e0b", fontSize: "0.78rem", letterSpacing: -1 }}>
              ★★★★★
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "text.primary" }}>
              {social.rating}
            </Typography>
          </Stack>
        </Stack>

        {features.length > 0 ? (
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", flex: 1, mb: 2 }}>
            {features.map((item) => (
              <Box
                component="li"
                key={item}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  fontSize: "0.8rem",
                  color: "text.secondary",
                  lineHeight: 1.4,
                  mb: 0.75,
                }}
              >
                <FeatureCheck />
                {item}
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ flex: 1, mb: 2 }} />
        )}

        <Box sx={{ mt: "auto" }}>
          <Stack spacing={0.75} sx={{ mb: 1.25 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "baseline", flexWrap: "wrap" }}>
              {displayPrice.mrpFormatted ? (
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    color: "#94a3b8",
                    textDecoration: "line-through",
                  }}
                >
                  {displayPrice.mrpFormatted}
                </Typography>
              ) : null}
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.65rem",
                  letterSpacing: "-0.02em",
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                {displayPrice.saleFormatted}
              </Typography>
            </Stack>
            {displayPrice.discountLabel ? (
              <Box
                sx={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  px: 1,
                  py: 0.25,
                  borderRadius: "999px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#b45309",
                  bgcolor: "#fef3c7",
                }}
              >
                {displayPrice.discountLabel}
              </Box>
            ) : null}
          </Stack>

          <EmiAffordabilityModule
            amount={priced.amount}
            currency={priced.currency}
            offerId={offering.code}
            installmentPlans={offering.priceQuote?.installmentPlans}
            compact
            variant="info"
            icon={<CreditCardOutlinedIcon sx={{ fontSize: 16, opacity: 0.8 }} />}
          />

          {offering.scheduleBound ? (
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, mb: 1.75, color: "#94a3b8", fontSize: "0.72rem" }}
            >
              Select Schedule
            </Typography>
          ) : (
            <Box sx={{ mb: 1.75 }} />
          )}

          <Stack direction="row" spacing={1.25}>
            <Button
              size="medium"
              component={RouterLink}
              to={`/offers/${offering.code}`}
              sx={{
                flex: 1,
                color: "text.primary",
                borderColor: "#cbd5e1",
                "&:hover": { borderColor: "text.secondary", bgcolor: "rgba(15, 28, 46, 0.03)" },
              }}
              variant="outlined"
            >
              View details
            </Button>
            <Button
              size="medium"
              variant="contained"
              disabled={adding}
              onClick={() => onAdd(offering)}
              sx={{
                flex: 1.15,
                bgcolor: "primary.main",
                color: "#ffffff",
                boxShadow: "0 2px 8px rgba(15, 159, 143, 0.35)",
                "&:hover": {
                  bgcolor: "primary.dark",
                  boxShadow: "0 2px 8px rgba(15, 159, 143, 0.45)",
                },
                "&.Mui-disabled": {
                  bgcolor: "rgba(15, 159, 143, 0.4)",
                  color: "#ffffff",
                },
              }}
            >
              {offering.scheduleBound ? "Select Schedule" : "Add to cart"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
