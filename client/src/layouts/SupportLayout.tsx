import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { internalTheme } from "../theme/internal-theme";

export function SupportLayout() {
  return (
    <ThemeProvider theme={internalTheme}>
      <CssBaseline />
      <WorkspaceShell
        workspaceTitle="Support"
        tenantLabel="Tenant: demo-east"
        roleLabel="Agent"
        navItems={[
          { label: "← Customer app", path: "/" },
          { label: "Incident inbox", path: "/support" },
        ]}
      >
        <Outlet />
      </WorkspaceShell>
    </ThemeProvider>
  );
}
