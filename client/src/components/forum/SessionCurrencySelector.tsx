import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import { usePricing } from "../../contexts/PricingContext";
import { listSessionCurrencies, type SessionCurrency } from "../../lib/session-currency";

export function SessionCurrencySelector() {
  const { currency, setCurrency, loading } = usePricing();

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
      sx={{ minWidth: 72, fontSize: 13, fontWeight: 600, ".MuiSelect-select": { py: 0.5 } }}
    >
      {listSessionCurrencies().map((c) => (
        <MenuItem key={c} value={c}>
          {c}
        </MenuItem>
      ))}
    </Select>
  );
}
