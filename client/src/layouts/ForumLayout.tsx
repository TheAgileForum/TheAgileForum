import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import { CatalogSecondaryNav } from "../components/forum/CatalogSecondaryNav";
import { GlobalCartButton } from "../components/forum/GlobalCartButton";
import { SessionCurrencySelector } from "../components/forum/SessionCurrencySelector";
import { TrustFooter } from "../components/forum/TrustFooter";
import { EmailVerificationBanner } from "../components/EmailVerificationBanner";
import { useAuth } from "../contexts/AuthContext";

const CATALOG_PATHS = ["/trainings", "/certifications", "/services", "/cart"];
const INK = "#0a1628";
const DRAWER_WIDTH = 280;

const PRIMARY_NAV = [
  { label: "Trainings", to: "/trainings" },
  { label: "Certifications", to: "/certifications" },
  { label: "Services", to: "/services" },
  { label: "Resources", to: "/resources" },
  { label: "Webinars", to: "/webinars" },
  { label: "Assessment", to: "/diagnosis/step-1" },
  { label: "Testimonials", to: "/testimonials" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";
  const showCatalogNav =
    CATALOG_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/offers/");
  const wideLayout =
    showCatalogNav || pathname.startsWith("/cart") || pathname.startsWith("/testimonials") || isHome;

  const closeMobileNav = () => setMobileOpen(false);

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
        <Toolbar
          sx={{
            gap: { xs: 0.5, sm: 1 },
            flexWrap: "nowrap",
            minHeight: { xs: 56, sm: 72 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" }, mr: 0.25 }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              flexShrink: 0,
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
              sx={{ height: { xs: 32, sm: 40 }, width: "auto", display: "block" }}
            />
          </Box>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}>
            {PRIMARY_NAV.map((item) => (
              <Button key={item.to} component={RouterLink} to={item.to} size="small" sx={navButtonSx}>
                {item.label}
              </Button>
            ))}
          </Stack>
          <Box sx={{ flexGrow: 1, minWidth: 8 }} />
          <SessionCurrencySelector compactOnXs />
          <GlobalCartButton />
          {user ? (
            <>
              <Typography variant="caption" sx={{ display: { xs: "none", sm: "block" }, color: "rgba(255,255,255,0.65)" }}>
                {user.email}
              </Typography>
              <Button size="small" onClick={() => void logout()} sx={{ color: "#fff", minWidth: { xs: 0 }, px: { xs: 1, sm: 1.5 } }}>
                Log out
              </Button>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              size="small"
              sx={{ color: "#fff", minWidth: { xs: 0 }, px: { xs: 1, sm: 1.5 }, whiteSpace: "nowrap" }}
            >
              Sign in
            </Button>
          )}
        </Toolbar>
        {showCatalogNav ? <CatalogSecondaryNav /> : null}
      </AppBar>

      <Drawer
        anchor="left"
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobileNav}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: INK,
            color: "rgba(255,255,255,0.9)",
          },
        }}
      >
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }}>
            Menu
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <List dense sx={{ py: 1 }}>
          {PRIMARY_NAV.map((item) => {
            const selected = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={selected}
                onClick={closeMobileNav}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  color: "rgba(255,255,255,0.85)",
                  "&.Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
                  },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: "0.95rem", letterSpacing: "0.04em" } } }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

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
