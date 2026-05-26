import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { OPS_SIGNALS } from "../../demo/mockData";

export function OpsHome() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Signals overview
      </Typography>
      <Grid container spacing={2}>
        {OPS_SIGNALS.map((s) => (
          <Grid key={s.id} size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Typography sx={{ fontWeight: 600 }}>{s.label}</Typography>
                  <Chip size="small" label={s.severity} color={s.severity === "error" ? "error" : s.severity === "warning" ? "warning" : "info"} />
                </Stack>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated {s.updated}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap" }}>
        <Button component={RouterLink} to="/ops/policies" variant="outlined">
          Policies
        </Button>
        <Button component={RouterLink} to="/ops/decisions" variant="contained">
          Pending decisions
        </Button>
      </Stack>
    </Stack>
  );
}
