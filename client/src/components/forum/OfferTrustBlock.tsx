import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function OfferTrustBlock() {
  return (
    <Stack
      spacing={0.5}
      sx={{
        py: 1.5,
        px: 2,
        borderLeft: 3,
        borderColor: "primary.main",
        bgcolor: "action.hover",
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Trust &amp; policies
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Compliant program claims · Secure checkout · Satisfaction guarantee aligned with published refund policy.
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, flexWrap: "wrap" }}>
        <Link href="https://www.theagileforum.com/refund-policy" target="_blank" rel="noopener noreferrer" variant="body2">
          Refund policy
        </Link>
        <Link href="https://www.theagileforum.com/privacy" target="_blank" rel="noopener noreferrer" variant="body2">
          Privacy policy
        </Link>
        <Link href="mailto:support@theagileforum.com" variant="body2">
          Contact support
        </Link>
      </Stack>
    </Stack>
  );
}
