import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { INVENTORY_ROWS, type InventoryRow } from "../../demo/mockData";

export function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>(INVENTORY_ROWS);

  const gridRows = useMemo(() => rows.map((r, i) => ({ ...r, rowId: i })), [rows]);

  const columns: GridColDef[] = [
    { field: "sku", headerName: "SKU", width: 110 },
    { field: "name", headerName: "Item", flex: 1, minWidth: 160 },
    {
      field: "qty",
      headerName: "Qty",
      width: 100,
      editable: true,
      type: "number",
    },
    { field: "lowThreshold", headerName: "Low at", width: 100 },
  ];

  return (
    <Stack spacing={2} sx={{ minHeight: 440 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Inventory
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Edit quantities inline (demo); save bar is illustrative.
      </Typography>
      <DataGrid
        rows={gridRows}
        getRowId={(r) => r.rowId}
        columns={columns}
        density="compact"
        processRowUpdate={(newRow) => {
          setRows((prev) =>
            prev.map((p) => (p.id === newRow.id ? { ...p, qty: Number(newRow.qty) } : p)),
          );
          return newRow;
        }}
        sx={{ border: "none" }}
      />
      <Button variant="contained" disabled>
        Save changes (demo)
      </Button>
    </Stack>
  );
}
