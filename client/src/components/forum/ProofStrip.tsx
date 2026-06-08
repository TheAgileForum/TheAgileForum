import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

const PROOF_ITEMS = [
  "4.8★ learner rating",
  "12k+ assessments",
  "SAFe-aligned paths",
  "Consent-first diagnosis",
] as const;

export function ProofStrip() {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
      {PROOF_ITEMS.map((label) => (
        <Chip key={label} label={label} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}
