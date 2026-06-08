/** Marketing discount fields forbidden on public catalog APIs (FR-179, API gate 14). */
export const FORBIDDEN_CATALOG_DISCOUNT_FIELDS = [
  "percentOff",
  "percent_off",
  "promoBadge",
  "promo_badge",
  "strikethroughPrice",
  "strikethrough_price",
  "discountPercent",
  "discount_percent",
  "listPrice",
  "list_price",
  "salePrice",
  "sale_price",
] as const;

export function collectForbiddenDiscountFields(
  value: unknown,
  path = "",
): string[] {
  if (value === null || typeof value !== "object") {
    return [];
  }

  const hits: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      hits.push(...collectForbiddenDiscountFields(entry, `${path}[${index}]`));
    });
    return hits;
  }

  for (const [key, nested] of Object.entries(value)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (
      FORBIDDEN_CATALOG_DISCOUNT_FIELDS.includes(
        key as (typeof FORBIDDEN_CATALOG_DISCOUNT_FIELDS)[number],
      )
    ) {
      hits.push(fullPath);
    }
    hits.push(...collectForbiddenDiscountFields(nested, fullPath));
  }
  return hits;
}
