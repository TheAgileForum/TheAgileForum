export const MENTORSHIP_OFFER_CODE = "course-agile-fundamentals";
export const MENTORSHIP_PUBLIC_SLUG =
  "course-AI-Enabled-agile-live-project-mentorship";

const PUBLIC_SLUG_BY_OFFERING_CODE: Readonly<Record<string, string>> = {
  [MENTORSHIP_OFFER_CODE]: MENTORSHIP_PUBLIC_SLUG,
};

/** Build the public offer-detail path without changing stable commerce IDs. */
export function offerDetailPath(offeringCode: string): string {
  return `/offers/${PUBLIC_SLUG_BY_OFFERING_CODE[offeringCode] ?? offeringCode}`;
}

/** Resolve a public route segment back to the stable code used by API/cart/order flows. */
export function resolveOfferRouteCode(routeSegment: string): string {
  const normalizedSegment = routeSegment.toLowerCase();
  const mapped = Object.entries(PUBLIC_SLUG_BY_OFFERING_CODE).find(
    ([, publicSlug]) => publicSlug.toLowerCase() === normalizedSegment,
  );
  return mapped?.[0] ?? routeSegment;
}
