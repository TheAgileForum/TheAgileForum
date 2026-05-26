import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { ChangeSummary } from "../../components/ChangeSummary";

/** Full-page / deep-linked recovery demo (checkout can open the same content in a Drawer). */
export function RecoveryPage() {
  const navigate = useNavigate();

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720, mx: "auto" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Recovery proposal
      </Typography>
      <ChangeSummary
        beforeLabel="Spicy Arrabbiata — penne"
        afterLabel="Spicy Arrabbiata — fusilli (same sauce & heat)"
        onAccept={() => navigate("/orders/demo-recovery")}
        onEditCart={() => navigate("/cart")}
        onCancel={() => navigate("/menu")}
      />
    </Paper>
  );
}
