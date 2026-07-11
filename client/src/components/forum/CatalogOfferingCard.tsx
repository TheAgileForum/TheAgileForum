import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import type { CatalogOffering } from "../../lib/forum-api";
import { formatPrice, resolvedOfferingPrice } from "../../lib/format-price";
import { EmiAffordabilityModule } from "./EmiAffordabilityModule";

type CatalogOfferingCardProps = {
  offering: CatalogOffering;
  onAdd: (offering: CatalogOffering) => void;
  adding?: boolean;
};

function roleLabel(tag: string): string {
  return tag.replace(/_/g, " ");
}

export function CatalogOfferingCard({ offering, onAdd, adding }: CatalogOfferingCardProps) {
  const priced = resolvedOfferingPrice(offering);
  const price = formatPrice(priced.currency, priced.amount);
  const metaParts = [
    offering.certificationName || offering.roleTags.slice(0, 2).map(roleLabel).join(" · "),
    offering.certBody,
    offering.durationHours ? `${offering.durationHours} hrs` : null,
  ].filter(Boolean);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: { xs: 2.25, sm: 2.75 },
      }}
    >
      <Stack spacing={0.75} sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }} useFlexGap>
          <Chip
            label={offering.deliveryMode === "live" ? "Live" : "Self-paced"}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              borderColor: "rgba(15, 28, 46, 0.18)",
              color: "text.secondary",
              fontWeight: 500,
              "& .MuiChip-label": { px: 1 },
            }}
          />
          {offering.upcomingBatchId ? (
            <Chip
              label="Batch open"
              size="small"
              sx={{
                height: 24,
                bgcolor: "rgba(15, 159, 143, 0.1)",
                color: "primary.dark",
                fontWeight: 600,
                border: "none",
                "& .MuiChip-label": { px: 1 },
              }}
            />
          ) : null}
        </Stack>

        <Typography
          component="h3"
          variant="h6"
          sx={{
            fontWeight: 650,
            fontSize: "1.05rem",
            lineHeight: 1.35,
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          {offering.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", lineHeight: 1.45, textTransform: "capitalize" }}
        >
          {metaParts.join(" · ")}
        </Typography>
      </Stack>

      {offering.summary ? (
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            flex: 1,
            color: "text.secondary",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {offering.summary}
        </Typography>
      ) : (
        <Box sx={{ mb: 2, flex: 1 }} />
      )}

      <Box sx={{ mt: "auto" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: "1.5rem",
            letterSpacing: "-0.02em",
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          {price}
        </Typography>
        <EmiAffordabilityModule
          amount={priced.amount}
          currency={priced.currency}
          offerId={offering.code}
          installmentPlans={offering.priceQuote?.installmentPlans}
          compact
        />
        {offering.scheduleBound ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
            Schedule required at checkout
          </Typography>
        ) : null}

        <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
          <Button
            size="medium"
            component={RouterLink}
            to={`/offers/${offering.code}`}
            sx={{
              flex: 1,
              color: "text.primary",
              borderColor: "divider",
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
              boxShadow: "none",
              "&:hover": {
                bgcolor: "primary.dark",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(15, 159, 143, 0.4)",
                color: "#ffffff",
              },
            }}
          >
            {offering.scheduleBound ? "Select schedule" : "Add to cart"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
