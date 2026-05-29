import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet, Link as RouterLink } from "react-router-dom";
import { TrustFooter } from "../components/forum/TrustFooter";
import { useAuth } from "../contexts/AuthContext";

export function ForumLayout() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit", fontWeight: 700 }}
          >
            The Agile Forum
          </Typography>
          <Button component={RouterLink} to="/diagnosis/step-1" color="inherit" size="small">
            Diagnose
          </Button>
          {user ? (
            <>
              <Typography variant="caption" sx={{ mx: 1, display: { xs: "none", sm: "block" } }}>
                {user.email}
              </Typography>
              <Button size="small" onClick={() => void logout()}>
                Log out
              </Button>
            </>
          ) : (
            <Button component={RouterLink} to="/login" color="inherit" size="small" sx={{ ml: 1 }}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{ flex: 1, p: { xs: 2, sm: 3 }, maxWidth: 800, mx: "auto", width: "100%", boxSizing: "border-box" }}
      >
        <Outlet />
      </Box>
      <TrustFooter />
    </Box>
  );
}
