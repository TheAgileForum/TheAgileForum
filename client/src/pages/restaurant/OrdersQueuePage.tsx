import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { RESTAURANT_QUEUE_ROWS } from "../../demo/mockData";
import { statusChipProps } from "../../lib/statusMapping";

export function OrdersQueuePage() {
  const rows = useMemo(
    () => RESTAURANT_QUEUE_ROWS.map((r, i) => ({ ...r, rowId: i })),
    [],
  );

  const columns: GridColDef[] = [
    { field: "id", headerName: "Order", flex: 1, minWidth: 120 },
    { field: "placedAt", headerName: "Time", width: 90 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (p) => {
        const c = statusChipProps(String(p.value).toLowerCase());
        return <Chip size="small" label={c.label} color={c.color} />;
      },
    },
    {
      field: "flags",
      headerName: "Flags",
      flex: 1,
      minWidth: 100,
      renderCell: (p) =>
        p.value ? <Chip size="small" label={String(p.value)} color="warning" /> : <span>—</span>,
    },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 100,
      renderCell: (p) => (
        <Button size="small" component={RouterLink} to={`/restaurant/orders/${p.row.id}`}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2} sx={{ height: "100%", minHeight: 420 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Orders queue
      </Typography>
      <DataGrid
        rows={rows}
        getRowId={(r) => r.rowId}
        columns={columns}
        density="compact"
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={{ border: "none" }}
      />
    </Stack>
  );
}
