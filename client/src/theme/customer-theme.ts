import { createTheme } from "@mui/material/styles";

/** Customer-facing light theme (UX-DR1 — calm, credible). */
export const customerTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0d9488" },
    secondary: { main: "#d97706" },
    background: { default: "#faf8f5", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
});
