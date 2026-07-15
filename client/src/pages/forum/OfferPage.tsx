import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
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
import { OfferDetailView } from "../../components/forum/offer/OfferDetailView";
import { getOfferPageExtras } from "../../components/forum/offer/offerContent";
import { EmiAffordabilityModule } from "../../components/forum/EmiAffordabilityModule";
import { OfferTrustBlock } from "../../components/forum/OfferTrustBlock";
import { RoleBasedUpsellRail } from "../../components/forum/RoleBasedUpsellRail";
import { useAuth } from "../../contexts/AuthContext";
import { useForumCart } from "../../contexts/ForumCartContext";
import { usePricing } from "../../contexts/PricingContext";
import { ApiRequestError } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";
import { PATH_BY_CATEGORY, type CatalogCategoryPath } from "../../lib/catalog-filters";
import { catalogDisplayPrice } from "../../lib/catalog-display-price";
import { setCommerceJourneyOrigin } from "../../lib/commerce-journey";
import { resolvedOfferingPrice } from "../../lib/format-price";
import {
  getOfferingDetail,
  getStoredDiagnosisGapTags,
  getStoredDiagnosisTargetRole,
  type CatalogOffering,
} from "../../lib/forum-api";
import { offerDetailPath, resolveOfferRouteCode } from "../../lib/offer-routes";

const SCHEDULE_OPTIONS = [
  { id: "cohort-2026-06", label: "June 2026 cohort" },
  { id: "cohort-2026-07", label: "July 2026 cohort" },
];

const DEFAULT_INCLUSIONS = [
  "Live mentor-led labs",
  "Community access for your cohort",
  "Certificate prep materials",
  "Mock interview bundle option",
];

function scheduleOptionsFor(offering: CatalogOffering) {
  if (offering.cohortSchedules?.length) {
    return offering.cohortSchedules;
  }
  if (offering.upcomingBatchId) {
    return [
      {
        id: offering.upcomingBatchId,
        label: offering.scheduleLabel ?? offering.upcomingBatchId,
      },
    ];
  }
  return SCHEDULE_OPTIONS;
}

function schedulePromptFor(offering: CatalogOffering): string | undefined {
  return offering.scheduleLabel?.split(/\s+·\s+/u, 1)[0]?.trim() || undefined;
}

