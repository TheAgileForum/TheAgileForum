import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { internalTheme } from "../theme/internal-theme";

export function RestaurantLayout() {
  return (
    <ThemeProvider theme={internalTheme}>
      <CssBaseline />
      <WorkspaceShell
        workspaceTitle="Restaurant manager"
        tenantLabel="Tenant: demo-east"
        roleLabel="Manager"
        navItems={[
          { label: "← Customer app", path: "/" },
          { label: "Operations hub", path: "/restaurant" },
          { label: "Orders queue", path: "/restaurant/orders" },
          { label: "Inventory", path: "/restaurant/inventory" },
        ]}
      >
        <Outlet />
      </WorkspaceShell>
    </ThemeProvider>
  );
}
