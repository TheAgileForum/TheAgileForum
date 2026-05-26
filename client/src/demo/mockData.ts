export type MenuItem = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  available: boolean;
  /** Sample photo for demo UI (Unsplash, stable direct URLs). */
  imageUrl: string;
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Margherita",
    description: "Tomato, mozzarella, basil",
    priceCents: 1299,
    category: "Pizza",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m2",
    name: "Spicy Arrabbiata",
    description: "Penne, chili, garlic",
    priceCents: 1499,
    category: "Pasta",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m3",
    name: "Truffle Risotto",
    description: "Arborio rice, parmesan",
    priceCents: 1899,
    category: "Risotto",
    available: false,
    imageUrl:
      "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m4",
    name: "Tiramisu",
    description: "Coffee, mascarpone",
    priceCents: 799,
    category: "Dessert",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m5",
    name: "Vanilla bean gelato",
    description: "Two scoops, optional chocolate dip",
    priceCents: 649,
    category: "Dessert",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m6",
    name: "House Negroni",
    description: "Gin, sweet vermouth, Campari, orange peel",
    priceCents: 1299,
    category: "Cocktails",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1556679343-c7306c1970bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m7",
    name: "Limoncello spritz",
    description: "Prosecco, limoncello, soda, fresh mint",
    priceCents: 1099,
    category: "Cocktails",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1546171753-97dde67ffe7a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m8",
    name: "Espresso martini",
    description: "Vodka, coffee liqueur, fresh espresso",
    priceCents: 1399,
    category: "Cocktails",
    available: true,
    imageUrl:
      "https://images.unsplash.com/photo-1514362548677-3f69c58e458?auto=format&fit=crop&w=800&q=80",
  },
];

export type QueueOrderRow = {
  id: string;
  placedAt: string;
  status: string;
  flags: string;
};

export const RESTAURANT_QUEUE_ROWS: QueueOrderRow[] = [
  { id: "ord-1042", placedAt: "12:04", status: "NEW", flags: "" },
  { id: "ord-1041", placedAt: "12:01", status: "PREPARING", flags: "Reroute" },
  { id: "ord-1040", placedAt: "11:58", status: "READY", flags: "" },
];

export type InventoryRow = {
  id: string;
  sku: string;
  name: string;
  qty: number;
  lowThreshold: number;
};

export const INVENTORY_ROWS: InventoryRow[] = [
  { id: "i1", sku: "SAU-TOM", name: "Tomato sauce (L)", qty: 12, lowThreshold: 4 },
  { id: "i2", sku: "CHZ-MOZ", name: "Mozzarella (kg)", qty: 3, lowThreshold: 5 },
  { id: "i3", sku: "PST-PEN", name: "Penne (kg)", qty: 8, lowThreshold: 2 },
];

export type OpsSignal = {
  id: string;
  label: string;
  severity: "info" | "warning" | "error";
  value: string;
  updated: string;
};

export const OPS_SIGNALS: OpsSignal[] = [
  { id: "s1", label: "Orders behind SLA", severity: "warning", value: "7", updated: "2m ago" },
  { id: "s2", label: "Inventory risk (tenants)", severity: "error", value: "2", updated: "5m ago" },
  { id: "s3", label: "Healthy completions (24h)", severity: "info", value: "412", updated: "live" },
];

export type PolicyRow = { id: string; name: string; scope: string; updated: string };

export const POLICY_ROWS: PolicyRow[] = [
  { id: "p1", name: "Max substitute price delta", scope: "Tenant default", updated: "2026-04-20" },
  { id: "p2", name: "Fallback to partner kitchen", scope: "Region US-W", updated: "2026-04-18" },
];

export type DecisionRow = {
  id: string;
  orderId: string;
  proposal: string;
  confidence: string;
  status: string;
};

export const DECISION_ROWS: DecisionRow[] = [
  {
    id: "d1",
    orderId: "ord-1038",
    proposal: "Substitute penne → fusilli",
    confidence: "0.91",
    status: "Pending",
  },
  {
    id: "d2",
    orderId: "ord-1035",
    proposal: "Delay ETA +8m (kitchen load)",
    confidence: "0.78",
    status: "Pending",
  },
];

export type IncidentRow = {
  id: string;
  severity: string;
  summary: string;
  ageMin: number;
  blast: string;
};

export const INCIDENT_ROWS: IncidentRow[] = [
  { id: "inc-901", severity: "P1", summary: "Payment capture stuck", ageMin: 12, blast: "3 orders" },
  { id: "inc-900", severity: "P2", summary: "Wrong tenant label in ops view", ageMin: 45, blast: "1 tenant" },
];

export type DeliveryTask = {
  id: string;
  address: string;
  eta: string;
  status: string;
};

export const DELIVERY_TASKS: DeliveryTask[] = [
  { id: "del-77", address: "1200 Market St", eta: "18 min", status: "En route" },
  { id: "del-76", address: "44 Valencia Ave", eta: "32 min", status: "Picked up" },
];

export const TRACKING_STEPS = [
  { key: "placed", label: "Order placed", done: true },
  { key: "confirmed", label: "Restaurant confirmed", done: true },
  { key: "prep", label: "Preparing", done: true },
  { key: "ready", label: "Ready for pickup", done: false },
  { key: "delivery", label: "Out for delivery", done: false },
];
