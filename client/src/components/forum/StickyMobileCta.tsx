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
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        mt: 2,
        mx: -2,
        px: 2,
        py: 1.5,
        bgcolor: "background.default",
        borderTop: 1,
        borderColor: "divider",
        zIndex: 2,
      }}
    >
      <Button variant="contained" size="large" fullWidth disabled={disabled} onClick={onClick}>
        {label}
      </Button>
      {secondary ? <Box sx={{ mt: 1 }}>{secondary}</Box> : null}
    </Box>
  );
}
