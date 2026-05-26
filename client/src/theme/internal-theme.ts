import { createTheme } from "@mui/material/styles";

/** Internal / ops / restaurant dark theme (D2 — dense). */
export const internalTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2dd4bf" },
    secondary: { main: "#fbbf24" },
    background: { default: "#12151a", paper: "#1a1f26" },
  },
  shape: { borderRadius: 8 },
});
