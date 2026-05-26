import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { INVENTORY_ROWS, RESTAURANT_QUEUE_ROWS } from "../../demo/mockData";
import Chip from "@mui/material/Chip";
import { statusChipProps } from "../../lib/statusMapping";

export function RestaurantHome() {
  const lowStock = INVENTORY_ROWS.filter((r) => r.qty <= r.lowThreshold);

  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Operations hub
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Incoming
              </Typography>
              <Typography variant="h3">{RESTAURANT_QUEUE_ROWS.length}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Active tickets in queue (demo)
              </Typography>
              <Button component={RouterLink} to="/restaurant/orders" sx={{ mt: 2 }}>
                Open queue
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Stock alerts
              </Typography>
              <Typography variant="h3">{lowStock.length}</Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
                {lowStock.map((r) => (
                  <Chip key={r.id} size="small" label={r.name} color={statusChipProps("pending").color} />
                ))}
              </Stack>
              <Button component={RouterLink} to="/restaurant/inventory" sx={{ mt: 2 }}>
                Manage inventory
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
