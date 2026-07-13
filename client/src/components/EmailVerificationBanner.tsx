import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const RESEND_COOLDOWN_SEC = 60;

export function EmailVerificationBanner() {
  const { user, resendVerificationEmail } = useAuth();
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  if (!user || user.emailVerified) {
    return null;
  }

  async function onResend() {
    setBusy(true);
    try {
      const result = await resendVerificationEmail();
      if (result.ok) {
        setCooldown(RESEND_COOLDOWN_SEC);
        setSnackSeverity("success");
        setSnackMessage("Verification email sent — check your inbox.");
        setSnackOpen(true);
      } else {
        setSnackSeverity("error");
        setSnackMessage(result.message ?? "Could not send verification email. Try again shortly.");
        setSnackOpen(true);
      }
    } finally {
      setBusy(false);
    }
  }

  const resendDisabled = busy || cooldown > 0;
  const resendLabel =
    cooldown > 0
      ? `Resend available in ${cooldown}s`
      : busy
        ? "Sending…"
        : "Resend verification email";

  return (
    <>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Stack spacing={1}>
          <span>
            Verify your email ({user.email}) to secure your account
            {user.requireEmailVerification ? " and complete checkout" : ""}.
          </span>
          <Button
            size="small"
            variant="outlined"
            disabled={resendDisabled}
            onClick={() => void onResend()}
          >
            {resendLabel}
          </Button>
        </Stack>
      </Alert>
      <Snackbar
        open={snackOpen}
        autoHideDuration={8_000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
