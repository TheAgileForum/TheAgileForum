import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { ReactNode } from "react";

type StickyMobileCtaProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  secondary?: ReactNode;
};

export function StickyMobileCta({ label, onClick, disabled, secondary }: StickyMobileCtaProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isMobile) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        px: 2,
        py: 1.5,
        pb: "calc(12px + env(safe-area-inset-bottom))",
        bgcolor: "rgba(10, 22, 40, 0.92)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        zIndex: 40,
      }}
    >
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={disabled}
        onClick={onClick}
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
          "&:hover": { bgcolor: "primary.light" },
        }}
      >
        {label}
      </Button>
      {secondary ? <Box sx={{ mt: 1 }}>{secondary}</Box> : null}
    </Box>
  );
}
