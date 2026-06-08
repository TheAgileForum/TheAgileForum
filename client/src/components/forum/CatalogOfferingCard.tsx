import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
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

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }} useFlexGap>
          <Chip label={offering.deliveryMode === "live" ? "Live" : "Self-paced"} size="small" variant="outlined" />
          {offering.upcomingBatchId ? (
            <Chip label="Batch open" size="small" color="info" variant="outlined" />
          ) : null}
        </Stack>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {offering.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {offering.roleTags.slice(0, 2).map(roleLabel).join(" · ")}
          {offering.certBody ? ` · ${offering.certBody}` : ""}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
          <Typography variant="caption" color="text.secondary">
            Schedule required at checkout
          </Typography>
        ) : null}
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button size="small" component={RouterLink} to={`/offers/${offering.code}`}>
          View details
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={adding}
          onClick={() => onAdd(offering)}
        >
          {offering.scheduleBound ? "Select schedule" : "Add to cart"}
        </Button>
      </CardActions>
    </Card>
  );
}
