import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { MENU_ITEMS } from "../../demo/mockData";
import { useCart } from "../../contexts/CartContext";

export function MenuPage() {
  const { addItem } = useCart();
  const categories = useMemo(() => ["All", ...Array.from(new Set(MENU_ITEMS.map((m) => m.category)))], []);
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? MENU_ITEMS : MENU_ITEMS.filter((m) => m.category === cat);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Menu
      </Typography>
      <Tabs value={cat} onChange={(_, v) => setCat(v)} variant="scrollable" scrollButtons="auto">
        {categories.map((c) => (
          <Tab key={c} label={c} value={c} />
        ))}
      </Tabs>
      <Stack spacing={2}>
        {filtered.map((item) => (
          <Card key={item.id} variant="outlined" sx={{ overflow: "hidden", opacity: item.available ? 1 : 0.72 }}>
            <CardMedia
              component="img"
              image={item.imageUrl}
              alt={item.name}
              sx={{
                height: 168,
                objectFit: "cover",
                filter: item.available ? undefined : "grayscale(0.35) brightness(0.92)",
              }}
            />
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </div>
                <Typography sx={{ fontWeight: 600 }}>${(item.priceCents / 100).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
                <Chip size="small" label={item.category} variant="outlined" />
                {item.available ? (
                  <Chip size="small" label="Available" color="success" variant="outlined" />
                ) : (
                  <Chip size="small" label="Unavailable" color="default" variant="outlined" />
                )}
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<AddIcon />}
                disabled={!item.available}
                onClick={() => addItem(item)}
                aria-label={`Add ${item.name}`}
              >
                Add
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
