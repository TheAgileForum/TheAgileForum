import Alert from "@mui/material/Alert";

import Box from "@mui/material/Box";

import Button from "@mui/material/Button";

import Card from "@mui/material/Card";

import CardContent from "@mui/material/CardContent";

import CircularProgress from "@mui/material/CircularProgress";

import Divider from "@mui/material/Divider";

import Stack from "@mui/material/Stack";

import Tab from "@mui/material/Tab";

import Tabs from "@mui/material/Tabs";

import TextField from "@mui/material/TextField";

import Typography from "@mui/material/Typography";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { apiUrl } from "../../lib/api-base.js";



const OAUTH_PROVIDERS = [

  { id: "google", label: "Continue with Google" },

  { id: "linkedin", label: "Continue with LinkedIn" },

] as const;



export function LoginPage() {

  const { login, register, refreshMe, loginError, loginErrorCode, clearLoginError, user, loading, enterDemoBrowse } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("customer@demo.local");

  const [password, setPassword] = useState("password123");

  const [busy, setBusy] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? "/";



  const oauthStatus = searchParams.get("oauth");

  const verifiedStatus = searchParams.get("verified");



  useEffect(() => {

    if (oauthStatus === "success") {

      setStatusMessage("Signed in with OAuth. Redirecting…");

      void refreshMe().then((ok) => {

        if (!ok) {

          setStatusMessage(

            "OAuth sign-in completed, but your session could not be restored. Try again or use email login.",

          );

        }

        const next = new URLSearchParams(searchParams);

        next.delete("oauth");

        setSearchParams(next, { replace: true });

      });

    } else if (oauthStatus === "error") {

      const reason = searchParams.get("reason") ?? "OAuth sign-in failed";

      setStatusMessage(reason);

      searchParams.delete("oauth");

      searchParams.delete("reason");

      setSearchParams(searchParams, { replace: true });

    }

  }, [oauthStatus, refreshMe, searchParams, setSearchParams]);



  useEffect(() => {

    if (verifiedStatus === "1") {

      setStatusMessage("Email verified. You can sign in now.");

      void refreshMe();

      searchParams.delete("verified");

      setSearchParams(searchParams, { replace: true });

    } else if (verifiedStatus === "0") {

      const reason = searchParams.get("reason") ?? "INVALID_TOKEN";

      setStatusMessage(`Email verification failed (${reason}). Request a new link after signing in.`);

      searchParams.delete("verified");

      searchParams.delete("reason");

      setSearchParams(searchParams, { replace: true });

    }

  }, [verifiedStatus, refreshMe, searchParams, setSearchParams]);



  function switchMode(next: "login" | "register") {

    setMode(next);

    setStatusMessage(null);

    clearLoginError();

  }



  async function onSubmit(e: FormEvent) {

    e.preventDefault();

    setBusy(true);

    setStatusMessage(null);

    clearLoginError();

    try {

      if (mode === "login") {

        await login(email, password);

      } else {

        const registered = await register(email, password);

        if (registered) {

          setStatusMessage("Account created. Check your email for a verification link.");

        }

      }

    } finally {

      setBusy(false);

    }

  }



  useEffect(() => {

    if (!loading && user && verifiedStatus !== "1") {

      navigate(returnTo, { replace: true });

    }

  }, [loading, user, navigate, returnTo, verifiedStatus]);



  const oauthStartUrl = useMemo(
    () => (provider: string) => apiUrl(`/api/v1/auth/oauth/${provider}/start`),
    [],
  );



  return (

    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>

      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600 }}>

        {mode === "login" ? "Sign in" : "Create account"}

      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>

        Email, Google, or LinkedIn — for diagnosis and checkout.

      </Typography>

      <Tabs

        value={mode}

        onChange={(_, v: "login" | "register") => switchMode(v)}

        variant="fullWidth"

        sx={{ mb: 2 }}

      >

        <Tab label="Sign in" value="login" />

        <Tab label="Register" value="register" />

      </Tabs>

      <Card variant="outlined">

        <CardContent>

          <Stack spacing={2}>

            {OAUTH_PROVIDERS.map((provider) => (

              <Button

                key={provider.id}

                component="a"

                href={oauthStartUrl(provider.id)}

                variant="outlined"

                fullWidth

              >

                {provider.label}

              </Button>

            ))}

            <Divider>or</Divider>

          </Stack>

          <form onSubmit={(e) => void onSubmit(e)}>

            <Stack spacing={2} sx={{ mt: 2 }}>

              <TextField

                label="Email"

                type="email"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                autoComplete="username"

                fullWidth

                required

              />

              <TextField

                label="Password"

                type="password"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                autoComplete={mode === "login" ? "current-password" : "new-password"}

                helperText={mode === "register" ? "Minimum 8 characters" : undefined}

                fullWidth

                required

              />

              {mode === "login" ? (
                <Typography variant="body2" align="right">
                  <RouterLink to="/forgot-password">Forgot password?</RouterLink>
                </Typography>
              ) : null}

              {loginError ? (

                <Alert severity="error" role="alert">

                  {loginError}

                  {loginErrorCode === "EMAIL_ALREADY_REGISTERED" ? (

                    <Typography variant="body2" sx={{ mt: 1 }}>

                      Already have an account?{" "}

                      <Button

                        variant="text"

                        size="small"

                        sx={{ p: 0, minWidth: 0, verticalAlign: "baseline", textTransform: "none" }}

                        onClick={() => switchMode("login")}

                      >

                        Sign in instead

                      </Button>

                    </Typography>

                  ) : null}

                </Alert>

              ) : statusMessage ? (

                <Alert severity={statusMessage.includes("failed") ? "warning" : "info"} role="status">

                  {statusMessage}

                </Alert>

              ) : null}

              <Button

                type="submit"

                variant="contained"

                size="large"

                disabled={busy}

                startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}

              >

                {mode === "login" ? "Log in" : "Create account"}

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

