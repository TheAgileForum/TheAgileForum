import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import { Link as RouterLink } from "react-router-dom";
import { useForumCart } from "../../contexts/ForumCartContext";
import { trackEvent } from "../../lib/analytics";

export function GlobalCartButton() {
  const { itemCount } = useForumCart();

  return (
    <IconButton
      component={RouterLink}
      to="/cart"
      data-testid="global-cart-button"
      aria-label={`Cart, ${itemCount} items`}
      color="inherit"
      size="small"
      onClick={() => trackEvent("global_cart_clicked", { count: itemCount })}
    >
      <Badge badgeContent={itemCount > 0 ? itemCount : undefined} color="primary">
        <ShoppingCartOutlinedIcon fontSize="small" />
      </Badge>
    </IconButton>
  );
}
