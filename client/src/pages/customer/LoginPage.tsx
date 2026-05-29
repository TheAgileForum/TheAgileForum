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
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const { login, loginError, user, loading, enterDemoBrowse } = useAuth();
  const [email, setEmail] = useState("customer@demo.local");
  const [password, setPassword] = useState("password123");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? "/";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading && user) {
      navigate(returnTo, { replace: true });
    }
  }, [loading, user, navigate, returnTo]);

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600 }}>
        Sign in
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Uses real API when <code>/api</code> is available; demo works without it.
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <form onSubmit={(e) => void onSubmit(e)}>
            <Stack spacing={2}>
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" fullWidth required />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                fullWidth
                required
              />
              {loginError ? (
                <Alert severity="error" role="alert">
                  {loginError}
                </Alert>
              ) : null}
              <Button type="submit" variant="contained" size="large" disabled={busy} startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}>
                Log in
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
      <Button
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => {
          enterDemoBrowse();
          navigate("/demo/menu");
        }}
      >
        Continue without signing in (demo browse)
      </Button>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        <RouterLink to="/">← Home</RouterLink>
      </Typography>
    </Box>
  );
}
