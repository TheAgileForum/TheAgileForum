import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function EmailVerificationBanner() {
  const { user, resendVerificationEmail } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.emailVerified) {
    return null;
  }

  async function onResend() {
    setBusy(true);
    setError(null);
    try {
      const ok = await resendVerificationEmail();
      if (ok) {
        setSent(true);
      } else {
        setError("Could not send verification email. Try again shortly.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <Stack spacing={1}>
        <span>
          Verify your email ({user.email}) to secure your account
          {user.requireEmailVerification ? " and complete checkout" : ""}.
        </span>
        {sent ? (
          <span>Verification email sent — check your inbox.</span>
        ) : (
          <Button size="small" variant="outlined" disabled={busy} onClick={() => void onResend()}>
            Resend verification email
          </Button>
        )}
        {error ? <span>{error}</span> : null}
      </Stack>
    </Alert>
  );
}
