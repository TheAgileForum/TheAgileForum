import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

export function CartPage() {
  const { lines, setQty, removeLine, totalCents } = useCart();

  if (lines.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Cart
        </Typography>
        <Typography color="text.secondary">Your cart is empty.</Typography>
        <Button variant="contained" component={RouterLink} to="/demo/menu">
          Back to menu
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Cart
      </Typography>
      <List disablePadding>
        {lines.map(({ item, qty }) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton edge="end" aria-label="remove" onClick={() => removeLine(item.id)}>
                <DeleteIcon />
              </IconButton>
            }
            sx={{ alignItems: "flex-start", py: 2, flexDirection: "column" }}
          >
            <ListItemText primary={item.name} secondary={`$${(item.priceCents / 100).toFixed(2)} each`} />
            <TextField
              type="number"
              size="small"
              label="Qty"
              value={qty}
              onChange={(e) => setQty(item.id, Number(e.target.value))}
              slotProps={{ htmlInput: { min: 1, max: 99 } }}
              sx={{ mt: 1, maxWidth: 100 }}
            />
          </ListItem>
        ))}
      </List>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6">${(totalCents / 100).toFixed(2)}</Typography>
      </Stack>
      <Button variant="contained" size="large" component={RouterLink} to="/demo/checkout">
        Proceed to checkout
      </Button>
    </Stack>
  );
}
