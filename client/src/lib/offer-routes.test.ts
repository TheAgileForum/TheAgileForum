import { describe, expect, it } from "vitest";
import {
  MENTORSHIP_OFFER_CODE,
  MENTORSHIP_PUBLIC_SLUG,
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

  it("preserves routes for offerings without a public alias", () => {
    expect(offerDetailPath("safe-scrum-master-certification-training")).toBe(
      "/offers/safe-scrum-master-certification-training",
    );
    expect(resolveOfferRouteCode("unknown-offer")).toBe("unknown-offer");
  });
});
