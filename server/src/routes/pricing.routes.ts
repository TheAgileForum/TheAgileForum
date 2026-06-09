import { Router } from "express";
import { z } from "zod";
import { withBodyValidation } from "../middleware/validation.js";
import {
  detectGeoFromRequest,
  parsePricingInputFromRequest,
  quoteOfferings,
  resolveCurrencyContext,
  SESSION_CURRENCY_COOKIE,
  SESSION_CURRENCY_MAX_AGE_MS,
} from "../pricing/pricing-service.js";
import { getEnv } from "../config/env.js";

export const pricingRouter = Router();

function sendCurrencyContext(
  req: import("express").Request,
  res: import("express").Response,
) {
  const input = parsePricingInputFromRequest(req);
  const context = resolveCurrencyContext(input);
  return res.json({
    currency: context.currency,
    geoDetected: context.geoDetected,
    source: context.source,
  });
}

pricingRouter.get("/currency-context", sendCurrencyContext);

/** Alias aligned with architecture naming (FR-178). */
pricingRouter.get("/context", sendCurrencyContext);

const sessionCurrencyBodySchema = z.object({
  currency: z.string().length(3),
  geo: z.string().min(1).optional(),
});

pricingRouter.post(
  "/session-currency",
  withBodyValidation(sessionCurrencyBodySchema),
  (req, res) => {
    const body = req.body as z.infer<typeof sessionCurrencyBodySchema>;
    const env = getEnv();
    const currency = body.currency.trim().toUpperCase();
    res.cookie(SESSION_CURRENCY_COOKIE, currency, {
      httpOnly: false,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_CURRENCY_MAX_AGE_MS,
    });

    const context = resolveCurrencyContext({
      geo: body.geo ?? detectGeoFromRequest(req),
      currencyOverride: currency,
    });

    return res.json({
      currency: context.currency,
      geoDetected: context.geoDetected,
      source: context.source,
      saved: true,
    });
  },
);

const quoteBodySchema = z.object({
  offerIds: z.array(z.string().min(1)).min(1),
  currency: z.string().length(3),
  geo: z.string().min(1),
});

pricingRouter.post(
  "/quote",
  withBodyValidation(quoteBodySchema),
  (req, res) => {
    const body = req.body as z.infer<typeof quoteBodySchema>;
    const result = quoteOfferings(body);
    return res.json(result);
  },
);
