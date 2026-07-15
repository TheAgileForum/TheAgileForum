export const MENTORSHIP_OFFER_CODE = "course-agile-fundamentals";
export const MENTORSHIP_PUBLIC_SLUG =
  "course-AI-Enabled-agile-live-project-mentorship";
export const MENTORSHIP_LEGACY_ROUTE_SEGMENTS = [
  "scrum-master-mentorship-masterclass",
  "live-project-mentorship-masterclass-for-scrum-master-product-owner",
] as const;

const PUBLIC_SLUG_BY_OFFERING_CODE: Readonly<Record<string, string>> = {
  [MENTORSHIP_OFFER_CODE]: MENTORSHIP_PUBLIC_SLUG,
};

const OFFERING_CODE_BY_ROUTE_SEGMENT: Readonly<Record<string, string>> = {
  [MENTORSHIP_PUBLIC_SLUG.toLowerCase()]: MENTORSHIP_OFFER_CODE,
  ...Object.fromEntries(
    MENTORSHIP_LEGACY_ROUTE_SEGMENTS.map((segment) => [
      segment.toLowerCase(),
      MENTORSHIP_OFFER_CODE,
    ]),
  ),
};

/** Build the public offer-detail path without changing stable commerce IDs. */
export function offerDetailPath(offeringCode: string): string {
  return `/offers/${PUBLIC_SLUG_BY_OFFERING_CODE[offeringCode] ?? offeringCode}`;
}

/** Resolve a public route segment back to the stable code used by API/cart/order flows. */
export function resolveOfferRouteCode(routeSegment: string): string {
  const normalizedSegment = routeSegment.toLowerCase();
  return OFFERING_CODE_BY_ROUTE_SEGMENT[normalizedSegment] ?? routeSegment;
}
