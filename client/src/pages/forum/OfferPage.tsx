import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiRequestError } from "../../lib/api";
import { addToCart, listOfferings, type Offering } from "../../lib/forum-api";

const SCHEDULE_OPTIONS = [
  { id: "cohort-2026-06", label: "June 2026 cohort" },
  { id: "cohort-2026-07", label: "July 2026 cohort" },
];

export function OfferPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offering, setOffering] = useState<Offering | null>(null);
  const [scheduleRef, setScheduleRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listOfferings()
      .then((items) => {
        const match = items.find((o) => o.code === code);
        setOffering(match ?? null);
      })
      .finally(() => setLoading(false));
  }, [code]);

  async function proceedToCheckout() {
    if (!offering) return;
    if (!user) {
      navigate("/login", { state: { returnTo: `/offers/${code}` } });
      return;
    }
    setError(null);
    try {
      await addToCart(offering.code, offering.scheduleBound ? scheduleRef : undefined);
      navigate("/checkout");
    } catch (err) {
      setError(err instanceof ApiRequestError ? `${err.code}: ${err.message}` : "Could not add to cart.");
    }
  }

  if (loading) return <Typography>Loading offer…</Typography>;
  if (!offering) {
    return (
      <Alert severity="error">
        Offer not found. <RouterLink to="/">Return home</RouterLink>
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {offering.title}
      </Typography>
      <Typography color="text.secondary">
        {offering.currency} {offering.defaultUnitPrice} · Secure checkout · Satisfaction guarantee
      </Typography>
      {offering.scheduleBound ? (
        <TextField
          select
          label="Select cohort schedule"
          value={scheduleRef}
          onChange={(e) => setScheduleRef(e.target.value)}
          required
          fullWidth
        >
          {SCHEDULE_OPTIONS.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button
        variant="contained"
        size="large"
        disabled={offering.scheduleBound && !scheduleRef}
        onClick={() => void proceedToCheckout()}
      >
        {user ? "Continue to checkout" : "Sign in to checkout"}
      </Button>
    </Stack>
  );
}
