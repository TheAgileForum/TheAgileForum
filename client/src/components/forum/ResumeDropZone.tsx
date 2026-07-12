import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useCallback, useState, type DragEvent } from "react";

type ResumeDropZoneProps = {
  file: File | null;
  onFile: (file: File | null) => void;
  maxMb: number;
  accept: string;
  disabled?: boolean;
};

export function ResumeDropZone({ file, onFile, maxMb, accept, disabled = false }: ResumeDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [disabled, onFile],
  );

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      sx={{
        border: 2,
        borderStyle: "dashed",
        borderColor: dragOver ? "primary.main" : "divider",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        bgcolor: dragOver ? "action.hover" : "background.paper",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
      component="label"
    >
      <input
        type="file"
        hidden
        accept={accept}
        disabled={disabled}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <CloudUploadOutlinedIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {file ? file.name : "Drop resume here or tap to browse"}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
        PDF or Word · max {maxMb}MB
      </Typography>
    </Box>
  );
}
