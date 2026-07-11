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
const INK = "#0a1628";

const PRIMARY_NAV = [
  { label: "Trainings", to: "/trainings" },
  { label: "Certifications", to: "/certifications" },
  { label: "Services", to: "/services" },
  { label: "Resources", to: "/resources" },
  { label: "Webinars", to: "/webinars" },
  { label: "Assessment", to: "/diagnosis/step-1" },
  { label: "About", to: "/about" },
] as const;

const navButtonSx = {
  color: "rgba(255,255,255,0.78)",
  letterSpacing: "0.06em",
  fontSize: "0.72rem",
} as const;

export function ForumLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const showCatalogNav =
    CATALOG_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/offers/");
  const wideLayout = showCatalogNav || pathname.startsWith("/cart") || isHome;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: INK,
          color: "rgba(255,255,255,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: "wrap", minHeight: { xs: 64, sm: 72 } }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 2 },
              textDecoration: "none",
              lineHeight: 1,
              "&:hover": { opacity: 0.92 },
            }}
          >
            <Box
              component="img"
              src="/logo-the-agile-forum.png"
              alt="The Agile Forum"
              sx={{ height: 40, width: "auto", display: "block" }}
            />
          </Box>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}>
            {PRIMARY_NAV.map((item) => (
              <Button key={item.to} component={RouterLink} to={item.to} size="small" sx={navButtonSx}>
                {item.label}
              </Button>
            ))}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <SessionCurrencySelector />
          <GlobalCartButton />
          {user ? (
            <>
              <Typography variant="caption" sx={{ display: { xs: "none", sm: "block" }, color: "rgba(255,255,255,0.65)" }}>
                {user.email}
              </Typography>
              <Button size="small" onClick={() => void logout()} sx={{ color: "#fff" }}>
                Log out
              </Button>
            </>
          ) : (
            <Button component={RouterLink} to="/login" size="small" sx={{ color: "#fff" }}>
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
          p: isHome ? 0 : { xs: 2, sm: 3 },
          maxWidth: isHome ? "none" : wideLayout ? 1100 : 800,
          mx: "auto",
          width: "100%",
          boxSizing: "border-box",
          pb: isHome ? { xs: 9, sm: 0 } : undefined,
        }}
      >
        <EmailVerificationBanner />
        <Outlet />
      </Box>
      <TrustFooter />
    </Box>
  );
}
