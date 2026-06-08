import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type RecommendationRationaleCardProps = {
  rationale: Array<{ label: string; detail: string }>;
};

export function RecommendationRationaleCard({ rationale }: RecommendationRationaleCardProps) {
  if (rationale.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderLeft: 4, borderColor: "primary.main" }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Why this path fits you
        </Typography>
        <Stack spacing={1.5}>
          {rationale.map((r) => (
            <Stack key={r.label} spacing={0.5}>
              <Chip label={r.label} size="small" variant="outlined" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="body2" color="text.secondary">
                {r.detail}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
