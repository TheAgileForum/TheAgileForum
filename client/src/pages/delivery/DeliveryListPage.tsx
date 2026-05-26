import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { Link as RouterLink } from "react-router-dom";
import { DELIVERY_TASKS } from "../../demo/mockData";
import { statusChipProps } from "../../lib/statusMapping";

export function DeliveryListPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        My deliveries
      </Typography>
      {DELIVERY_TASKS.map((t) => {
        const c = statusChipProps(t.status.replace(/\s+/g, "_").toLowerCase());
        return (
          <Card key={t.id} variant="outlined">
            <CardActionArea component={RouterLink} to={`/delivery/${t.id}`}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Typography sx={{ fontWeight: 600 }}>{t.address}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ETA {t.eta}
                    </Typography>
                  </div>
                  <Chip size="small" label={c.label} color={c.color} />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Stack>
  );
}
