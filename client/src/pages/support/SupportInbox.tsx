import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { INCIDENT_ROWS } from "../../demo/mockData";
import { statusChipProps } from "../../lib/statusMapping";

export function SupportInbox() {
  const rows = useMemo(() => INCIDENT_ROWS.map((r, i) => ({ ...r, rowId: i })), []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Incident", width: 120 },
    {
      field: "severity",
      headerName: "Sev",
      width: 90,
      renderCell: (p) => {
        const c = statusChipProps(String(p.value).toLowerCase());
        return <Chip size="small" label={c.label} color={c.color} />;
      },
    },
    { field: "summary", headerName: "Summary", flex: 2, minWidth: 200 },
    { field: "ageMin", headerName: "Age (m)", width: 90 },
    { field: "blast", headerName: "Blast", flex: 1, minWidth: 100 },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      renderCell: (p) => (
        <Button size="small" component={RouterLink} to={`/support/incidents/${p.row.id}`}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2} sx={{ minHeight: 440 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Incident inbox
      </Typography>
      <DataGrid
        rows={rows}
        getRowId={(r) => r.rowId}
        columns={columns}
        density="compact"
        disableRowSelectionOnClick
        sx={{ border: "none" }}
      />
    </Stack>
  );
}
