export type CatalogCategory = "training" | "certification" | "service";

export type CatalogCategoryPath = "trainings" | "certifications" | "services";

export const CATEGORY_PATH: Record<CatalogCategoryPath, CatalogCategory> = {
  trainings: "training",
  certifications: "certification",
  services: "service",
};

export const PATH_BY_CATEGORY: Record<CatalogCategory, CatalogCategoryPath> = {
  training: "trainings",
  certification: "certifications",
  service: "services",
};

export type CatalogFilters = {
  role?: string;
  certBody?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryMode?: "live" | "self_paced";
  upcomingBatch?: boolean;
};

export function parseCatalogFilters(search: string): CatalogFilters {
  const params = new URLSearchParams(search);
  const min = params.get("min_price");
  const max = params.get("max_price");
  const batch = params.get("upcoming_batch");
  return {
    role: params.get("role") ?? undefined,
    certBody: params.get("cert_body") ?? undefined,
    minPrice: min ? Number(min) : undefined,
    maxPrice: max ? Number(max) : undefined,
    deliveryMode: (params.get("delivery_mode") as "live" | "self_paced" | null) ?? undefined,
    upcomingBatch: batch === "true" ? true : batch === "false" ? false : undefined,
  };
}

export function filtersToSearchParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.certBody) params.set("cert_body", filters.certBody);
  if (filters.minPrice !== undefined) params.set("min_price", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("max_price", String(filters.maxPrice));
  if (filters.deliveryMode) params.set("delivery_mode", filters.deliveryMode);
  if (filters.upcomingBatch === true) params.set("upcoming_batch", "true");
  if (filters.upcomingBatch === false) params.set("upcoming_batch", "false");
  return params;
}

export function buildCatalogQuery(filters: CatalogFilters): string {
  const params = filtersToSearchParams(filters);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function filtersToApiQuery(filters: CatalogFilters): string {
  return buildCatalogQuery(filters).replace(/^\?/, "");
}

export const ROLE_FILTER_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "scrum_master", label: "Scrum Master" },
  { value: "product_owner", label: "Product Owner" },
  { value: "learner", label: "Learner" },
  { value: "safe_program_consultant", label: "SAFe / RTE" },
] as const;

export const DELIVERY_FILTER_OPTIONS = [
  { value: "", label: "Any format" },
  { value: "live", label: "Live" },
  { value: "self_paced", label: "Self-paced" },
] as const;

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.role ||
      filters.certBody ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.deliveryMode ||
      filters.upcomingBatch,
  );
}
