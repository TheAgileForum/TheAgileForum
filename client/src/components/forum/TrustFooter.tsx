import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function TrustFooter() {
  return (
    <Box sx={{ py: 2, px: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
        Trusted by agile practitioners · Secure checkout · Consent-first diagnosis
      </Typography>
    </Box>
  );
}
