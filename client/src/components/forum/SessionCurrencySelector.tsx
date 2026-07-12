import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { usePricing } from "../../contexts/PricingContext";
import {
  listSessionCurrencyOptions,
  type SessionCurrency,
} from "../../lib/session-currency";

export function SessionCurrencySelector({ compactOnXs = false }: { compactOnXs?: boolean }) {
  const { currency, setCurrency, loading } = usePricing();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const compact = compactOnXs && isXs;

  function onChange(e: SelectChangeEvent) {
    void setCurrency(e.target.value as SessionCurrency);
  }

  return (
    <Select
      size="small"
      value={currency}
      onChange={onChange}
      disabled={loading}
      aria-label="Session currency"
      renderValue={compact ? (value) => String(value) : undefined}
      sx={{
        minWidth: compact ? 72 : 168,
        fontSize: 13,
        fontWeight: 600,
        color: "inherit",
        ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.28)" },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
        ".MuiSelect-select": { py: 0.5, pr: compact ? "28px !important" : undefined },
        ".MuiSvgIcon-root": { color: "inherit" },
      }}
    >
      {listSessionCurrencyOptions().map(({ code, label }) => (
        <MenuItem key={code} value={code}>
          {code} — {label}
        </MenuItem>
      ))}
    </Select>
  );
}
