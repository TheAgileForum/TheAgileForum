import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import { CatalogSecondaryNav } from "../components/forum/CatalogSecondaryNav";
import { GlobalCartButton } from "../components/forum/GlobalCartButton";
import { SessionCurrencySelector } from "../components/forum/SessionCurrencySelector";
import { TrustFooter } from "../components/forum/TrustFooter";
import { EmailVerificationBanner } from "../components/EmailVerificationBanner";
import { useAuth } from "../contexts/AuthContext";

const CATALOG_PATHS = ["/trainings", "/certifications", "/services", "/cart"];

export function ForumLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const showCatalogNav =
    CATALOG_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/offers/");
  const wideLayout =
    showCatalogNav || pathname.startsWith("/cart");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: { xs: 1, md: 0 }, mr: { md: 2 }, textDecoration: "none", color: "inherit", fontWeight: 700 }}
          >
            The Agile Forum
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
          >
            <Button component={RouterLink} to="/trainings" size="small" color="inherit">
              Trainings
            </Button>
            <Button component={RouterLink} to="/certifications" size="small" color="inherit">
              Certifications
            </Button>
            <Button component={RouterLink} to="/services" size="small" color="inherit">
              Services
            </Button>
            <Button component={RouterLink} to="/diagnosis/step-1" size="small" color="inherit">
              Diagnose
            </Button>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <SessionCurrencySelector />
          <GlobalCartButton />
          {user ? (
            <>
              <Typography variant="caption" sx={{ display: { xs: "none", sm: "block" } }}>
                {user.email}
              </Typography>
              <Button size="small" onClick={() => void logout()}>
                Log out
              </Button>
            </>
          ) : (
            <Button component={RouterLink} to="/login" color="inherit" size="small">
              Sign in
            </Button>
          )}
        </Toolbar>
        {showCatalogNav ? <CatalogSecondaryNav /> : null}
      </AppBar>
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          maxWidth: wideLayout ? 1100 : 800,
          mx: "auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <EmailVerificationBanner />
        <Outlet />
      </Box>
      <TrustFooter />
    </Box>
  );
}
