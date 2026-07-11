import { createTheme } from "@mui/material/styles";

/** Customer-facing light theme — ink / teal direction from homepage mock v2. */
export const customerTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0f9f8f", dark: "#0b7a6e", light: "#12b5a3", contrastText: "#ffffff" },
    secondary: { main: "#0a1628" },
    background: { default: "#f3f6f9", paper: "#ffffff" },
    text: { primary: "#0f1c2e", secondary: "#5b6b7c" },
    divider: "rgba(15, 28, 46, 0.12)",
  },
  typography: {
    fontFamily: '"Sora", system-ui, sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560, letterSpacing: "-0.02em" },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560, letterSpacing: "-0.02em" },
    h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560, letterSpacing: "-0.02em" },
    h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560, letterSpacing: "-0.02em" },
    h5: { fontFamily: '"Sora", system-ui, sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Sora", system-ui, sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Sora", system-ui, sans-serif', textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 4 },
});
