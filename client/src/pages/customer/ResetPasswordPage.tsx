import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { apiUrl } from "../../lib/api-base.js";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenError("Reset link is missing or invalid.");
      return;
    }

    void (async () => {
      try {
        const res = await fetch(
          apiUrl(`/api/v1/auth/reset-password/validate?token=${encodeURIComponent(token)}`),
          { credentials: "include" },
        );
        const data = (await res.json()) as { error?: { message?: string } };
        if (!res.ok) {
          setTokenError(data.error?.message ?? "Reset link is invalid or expired.");
          return;
        }
        setTokenValid(true);
      } catch {
        setTokenError("Unable to validate reset link. Try again later.");
      } finally {
        setValidating(false);
      }
    })();
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/v1/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        setError(data.error?.message ?? "Unable to reset password. Request a new link.");
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600 }}>
        Reset password
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Choose a new password for your account.
      </Typography>
      <Card variant="outlined">
        <CardContent>
          {validating ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={28} />
            </Box>
          ) : success ? (
            <Alert severity="success" role="status">
              Password updated. Redirecting to sign in…
            </Alert>
          ) : !tokenValid ? (
            <Stack spacing={2}>
              <Alert severity="warning" role="alert">
                {tokenError ?? "Reset link is invalid or expired."}
              </Alert>
              <Button component={RouterLink} to="/forgot-password" variant="outlined" fullWidth>
                Request a new link
              </Button>
            </Stack>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)}>
              <Stack spacing={2}>
                <TextField
                  label="New password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  helperText="Minimum 8 characters"
                  fullWidth
                  required
                />
                <TextField
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  fullWidth
                  required
                />
                {error ? (
                  <Alert severity="error" role="alert">
                    {error}
                  </Alert>
                ) : null}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busy}
                  startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  Update password
                </Button>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        <RouterLink to="/login">← Back to sign in</RouterLink>
      </Typography>
    </Box>
  );
}
