import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

const INK = "#0a1628";
const TEAL = "#0f9f8f";

export function WebinarsPage() {
  return (
    <Stack spacing={3} sx={{ py: { xs: 1, sm: 2 } }}>
      <Box
        sx={{
          borderLeft: `3px solid ${TEAL}`,
          pl: 2.5,
          py: 0.5,
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: INK, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 }}
        >
          Webinars
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 520 }}>
          Live sessions and recorded talks for product owners, Scrum Masters, and leaders.
          Schedule and registration will appear here soon.
        </Typography>
      </Box>
      <Button
        component={RouterLink}
        to="/diagnosis/step-1"
        variant="contained"
        sx={{ alignSelf: "flex-start", bgcolor: TEAL, "&:hover": { bgcolor: "#0b7a6e" } }}
      >
        Start Assessment →
      </Button>
    </Stack>
  );
}
