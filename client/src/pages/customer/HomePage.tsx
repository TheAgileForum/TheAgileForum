import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

export function HomePage() {
  return (
    <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
        Order with confidence
      </Typography>
      <Typography color="text.secondary">
        Demo customer journey: browse an honest menu, cart, checkout, recovery, and live-style tracking. Internal workspaces are linked in the footer.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
        <Button variant="contained" size="large" component={RouterLink} to="/demo/menu">
          Browse menu
        </Button>
        <Button variant="outlined" component={RouterLink} to="/consent">
          Consent gate
        </Button>
      </Stack>
    </Stack>
  );
}
