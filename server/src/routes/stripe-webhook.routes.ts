import { Router } from "express";
import { createIntegrationAdapters } from "../integrations/factory.js";
import { publishEvent } from "../events/publisher.js";
import { createRateLimitMiddleware } from "../middleware/rate-limit.js";
import { logError, logInfo } from "../runtime/logger.js";
import { IntegrationError } from "../integrations/errors.js";
import { captureProductEvent } from "../observability/posthog.js";
import { completeOrderFromStripeWebhook } from "../services/checkout-service.js";

export const stripeWebhookRouter = Router();
const stripeWebhookLimiter = createRateLimitMiddleware("stripe-webhook");

stripeWebhookRouter.post("/webhook", stripeWebhookLimiter, async (req, res) => {
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

    if (parsed.type === "checkout.session.completed" && parsed.orderId) {
      const paid = await completeOrderFromStripeWebhook({
        orderId: parsed.orderId,
        stripeSessionId: parsed.sessionId ?? parsed.id,
        stripeEventId: parsed.id,
      });
      if (!paid.ok) {
        throw new IntegrationError(
          "INTEGRATION_PROVIDER_FAILURE",
          paid.error.message,
          "stripe",
        );
      }
      logInfo("Stripe checkout completed order", {
        route: "stripe-webhook",
        orderId: parsed.orderId,
        alreadyCompleted: paid.order.alreadyCompleted,
      });
    }

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
    await captureProductEvent({
      distinctId: parsed.id,
      event: "stripe_webhook_accepted",
      properties: {
        eventType: parsed.type,
        queue: published.queue,
      },
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
