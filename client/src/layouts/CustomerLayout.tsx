import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet, Link as RouterLink } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { userDisplayLabel } from "../lib/user-display";

export function CustomerLayout() {
  const { itemCount } = useCart();
  const { user, demoMode, logout } = useAuth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/demo"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit", fontWeight: 700 }}
          >
            Bistro Demo
          </Typography>
          {demoMode ? (
            <Typography variant="caption" sx={{ mr: 1, color: "secondary.main" }}>
              Demo browse
            </Typography>
          ) : null}
          {user ? (
            <Typography variant="caption" sx={{ mr: 1, display: { xs: "none", sm: "block" } }}>
              {userDisplayLabel(user)}
            </Typography>
          ) : null}
          <Button component={RouterLink} to="/demo/menu" color="inherit" size="small">
            Menu
          </Button>
          <IconButton component={RouterLink} to="/demo/cart" color="inherit" aria-label="cart">
            <Badge badgeContent={itemCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <Button component={RouterLink} to="/login" color="inherit" size="small" sx={{ ml: 0.5 }}>
            {user ? "Account" : "Sign in"}
          </Button>
          {user ? (
            <Button size="small" onClick={() => void logout()} sx={{ ml: 1 }}>
              Log out
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, maxWidth: 720, mx: "auto", width: "100%", boxSizing: "border-box" }}>
        <Outlet />
      </Box>
      <Box component="footer" sx={{ py: 2, px: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: "block", textAlign: "center" }}>
          Demo workspaces
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
          <Button size="small" component={RouterLink} to="/restaurant">
            Restaurant
          </Button>
          <Button size="small" component={RouterLink} to="/ops">
            Ops
          </Button>
          <Button size="small" component={RouterLink} to="/support">
            Support
          </Button>
          <Button size="small" component={RouterLink} to="/delivery">
            Delivery
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
