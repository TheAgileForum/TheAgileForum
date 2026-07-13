import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CatalogFilterBar } from "../../../components/forum/CatalogFilterBar";
import { CatalogOfferingCard } from "../../../components/forum/CatalogOfferingCard";
import { useForumCart } from "../../../contexts/ForumCartContext";
import { usePricing } from "../../../contexts/PricingContext";
import { ApiRequestError } from "../../../lib/api";
import { trackEvent } from "../../../lib/analytics";
import {
  filtersToApiQuery,
  filtersToSearchParams,
  hasActiveFilters,
  parseCatalogFilters,
  type CatalogCategoryPath,
} from "../../../lib/catalog-filters";
import { setCommerceJourneyOrigin } from "../../../lib/commerce-journey";
import { listCatalogCategory, type CatalogOffering, type CatalogFacets } from "../../../lib/forum-api";

const TITLES: Record<CatalogCategoryPath, string> = {
  trainings: "Trainings",
  certifications: "Certifications",
  services: "Services",
};

type CatalogListingPageProps = {
  categoryPath: CatalogCategoryPath;
};

export function CatalogListingPage({ categoryPath }: CatalogListingPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useForumCart();
  const { currency, geo, loading: pricingLoading } = usePricing();
  const [offerings, setOfferings] = useState<CatalogOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingCode, setAddingCode] = useState<string | null>(null);
  const [facets, setFacets] = useState<CatalogFacets | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const viewedRef = useRef(false);
  const requestIdRef = useRef(0);

  const searchKey = searchParams.toString();
  const filters = parseCatalogFilters(searchKey);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const background = hasLoadedOnceRef.current;
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    const parsedFilters = parseCatalogFilters(searchKey);
    try {
      const res = await listCatalogCategory(
        categoryPath,
        filtersToApiQuery(parsedFilters),
        { geo, currency },
      );
      if (requestId !== requestIdRef.current) return;
      setOfferings(res.offerings);
      setFacets(res.facets ?? null);
      hasLoadedOnceRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof ApiRequestError ? err.message : "Could not load catalog.");
      setOfferings([]);
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryPath, searchKey, geo, currency]);

  useEffect(() => {
    hasLoadedOnceRef.current = false;
    requestIdRef.current += 1;
    setOfferings([]);
    setFacets(null);
    setLoading(true);
    setRefreshing(false);
    viewedRef.current = false;
  }, [categoryPath]);

  useEffect(() => {
    if (pricingLoading) return;
    setCommerceJourneyOrigin("catalog");
    void load();
    if (!viewedRef.current) {
      viewedRef.current = true;
      trackEvent("catalog_list_viewed", { category: categoryPath });
    }
  }, [load, categoryPath, pricingLoading]);

  function applyFilters(next: typeof filters) {
    trackEvent("catalog_filter_applied", { category: categoryPath });
    setSearchParams(filtersToSearchParams(next));
  }

  function resetFilters() {
    setSearchParams({});
  }

  async function handleAdd(offering: CatalogOffering) {
    if (offering.scheduleBound) {
      navigate(`/offers/${offering.code}`, { state: { fromCatalog: categoryPath } });
      return;
    }
    setAddingCode(offering.code);
    setError(null);
    trackEvent("catalog_add_to_cart", { code: offering.code, category: categoryPath });
    void addItem(offering.code, undefined, offering.title).catch(() => {
      // Error surfaced by ForumCartContext snackbar
    }).finally(() => setAddingCode(null));
  }

  const title = TITLES[categoryPath];
  const showCertBody = categoryPath === "certifications";
  const showInitialSpinner = loading && offerings.length === 0;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse self-serve offerings · {offerings.length} result{offerings.length === 1 ? "" : "s"}
          {facets?.priceRange
            ? ` · Price ${facets.priceRange.min}–${facets.priceRange.max}`
            : ""}{" "}
          · Session: {currency} (FR-178)
        </Typography>
      </Box>

      <CatalogFilterBar
        filters={filters}
        showCertBody={showCertBody}
        onChange={applyFilters}
        onReset={resetFilters}
      />

      {showInitialSpinner ? <LinearProgress /> : null}
      {refreshing ? (
        <LinearProgress
          color="inherit"
          sx={{ height: 2, opacity: 0.45, bgcolor: "action.hover" }}
        />
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      {!showInitialSpinner && !error && offerings.length === 0 ? (
        <Alert
          severity="info"
          action={
            hasActiveFilters(filters) ? (
              <Button color="inherit" size="small" onClick={resetFilters}>
                Reset filters
              </Button>
            ) : undefined
          }
        >
          {hasActiveFilters(filters)
            ? "No offerings match these filters."
            : `No ${title.toLowerCase()} published yet.`}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
          gap: 2,
          opacity: refreshing ? 0.72 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {offerings.map((offering) => (
          <CatalogOfferingCard
            key={offering.code}
            offering={offering}
            onAdd={(o) => void handleAdd(o)}
            adding={addingCode === offering.code}
          />
        ))}
      </Box>
    </Stack>
  );
}
