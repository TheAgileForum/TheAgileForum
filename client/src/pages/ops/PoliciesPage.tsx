import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { POLICY_ROWS, type PolicyRow } from "../../demo/mockData";

export function PoliciesPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PolicyRow | null>(null);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Policies
      </Typography>
      <List>
        {POLICY_ROWS.map((p) => (
          <ListItem
            key={p.id}
            secondaryAction={
              <Button size="small" onClick={() => { setSelected(p); setOpen(true); }}>
                Edit
              </Button>
            }
          >
            <ListItemText primary={p.name} secondary={`${p.scope} · ${p.updated}`} />
          </ListItem>
        ))}
      </List>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 360, p: 2 } } }}>
        <Typography variant="h6" gutterBottom>
          Edit policy
        </Typography>
        {selected ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Name" defaultValue={selected.name} fullWidth />
            <TextField label="Scope" defaultValue={selected.scope} fullWidth multiline minRows={2} />
            <Button variant="contained" onClick={() => setOpen(false)}>
              Save (demo)
            </Button>
          </Stack>
        ) : null}
      </Drawer>
    </Stack>
  );
}
