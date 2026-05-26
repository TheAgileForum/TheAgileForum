import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { customerTheme } from "../theme/customer-theme";

export function CustomerShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={customerTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
