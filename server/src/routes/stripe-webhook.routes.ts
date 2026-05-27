import { Router } from "express";
import { createIntegrationAdapters } from "../integrations/factory.js";
import { publishEvent } from "../events/publisher.js";
import { logError, logInfo } from "../runtime/logger.js";
import { IntegrationError } from "../integrations/errors.js";

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post("/webhook", async (req, res) => {
  try {
    const adapters = createIntegrationAdapters();
    const signature = req.get("stripe-signature") ?? undefined;
    const rawBody =
      Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));

    const valid = await adapters.stripe.verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      return res.status(400).json({
        error: { code: "INVALID_WEBHOOK_SIGNATURE", message: "Stripe signature check failed" },
      });
    }

    const parsed = await adapters.stripe.parseWebhookEvent(rawBody);
    const published = await publishEvent({
      eventName: `stripe.${parsed.type}`,
      source: "stripe-webhook",
      idempotencyKey: `stripe:${parsed.id}`,
      payload: {
        eventId: parsed.id,
        eventType: parsed.type,
        rawPayload: parsed.rawPayload,
      },
    });

    logInfo("Stripe webhook accepted", {
      route: "stripe-webhook",
      eventId: parsed.id,
      eventType: parsed.type,
      queue: published.queue,
    });

    return res.status(202).json({
      accepted: true,
      eventId: parsed.id,
      queue: published.queue,
    });
  } catch (error) {
    const isIntegrationError = error instanceof IntegrationError;
    logError("Stripe webhook handling failed", {
      route: "stripe-webhook",
      code: isIntegrationError ? error.code : "WEBHOOK_PROCESSING_FAILED",
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      error: {
        code: isIntegrationError ? error.code : "WEBHOOK_PROCESSING_FAILED",
        message: "Could not process webhook",
      },
    });
  }
});