export function OfferPage() {
  const { code: routeCode } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addItem } = useForumCart();
  const { currency, geo } = usePricing();
  const [offering, setOffering] = useState<CatalogOffering | null>(null);
  const [scheduleRef, setScheduleRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const catalogFrom = (location.state as { fromCatalog?: CatalogCategoryPath } | null)?.fromCatalog;
  const catalogLink = catalogFrom ?? (offering ? `/${PATH_BY_CATEGORY[offering.category]}` : "/trainings");
  const upsellRole = getStoredDiagnosisTargetRole();
  const upsellGaps = getStoredDiagnosisGapTags();
  const offeringCode = routeCode ? resolveOfferRouteCode(routeCode) : undefined;
  const canonicalPath = offeringCode ? offerDetailPath(offeringCode) : undefined;

  useEffect(() => {
    if (!routeCode || !canonicalPath || `/offers/${routeCode}` === canonicalPath) return;
    navigate(
      {
        pathname: canonicalPath,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: location.state },
    );
  }, [
    canonicalPath,
    location.hash,
    location.search,
    location.state,
    navigate,
    routeCode,
  ]);

  useEffect(() => {
    if (!canonicalPath) return;
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = `${window.location.origin}${canonicalPath}`;
    canonical.dataset.offerCanonical = "true";
    document.head.appendChild(canonical);
    return () => canonical.remove();
  }, [canonicalPath]);

  useEffect(() => {
    if (!offeringCode) return;
    setCommerceJourneyOrigin(catalogFrom ? "catalog" : "guided_path");
    setLoading(true);
    setLoadError(null);
    void getOfferingDetail(offeringCode, geo, currency)
      .then((res) => {
        setOffering(res.offering);
        trackEvent("offer_view", { code: res.offering.code });
      })
      .catch((err) => {
        setOffering(null);
        if (!(err instanceof ApiRequestError && err.status === 404)) {
          setLoadError(
            err instanceof ApiRequestError
              ? err.message
              : "Could not load this offer. Please try again.",
          );
        }
      })
      .finally(() => setLoading(false));
  }, [offeringCode, catalogFrom, geo, currency]);

  async function handleAddToCartForCode(codeToAdd: string, scheduleRefFromUpsell?: string, label?: string) {
    if (codeToAdd !== offering?.code) {
      setError(null);
      try {
        await addItem(codeToAdd, scheduleRefFromUpsell, label);
      } catch (err) {
        setError(err instanceof ApiRequestError ? err.message : "Could not add to cart.");
      }
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
    setAdding(true);
    try {
      await addItem(
        offering.code,
        offering.scheduleBound ? scheduleRef : undefined,
        offering.title,
      );
      trackEvent("catalog_add_to_cart", { code: offering.code, source: "offer_detail" });
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
  if (loadError) {
    return (
      <Alert severity="warning">
        {loadError} <Link href={location.pathname}>Try again</Link>
      </Alert>
    );
  }
  if (!offering) {
    return (
      <Alert severity="error">
        Offer not found. <RouterLink to="/trainings">Browse catalog</RouterLink>
      </Alert>
    );
  }

  const priced = resolvedOfferingPrice(offering);
  const displayPrice = catalogDisplayPrice(priced.currency, priced.amount, offering.code);
  const inclusions = offering.includes?.length ? offering.includes : DEFAULT_INCLUSIONS;
  const scheduleOptions = scheduleOptionsFor(offering);
  const schedulePrompt = schedulePromptFor(offering);
  const extras = getOfferPageExtras(offering.code, offering.certificationName);
  const durationChipLabel = offering.durationLabel
    ? offering.durationLabel
    : offering.durationHours
      ? `${offering.durationHours} hrs`
      : null;
  const showDurationChip =
    Boolean(durationChipLabel) &&
    !(
      offering.certificationName &&
      durationChipLabel &&
      offering.certificationName.toLowerCase().includes(durationChipLabel.toLowerCase())
    );

  if (extras) {
    return (
      <>
        <OfferDetailView
          offering={offering}
          extras={extras}
          catalogLink={catalogLink}
          displayPrice={displayPrice}
          inclusions={inclusions}
          scheduleOptions={scheduleOptions}
          schedulePrompt={schedulePrompt}
          scheduleRef={scheduleRef}
          onScheduleChange={setScheduleRef}
          onEnroll={() => void handleAddToCart()}
          onCheckout={proceedToCheckout}
          adding={adding}
          error={error}
          userLoggedIn={Boolean(user)}
        />
        <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2.5, sm: 3 }, py: 3 }}>
          <RoleBasedUpsellRail
            targetRole={upsellRole}
            context="detail"
            offerId={offering.code}
            gapTags={upsellGaps}
            onAddOffering={(c, scheduleRef, label) => handleAddToCartForCode(c, scheduleRef, label)}
          />
        </Box>
      </>
    );
  }

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
        {offering.certificationName ? (
          <Chip label={offering.certificationName} size="small" color="primary" variant="outlined" />
        ) : null}
        {showDurationChip && durationChipLabel ? (
          <Chip label={durationChipLabel} size="small" variant="outlined" />
        ) : null}
        {offering.scheduleBound ? <Chip label="Select Schedule" size="small" color="info" variant="outlined" /> : null}
      </Stack>

      {offering.summary ? (
        <Typography variant="body1" color="text.secondary">
          {offering.summary}
        </Typography>
      ) : null}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            Investment
          </Typography>
          <Typography
            component="div"
            sx={{
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: 1,
              mt: 0.5,
            }}
          >
            {displayPrice.mrpFormatted ? (
              <Typography
                component="s"
                aria-label={`Original price ${displayPrice.mrpFormatted}`}
                sx={{ color: "text.secondary", fontSize: "1rem" }}
              >
                {displayPrice.mrpFormatted}
              </Typography>
            ) : null}
            <Typography
              component="span"
              variant="h4"
              aria-label={`Current price ${displayPrice.saleFormatted}`}
              sx={{ fontWeight: 700, letterSpacing: "-0.02em", color: "text.primary" }}
            >
              {displayPrice.saleFormatted}
            </Typography>
          </Typography>
          {displayPrice.discountLabel ? (
            <Box
              sx={{
                display: "inline-flex",
                maxWidth: "100%",
                mt: 1,
                px: 1.25,
                py: 0.5,
                borderRadius: "999px",
                bgcolor: "#fef3c7",
                color: "#92400e",
                fontSize: "0.78rem",
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {displayPrice.discountLabel}
            </Box>
          ) : null}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Price shown matches checkout total for this session currency.
            {offering.scheduleLabel ? ` · ${offering.scheduleLabel}` : ""}
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
            {inclusions.map((item) => (
              <Typography key={item} component="li" variant="body2" color="text.secondary">
                {item}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {offering.learningOutcomes?.length ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              What you&apos;ll learn
            </Typography>
            <Stack component="ul" sx={{ m: 0, pl: 2.5 }} spacing={0.5}>
              {offering.learningOutcomes.map((item) => (
                <Typography key={item} component="li" variant="body2" color="text.secondary">
                  {item}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ) : null}

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
          {scheduleOptions.map((s) => (
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
        onAddOffering={(c, scheduleRef, label) => handleAddToCartForCode(c, scheduleRef, label)}
      />

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
