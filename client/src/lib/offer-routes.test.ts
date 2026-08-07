import { describe, expect, it } from "vitest";
import {
  MENTORSHIP_LEGACY_ROUTE_SEGMENTS,
  MENTORSHIP_OFFER_CODE,
  MENTORSHIP_PUBLIC_SLUG,
  POWER_RESUME_LEGACY_ROUTE_SEGMENTS,
  POWER_RESUME_OFFER_CODE,
  POWER_RESUME_PUBLIC_SLUG,
  offerDetailPath,
  resolveOfferRouteCode,
} from "./offer-routes";

describe("offer routes", () => {
  it("emits the mentorship public slug without changing its stable code", () => {
    expect(offerDetailPath(MENTORSHIP_OFFER_CODE)).toBe(
      `/offers/${MENTORSHIP_PUBLIC_SLUG}`,
    );
    expect(resolveOfferRouteCode(MENTORSHIP_PUBLIC_SLUG)).toBe(
      MENTORSHIP_OFFER_CODE,
    );
  });

  it("resolves non-canonical slug casing so navigation can redirect it", () => {
    expect(resolveOfferRouteCode(MENTORSHIP_PUBLIC_SLUG.toLowerCase())).toBe(
      MENTORSHIP_OFFER_CODE,
    );
  });

  it("resolves legacy mentorship routes to the stable offer code", () => {
    for (const routeSegment of MENTORSHIP_LEGACY_ROUTE_SEGMENTS) {
      expect(resolveOfferRouteCode(routeSegment)).toBe(
        MENTORSHIP_OFFER_CODE,
      );
    }
  });

  it("emits the resume public slug without changing its stable code", () => {
    expect(offerDetailPath(POWER_RESUME_OFFER_CODE)).toBe(
      `/offers/${POWER_RESUME_PUBLIC_SLUG}`,
    );
    expect(resolveOfferRouteCode(POWER_RESUME_PUBLIC_SLUG)).toBe(
      POWER_RESUME_OFFER_CODE,
    );
  });

  it("resolves legacy resume routes to the stable offer code", () => {
    for (const routeSegment of POWER_RESUME_LEGACY_ROUTE_SEGMENTS) {
      expect(resolveOfferRouteCode(routeSegment)).toBe(POWER_RESUME_OFFER_CODE);
    }
  });

  it("preserves routes for offerings without a public alias", () => {
    expect(offerDetailPath("safe-scrum-master-certification-training")).toBe(
      "/offers/safe-scrum-master-certification-training",
    );
    expect(offerDetailPath("csm-certification-training")).toBe(
      "/offers/csm-certification-training",
    );
    expect(offerDetailPath("safe-rte-certification-training")).toBe(
      "/offers/safe-rte-certification-training",
    );
    expect(offerDetailPath("psm-ii-certification-training")).toBe(
      "/offers/psm-ii-certification-training",
    );
    expect(resolveOfferRouteCode("unknown-offer")).toBe("unknown-offer");
  });
});
