import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useState } from "react";

type SkillGapPanelProps = {
  strengths: string[];
  gaps: string[];
};

/** MUI Chip defaults to nowrap + ellipsis; long gap/strength copy must wrap fully. */
const wrapChipSx = {
  height: "auto",
  maxWidth: "100%",
  "& .MuiChip-label": {
    display: "block",
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "clip",
    py: 0.5,
  },
} as const;

export function SkillGapPanel({ strengths, gaps }: SkillGapPanelProps) {
  const [view, setView] = useState<"visual" | "table">("visual");

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Skill gap insights
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, v: "visual" | "table" | null) => v && setView(v)}
          aria-label="Gap insight view mode"
        >
          <ToggleButton value="visual" aria-label="Visual chips view">
            Chips
          </ToggleButton>
          <ToggleButton value="table" aria-label="Accessible table view">
            Table
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {view === "visual" ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "flex-start" }}>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Typography variant="subtitle2">Strengths</Typography>
            <Stack direction="row" useFlexGap spacing={0.5} sx={{ flexWrap: "wrap", maxWidth: "100%" }}>
              {strengths.map((s) => (
                <Chip key={s} label={s} size="small" color="success" variant="outlined" sx={wrapChipSx} />
              ))}
            </Stack>
          </Stack>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Typography variant="subtitle2">Gaps to close</Typography>
            <Stack direction="row" useFlexGap spacing={0.5} sx={{ flexWrap: "wrap", maxWidth: "100%" }}>
              {gaps.map((g) => (
                <Chip key={g} label={g} size="small" color="warning" variant="outlined" sx={wrapChipSx} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      ) : (
        <Table size="small" aria-label="Skill strengths and gaps">
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Skill signal</TableCell>
              <TableCell>Priority</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {strengths.map((s) => (
              <TableRow key={`s-${s}`}>
                <TableCell>Strength</TableCell>
                <TableCell>{s}</TableCell>
                <TableCell>Maintain</TableCell>
              </TableRow>
            ))}
            {gaps.map((g, i) => (
              <TableRow key={`g-${g}`}>
                <TableCell>Gap</TableCell>
                <TableCell>{g}</TableCell>
                <TableCell>{i === 0 ? "High" : i === 1 ? "Medium" : "Lower"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
