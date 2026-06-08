/** Default tenant for self-serve registration (matches prisma seed). */
export const DEFAULT_REGISTRATION_TENANT_ID =
  "00000000-0000-4000-8000-000000000001";

/** HttpOnly cookie storing anonymous guest cart session token (FR-165). */
export const GUEST_CART_COOKIE_NAME = "guest_cart_session";

export const GUEST_CART_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** Client session currency cookie (FR-178); readable by browser and API. */
export { SESSION_CURRENCY_COOKIE, SESSION_CURRENCY_MAX_AGE_MS } from "../pricing/pricing-service.js";
