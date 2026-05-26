import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { internalTheme } from "../theme/internal-theme";

export function OpsLayout() {
  return (
    <ThemeProvider theme={internalTheme}>
      <CssBaseline />
      <WorkspaceShell
        workspaceTitle="Ops admin"
        tenantLabel="Cross-tenant (masked)"
        roleLabel="Ops"
        navItems={[
          { label: "← Customer app", path: "/" },
          { label: "Signals", path: "/ops" },
          { label: "Policies", path: "/ops/policies" },
          { label: "Pending decisions", path: "/ops/decisions" },
        ]}
      >
        <Outlet />
      </WorkspaceShell>
    </ThemeProvider>
  );
}
