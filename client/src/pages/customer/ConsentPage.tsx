import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ConsentPage() {
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Consent
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Demo copy: we process order and delivery data to fulfill your request. Privacy policy would live here (FR43–FR44).
      </Typography>
      <FormControlLabel control={<Checkbox checked={ok} onChange={(_, v) => setOk(v)} />} label="I acknowledge" />
      <Button variant="contained" disabled={!ok} onClick={() => navigate("/menu")}>
        Continue
      </Button>
    </Stack>
  );
}
