import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { apiUrl } from "../../lib/api-base.js";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/v1/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: { message?: string } };
      if (!res.ok) {
        setError(data.error?.message ?? "Unable to process request. Try again later.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600 }}>
        Forgot password
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Enter your email and we&apos;ll send a reset link if an account exists.
      </Typography>
      <Card variant="outlined">
        <CardContent>
          {submitted ? (
            <Alert severity="info" role="status">
              If an account exists for that email, you will receive a password reset link shortly.
              Check your inbox and spam folder.
            </Alert>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
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
                  Send reset link
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
