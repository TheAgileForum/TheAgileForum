import Box from "@mui/material/Box";
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

/**
 * Custom pill instead of MUI Chip: Chip defaults to nowrap + ellipsis and is easy
 * to re-break via theme/specificity. These pills always wrap full gap/strength text.
 */
function InsightPill({ label, tone }: { label: string; tone: "success" | "warning" }) {
  const isSuccess = tone === "success";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        maxWidth: "100%",
        boxSizing: "border-box",
        px: 1,
        py: 0.5,
        borderRadius: "16px",
        border: 1,
        borderColor: isSuccess ? "success.main" : "warning.main",
        color: isSuccess ? "success.dark" : "warning.dark",
        bgcolor: "transparent",
        typography: "caption",
        lineHeight: 1.4,
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
      }}
    >
      {label}
    </Box>
  );
}

export function SkillGapPanel({ strengths, gaps }: SkillGapPanelProps) {
  const [view, setView] = useState<"visual" | "table">("visual");

  return (
    <Stack spacing={1.5} sx={{ minWidth: 0, width: "100%" }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 1 }}>
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "flex-start", minWidth: 0, width: "100%" }}
        >
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Typography variant="subtitle2">Strengths</Typography>
            <Stack
              direction="row"
              useFlexGap
              spacing={0.5}
              sx={{ flexWrap: "wrap", maxWidth: "100%", minWidth: 0 }}
            >
              {strengths.map((s) => (
                <InsightPill key={s} label={s} tone="success" />
              ))}
            </Stack>
          </Stack>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Typography variant="subtitle2">Gaps to close</Typography>
            <Stack
              direction="row"
              useFlexGap
              spacing={0.5}
              sx={{ flexWrap: "wrap", maxWidth: "100%", minWidth: 0 }}
            >
              {gaps.map((g) => (
                <InsightPill key={g} label={g} tone="warning" />
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
                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>{s}</TableCell>
                <TableCell>Maintain</TableCell>
              </TableRow>
            ))}
            {gaps.map((g, i) => (
              <TableRow key={`g-${g}`}>
                <TableCell>Gap</TableCell>
                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>{g}</TableCell>
                <TableCell>{i === 0 ? "High" : i === 1 ? "Medium" : "Lower"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
