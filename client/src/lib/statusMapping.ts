import type { ChipProps } from "@mui/material/Chip";

export type SemanticStatus =
  | "draft"
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "pending"
  | "error"
  | "success"
  | "info";

/** UX-DR10 — single vocabulary for chips. */
export function statusChipProps(status: string): {
  label: string;
  color: ChipProps["color"];
  variant?: ChipProps["variant"];
} {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, { label: string; color: ChipProps["color"] }> = {
    draft: { label: "Draft", color: "default" },
    placed: { label: "Placed", color: "info" },
    new: { label: "New", color: "info" },
    confirmed: { label: "Confirmed", color: "primary" },
    preparing: { label: "Preparing", color: "primary" },
    ready: { label: "Ready", color: "success" },
    out_for_delivery: { label: "Out for delivery", color: "secondary" },
    en_route: { label: "En route", color: "secondary" },
    picked_up: { label: "Picked up", color: "secondary" },
    delivered: { label: "Delivered", color: "success" },
    cancelled: { label: "Cancelled", color: "error" },
    pending: { label: "Pending", color: "warning" },
    p1: { label: "P1", color: "error" },
    p2: { label: "P2", color: "warning" },
    reroute: { label: "Reroute", color: "warning" },
  };
  const hit = map[s];
  if (hit) return { ...hit, variant: "filled" };
  return { label: status, color: "default", variant: "outlined" };
}
