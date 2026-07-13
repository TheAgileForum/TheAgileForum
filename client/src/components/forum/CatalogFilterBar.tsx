import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useRef, useState } from "react";
import type { CatalogFilters } from "../../lib/catalog-filters";
import { DELIVERY_FILTER_OPTIONS, ROLE_FILTER_OPTIONS } from "../../lib/catalog-filters";

type CatalogFilterBarProps = {
  filters: CatalogFilters;
  showCertBody: boolean;
  onChange: (next: CatalogFilters) => void;
  onReset: () => void;
};

const PRICE_DEBOUNCE_MS = 400;

function DebouncedPriceField({
  label,
  value,
  onCommit,
  sx,
}: {
  label: string;
  value?: number;
  onCommit: (next: number | undefined) => void;
  sx?: { width: number };
}) {
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    setDraft(value?.toString() ?? "");
  }, [value]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = draft.trim();
      const next = trimmed ? Number(trimmed) : undefined;
      const normalized = next !== undefined && Number.isFinite(next) ? next : undefined;
      if (normalized === value) return;
      onCommitRef.current(normalized);
    }, PRICE_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [draft, value]);

  return (
    <TextField
      size="small"
      label={label}
      type="number"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      sx={sx}
    />
  );
}

export function CatalogFilterBar({ filters, showCertBody, onChange, onReset }: CatalogFilterBarProps) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        {ROLE_FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.value || "all"}
            label={opt.label}
            size="small"
            variant={filters.role === opt.value || (!filters.role && !opt.value) ? "filled" : "outlined"}
            color={filters.role === opt.value || (!filters.role && !opt.value) ? "primary" : "default"}
            onClick={() => onChange({ ...filters, role: opt.value || undefined })}
          />
        ))}
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        {showCertBody ? (
          <TextField
            select
            size="small"
            label="Cert body"
            value={filters.certBody ?? ""}
            onChange={(e) => onChange({ ...filters, certBody: e.target.value || undefined })}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All bodies</MenuItem>
            <MenuItem value="scrum.org">Scrum.org</MenuItem>
            <MenuItem value="scaled agile">Scaled Agile</MenuItem>
          </TextField>
        ) : null}
        <TextField
          select
          size="small"
          label="Format"
          value={filters.deliveryMode ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              deliveryMode: (e.target.value as "live" | "self_paced" | "") || undefined,
            })
          }
          sx={{ minWidth: 140 }}
        >
          {DELIVERY_FILTER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value || "any"} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <DebouncedPriceField
          label="Min price"
          value={filters.minPrice}
          onCommit={(minPrice) => onChange({ ...filters, minPrice })}
          sx={{ width: 110 }}
        />
        <DebouncedPriceField
          label="Max price"
          value={filters.maxPrice}
          onCommit={(maxPrice) => onChange({ ...filters, maxPrice })}
          sx={{ width: 110 }}
        />
        <Chip
          label="Upcoming batch"
          size="small"
          variant={filters.upcomingBatch ? "filled" : "outlined"}
          color={filters.upcomingBatch ? "primary" : "default"}
          onClick={() =>
            onChange({
              ...filters,
              upcomingBatch: filters.upcomingBatch ? undefined : true,
            })
          }
          sx={{ alignSelf: "center" }}
        />
        <Button size="small" onClick={onReset} sx={{ alignSelf: "center" }}>
          Reset filters
        </Button>
      </Stack>
    </Stack>
  );
}
