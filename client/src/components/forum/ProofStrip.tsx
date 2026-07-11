import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const PROOF_ITEMS = [
  "Scrum.org paths",
  "SAFe tracks",
  "Mentor-led cohorts",
  "Interview-ready practice",
] as const;

export function ProofStrip() {
  return (
    <Box
      sx={{
        bgcolor: "#e8eef4",
        borderBottom: 1,
        borderColor: "divider",
        py: 3.5,
        px: { xs: 2.5, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto", textAlign: "center" }}>
        <Typography
          sx={{
            mb: 2,
            color: "text.secondary",
            fontSize: "0.78rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Trusted by learners transitioning into Agile roles worldwide
        </Typography>
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 3.5 }}
          useFlexGap
          sx={{
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.55,
            filter: "grayscale(1)",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "secondary.main",
            letterSpacing: "-0.02em",
          }}
          aria-hidden
        >
          {PROOF_ITEMS.map((label) => (
            <Box key={label} component="span">
              {label}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
