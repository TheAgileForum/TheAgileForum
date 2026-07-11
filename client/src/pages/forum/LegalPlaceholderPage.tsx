import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

const INK = "#0a1628";
const TEAL = "#0f9f8f";

type LegalPlaceholderPageProps = {
  title: string;
  summary: string;
};

export function LegalPlaceholderPage({ title, summary }: LegalPlaceholderPageProps) {
  return (
    <Stack spacing={2} sx={{ py: { xs: 1, sm: 2 }, maxWidth: 640 }}>
      <Box sx={{ borderLeft: `3px solid ${TEAL}`, pl: 2.5, py: 0.5 }}>
        <Typography
          variant="h4"
          sx={{ color: INK, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 }}
        >
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          {summary}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          Full policy copy will be published here before public launch. For questions now, email{" "}
          <Link href="mailto:contact@theagileforum.com">contact@theagileforum.com</Link>.
        </Typography>
      </Box>
      <Link component={RouterLink} to="/" underline="hover" sx={{ color: TEAL, alignSelf: "flex-start" }}>
        ← Back to home
      </Link>
    </Stack>
  );
}
