import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { DECISION_ROWS } from "../../demo/mockData";
import { DecisionRationale } from "../../components/DecisionRationale";

export function DecisionsPage() {
  const rows = useMemo(() => DECISION_ROWS.map((r, i) => ({ ...r, rowId: i })), []);

  const columns: GridColDef[] = [
    { field: "orderId", headerName: "Order", flex: 1, minWidth: 120 },
    { field: "proposal", headerName: "Proposal", flex: 2, minWidth: 200 },
    { field: "confidence", headerName: "Conf.", width: 90 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "",
      width: 120,
      sortable: false,
      renderCell: (p) => (
        <Button size="small" component={RouterLink} to={`/ops/orders/${p.row.orderId}`}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2} sx={{ minHeight: 480 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Pending automation approvals
      </Typography>
      <DecisionRationale
        summary="Model confidence & guardrails"
        details="Approvals above 0.85 auto-apply in prod; demo grid shows items awaiting human sign-off (FR22, FR39)."
        defaultExpanded
      />
      <DataGrid
        rows={rows}
        getRowId={(r) => r.rowId}
        columns={columns}
        density="compact"
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10]}
        sx={{ border: "none" }}
      />
    </Stack>
  );
}
