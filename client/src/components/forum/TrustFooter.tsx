import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

export function TrustFooter() {
  return (
    <Box sx={{ py: 2, px: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mb: 1 }}>
        Trusted by agile practitioners · Secure checkout · Consent-first diagnosis
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
        <Button size="small" component={RouterLink} to="/demo">
          Bistro demo
        </Button>
        <Button size="small" component={RouterLink} to="/login">
          Sign in
        </Button>
      </Box>
    </Box>
  );
}
