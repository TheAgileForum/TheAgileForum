import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { usePricing } from "../../contexts/PricingContext";
import { ApiRequestError } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";
import { formatPrice } from "../../lib/format-price";
import { getUpsellRecommendations, type UpsellItem } from "../../lib/forum-api";

type RoleBasedUpsellRailProps = {
  targetRole?: string | null;
  context?: "diagnosis" | "dashboard" | "cart" | "detail" | "post_webinar";
  offerId?: string;
  gapTags?: string[];
  onAddOffering?: (code: string, scheduleRef?: string) => Promise<void>;
};

export function RoleBasedUpsellRail({
  targetRole,
  context = "detail",
  offerId,
  gapTags = [],
  onAddOffering,
}: RoleBasedUpsellRailProps) {
  const { currency, geo } = usePricing();
  const [items, setItems] = useState<UpsellItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingCode, setAddingCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ severity: "success" | "error"; message: string } | null>(
    null,
  );
  const impressed = useRef(false);

  useEffect(() => {
    if (!targetRole?.trim()) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getUpsellRecommendations({
      targetRole,
      context,
      offerId,
      gapTags,
      geo,
      currency,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        if (res.items.length && !impressed.current) {
          impressed.current = true;
          trackEvent("upsell_impression", { context, role: res.targetRole });
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetRole, context, offerId, gapTags.join(","), geo, currency]);

  async function handleAdd(item: UpsellItem) {
    if (!onAddOffering) return;
    setFeedback(null);
    setAddingCode(item.code);
    trackEvent("upsell_click", { code: item.code, context });
    try {
      await onAddOffering(item.code, item.scheduleRef ?? undefined);
      setFeedback({ severity: "success", message: `${item.title} added to cart.` });
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Could not add to cart. Try again or open the offer page.";
      setFeedback({ severity: "error", message });
    } finally {
      setAddingCode(null);
    }
  }

  if (!targetRole?.trim()) return null;
  if (loading) return <LinearProgress sx={{ my: 1 }} />;
  if (items.length === 0) return null;

  const title = `Recommended for your ${targetRole.replace(/_/g, " ")} pathway`;

  return (
    <Card variant="outlined" sx={{ borderLeft: 4, borderColor: "secondary.main" }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Stack spacing={1}>
          {items.map((item) => (
            <Stack
              key={item.code}
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center", gap: 1 }}
            >
              <Stack spacing={0.25}>
                <Typography variant="body2">{item.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatPrice(item.priceQuote.currency, item.priceQuote.amount)}
                </Typography>
              </Stack>
              {item.action === "add" ? (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={addingCode !== null}
                  onClick={() => void handleAdd(item)}
                  startIcon={
                    addingCode === item.code ? <CircularProgress size={14} color="inherit" /> : null
                  }
                >
                  {addingCode === item.code ? "Adding…" : "Add"}
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="text"
                  component={RouterLink}
                  to={`/offers/${item.code}`}
                  onClick={() => trackEvent("upsell_click", { code: item.code, context })}
                >
                  View
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
        {feedback ? (
          <Alert severity={feedback.severity} sx={{ mt: 1.5 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Role-based suggestions · Session {currency} · No discount marketing (FR-181)
        </Typography>
      </CardContent>
    </Card>
  );
}
