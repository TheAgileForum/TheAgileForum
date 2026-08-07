import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiRequestError } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";
import { formatPrice } from "../../lib/format-price";
import { listMyOrders, type LearnerOrder } from "../../lib/forum-api";

/** Canonical Mock Interview SKU + public slug alias. */
const MOCK_INTERVIEW_OFFER_CODE = "service-mock-interview-sm";
const MOCK_INTERVIEW_SLUG = "mock-interview-series-with-interview-preparation";
const MOCK_INTERVIEW_BOOKING_URL = "https://calendly.com/coach_Dhirender_Verma";

/** Warm ochre for Mock Interview booking CTA (outlined). */
const BOOK_SLOT_OCHRE = "#c47b2b";

function statusLabel(status: string): { label: string; color: "success" | "warning" | "default" | "info" } {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return { label: "Enrolled / paid", color: "success" };
  if (normalized === "created" || normalized.includes("pending")) {
    return { label: "Awaiting payment", color: "warning" };
  }
  return { label: status, color: "default" };
}

/** Canonical Mock Interview SKU + known aliases / prefix. */
function isMockInterviewOfferingCode(code: string): boolean {
  const normalized = code.trim().toLowerCase();
  return (
    normalized === MOCK_INTERVIEW_OFFER_CODE ||
    normalized === MOCK_INTERVIEW_SLUG ||
    normalized.startsWith("service-mock-interview")
  );
}

function orderIncludesMockInterview(order: LearnerOrder): boolean {
  return order.items.some((item) => isMockInterviewOfferingCode(item.offeringCode));
}

export function AccountOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState<LearnerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    setError(null);
    void listMyOrders()
      .then((list) => {
        setOrders(list);
        trackEvent("account_orders_viewed", { count: list.length });
      })
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : "Could not load your orders.");
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading) {
    return <LinearProgress />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname }} />;
  }

  const paid = orders.filter((o) => o.status.toLowerCase() === "paid");
  const other = orders.filter((o) => o.status.toLowerCase() !== "paid");

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        My enrollments
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Signed in as {user.email}. Paid courses and services appear below.
      </Typography>

      {loading ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      {!loading && orders.length === 0 ? (
        <Alert
          severity="info"
          action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" component={RouterLink} to="/trainings">
                Trainings
              </Button>
              <Button color="inherit" size="small" component={RouterLink} to="/certifications">
                Certifications
              </Button>
              <Button color="inherit" size="small" component={RouterLink} to="/services">
                Services
              </Button>
            </Stack>
          }
        >
          You have no orders yet. Browse the catalog to enroll.
        </Alert>
      ) : null}

      {paid.length > 0 ? (
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Purchased &amp; enrolled
          </Typography>
          {paid.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Stack>
      ) : null}

      {other.length > 0 ? (
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Other orders
          </Typography>
          {other.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

function OrderCard({ order }: { order: LearnerOrder }) {
  const status = statusLabel(order.status);
  const total = formatPrice(order.currency, order.totalAmount);
  const created = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", mb: 1.5 }}>
          <Stack spacing={0.25}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Order {order.orderNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {created} · {total}
            </Typography>
          </Stack>
          <Chip size="small" color={status.color} label={status.label} />
        </Stack>
        <Stack spacing={1}>
          {order.items.map((item) => (
            <Stack
              key={`${order.id}-${item.offeringCode}`}
              direction={{ xs: "column", sm: "row" }}
              spacing={0.5}
              sx={{ justifyContent: "space-between" }}
            >
              <Stack spacing={0.25}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.offeringCode}
                  {item.category ? ` · ${item.category}` : ""}
                  {item.quantity > 1 ? ` · qty ${item.quantity}` : ""}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {formatPrice(item.currency, item.unitPrice)}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
          <Button
            size="small"
            component={RouterLink}
            to={`/offers/${order.items[0]?.offeringCode ?? ""}`}
            disabled={!order.items[0]?.offeringCode}
          >
            View offering
          </Button>
          {order.status.toLowerCase() === "paid" && orderIncludesMockInterview(order) ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
              <Typography variant="caption" color="text.secondary" component="span">
                Next action
              </Typography>
              <Button
                size="small"
                variant="outlined"
                href={MOCK_INTERVIEW_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("mock_interview_book_slot_clicked", {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                  })
                }
                sx={{
                  color: BOOK_SLOT_OCHRE,
                  borderColor: BOOK_SLOT_OCHRE,
                  "&:hover": {
                    borderColor: BOOK_SLOT_OCHRE,
                    backgroundColor: "rgba(196, 123, 43, 0.08)",
                  },
                }}
              >
                Book Interview Slot
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
