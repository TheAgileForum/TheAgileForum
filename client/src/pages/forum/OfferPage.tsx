import Alert from "@mui/material/Alert";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { EmiAffordabilityModule } from "../../components/forum/EmiAffordabilityModule";
import { OfferTrustBlock } from "../../components/forum/OfferTrustBlock";
import { RoleBasedUpsellRail } from "../../components/forum/RoleBasedUpsellRail";
import { useAuth } from "../../contexts/AuthContext";
import { useForumCart } from "../../contexts/ForumCartContext";
import { usePricing } from "../../contexts/PricingContext";
import { ApiRequestError } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";
import { PATH_BY_CATEGORY, type CatalogCategoryPath } from "../../lib/catalog-filters";
import { setCommerceJourneyOrigin } from "../../lib/commerce-journey";
import { formatPrice, resolvedOfferingPrice } from "../../lib/format-price";
import {
  getOfferingDetail,
  getStoredDiagnosisGapTags,
  getStoredDiagnosisTargetRole,
  type CatalogOffering,
} from "../../lib/forum-api";

const SCHEDULE_OPTIONS = [
  { id: "cohort-2026-06", label: "June 2026 cohort" },
  { id: "cohort-2026-07", label: "July 2026 cohort" },
];

const INCLUSIONS = [
  "Live mentor-led labs",
  "Community access for your cohort",
  "Certificate prep materials",
  "Mock interview bundle option",
];

export function OfferPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addItem } = useForumCart();
  const { currency, geo } = usePricing();
  const [offering, setOffering] = useState<CatalogOffering | null>(null);
  const [scheduleRef, setScheduleRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const catalogFrom = (location.state as { fromCatalog?: CatalogCategoryPath } | null)?.fromCatalog;
  const catalogLink = catalogFrom ?? (offering ? `/${PATH_BY_CATEGORY[offering.category]}` : "/trainings");
  const upsellRole = getStoredDiagnosisTargetRole();
  const upsellGaps = getStoredDiagnosisGapTags();

  useEffect(() => {
    if (!code) return;
    setCommerceJourneyOrigin(catalogFrom ? "catalog" : "guided_path");
    setLoading(true);
    void getOfferingDetail(code, geo, currency)
      .then((res) => {
        setOffering(res.offering);
        trackEvent("offer_view", { code: res.offering.code });
      })
      .catch(() => setOffering(null))
      .finally(() => setLoading(false));
  }, [code, catalogFrom, geo, currency]);

  async function handleAddToCartForCode(codeToAdd: string) {
    if (codeToAdd !== offering?.code) {
      navigate(`/offers/${codeToAdd}`, { state: { fromCatalog: catalogFrom } });
      return;
    }
    await handleAddToCart();
  }

  async function handleAddToCart() {
    if (!offering) return;
    if (offering.scheduleBound && !scheduleRef) {
      setError("Select a schedule before adding to cart.");
      return;
    }
    setError(null);
    setSuccess(null);
    setAdding(true);
    try {
      await addItem(offering.code, offering.scheduleBound ? scheduleRef : undefined);
      trackEvent("catalog_add_to_cart", { code: offering.code, source: "offer_detail" });
      setSuccess("Added to cart.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? `${err.code}: ${err.message}` : "Could not add to cart.");
    } finally {
      setAdding(false);
    }
  }

  function proceedToCheckout() {
    if (!user) {
      navigate("/login", { state: { returnTo: "/checkout" } });
      return;
    }
    navigate("/checkout");
  }

  if (loading) return <Typography>Loading offer…</Typography>;
  if (!offering) {
    return (
      <Alert severity="error">
        Offer not found. <RouterLink to="/trainings">Browse catalog</RouterLink>
      </Alert>
    );
  }

  const priced = resolvedOfferingPrice(offering);
  const priceLabel = formatPrice(priced.currency, priced.amount);

  return (
    <Stack spacing={2}>
      <Breadcrumbs aria-label="Catalog breadcrumb">
        <Link component={RouterLink} to={catalogLink} underline="hover" color="inherit">
          Catalog
        </Link>
        <Typography color="text.primary">{offering.title}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
        {offering.title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Chip label={offering.kind} size="small" variant="outlined" />
        {offering.scheduleBound ? <Chip label="Schedule required" size="small" color="info" variant="outlined" /> : null}
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Investment · {priced.currency}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {priceLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price shown matches checkout total for this session currency.
          </Typography>
          <EmiAffordabilityModule
            amount={priced.amount}
            currency={priced.currency}
            offerId={offering.code}
            installmentPlans={offering.priceQuote?.installmentPlans}
          />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            What&apos;s included
          </Typography>
          <Stack component="ul" sx={{ m: 0, pl: 2.5 }} spacing={0.5}>
            {INCLUSIONS.map((item) => (
              <Typography key={item} component="li" variant="body2" color="text.secondary">
                {item}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {offering.scheduleBound ? (
        <TextField
          select
          label="Select cohort schedule"
          value={scheduleRef}
          onChange={(e) => setScheduleRef(e.target.value)}
          required
          fullWidth
          helperText="Required before add to cart — schedule is attached to your cart line"
        >
          {SCHEDULE_OPTIONS.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>
      ) : null}

      <OfferTrustBlock />

      <RoleBasedUpsellRail
        targetRole={upsellRole}
        context="detail"
        offerId={offering.code}
        gapTags={upsellGaps}
        onAddOffering={(c) => void handleAddToCartForCode(c)}
      />

      {success ? <Alert severity="success">{success}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          variant="contained"
          size="large"
          disabled={adding || (offering.scheduleBound && !scheduleRef)}
          onClick={() => void handleAddToCart()}
        >
          Add to cart
        </Button>
        <Button variant="outlined" size="large" component={RouterLink} to="/cart">
          View cart
        </Button>
        <Button variant="text" size="large" onClick={proceedToCheckout}>
          {user ? "Checkout" : "Sign in to checkout"}
        </Button>
      </Stack>
    </Stack>
  );
}
