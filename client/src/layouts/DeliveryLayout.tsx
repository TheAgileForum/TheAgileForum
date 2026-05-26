import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { internalTheme } from "../theme/internal-theme";

export function DeliveryLayout() {
  return (
    <ThemeProvider theme={internalTheme}>
      <CssBaseline />
      <WorkspaceShell
        workspaceTitle="Delivery partner"
        tenantLabel="Partner: swift-ride"
        roleLabel="Courier"
        navItems={[
          { label: "← Customer app", path: "/" },
          { label: "My deliveries", path: "/delivery" },
        ]}
      >
        <Outlet />
      </WorkspaceShell>
    </ThemeProvider>
  );
}
