import { Router } from "express";
import {
  getUpsellRecommendations,
  upsellContexts,
} from "../recommendations/upsell-service.js";
import { parsePricingInputFromRequest } from "../pricing/pricing-service.js";

export const recommendationsRouter = Router();

recommendationsRouter.get("/upsell", (req, res) => {
  const targetRole =
    typeof req.query.target_role === "string" ? req.query.target_role : "";
  const context =
    typeof req.query.context === "string" ? req.query.context : "";
  const offerId =
    typeof req.query.offer_id === "string" ? req.query.offer_id : undefined;
  const gapTagsRaw =
    typeof req.query.gap_tags === "string" ? req.query.gap_tags : "";
  const gapTags = gapTagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!targetRole.trim()) {
    return res.status(400).json({
      error: {
        code: "TARGET_ROLE_REQUIRED",
        message: "target_role query parameter is required",
      },
    });
  }

  if (!upsellContexts.includes(context as (typeof upsellContexts)[number])) {
    return res.status(400).json({
      error: {
        code: "INVALID_CONTEXT",
        message: `context must be one of: ${upsellContexts.join(", ")}`,
      },
    });
  }

  const pricingInput = parsePricingInputFromRequest(req);

  const recommendations = getUpsellRecommendations({
    targetRole,
    context: context as (typeof upsellContexts)[number],
    offerId,
    gapTags,
    currency: pricingInput.currencyOverride ?? pricingInput.sessionCurrencyCookie,
    geo: pricingInput.geo,
  });

  return res.json(recommendations);
});
