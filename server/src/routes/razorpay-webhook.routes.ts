import { Router } from "express";
import { publishEvent } from "../events/publisher.js";
import { createRateLimitMiddleware } from "../middleware/rate-limit.js";
import {
  extractRazorpayPaymentCaptured,
  parseRazorpayWebhook,
  verifyWebhookSignature,
} from "../integrations/razorpay-api.js";
import { logError, logInfo } from "../runtime/logger.js";
import { completeOrderFromRazorpayWebhook } from "../services/checkout-service.js";

export const razorpayWebhookRouter = Router();
const razorpayWebhookLimiter = createRateLimitMiddleware("razorpay-webhook");

razorpayWebhookRouter.post("/webhook", razorpayWebhookLimiter, async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    if (!secret) {
      return res.status(503).json({
        error: {
          code: "RAZORPAY_WEBHOOK_NOT_CONFIGURED",
          message: "Webhook secret not configured",
        },
      });
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body ?? {});
    const signature = req.get("x-razorpay-signature") ?? "";
    if (!verifyWebhookSignature({ body: rawBody, signature, secret })) {
      return res.status(400).json({
        error: {
          code: "INVALID_WEBHOOK_SIGNATURE",
          message: "Razorpay signature check failed",
        },
      });
    }

    const payload = parseRazorpayWebhook(rawBody);
    const captured = extractRazorpayPaymentCaptured(payload);
    if (captured) {
      const paid = await completeOrderFromRazorpayWebhook({
        razorpayOrderId: captured.razorpayOrderId,
        razorpayPaymentId: captured.paymentId,
        internalOrderId: captured.internalOrderId,
      });
      if (!paid.ok) {
        logError("Razorpay webhook order not found", {
          route: "razorpay-webhook",
          razorpayOrderId: captured.razorpayOrderId,
        });
      } else {
        logInfo("Razorpay payment captured order", {
          route: "razorpay-webhook",
          orderId: paid.order.id,
          alreadyCompleted: paid.order.alreadyCompleted,
        });
      }
    }

    const eventId = `${payload.event}:${captured?.paymentId ?? Date.now()}`;
    const published = await publishEvent({
      eventName: `razorpay.${payload.event}`,
      source: "razorpay-webhook",
      idempotencyKey: `razorpay:${eventId}`,
      payload: { event: payload.event, captured },
    });

    return res.status(202).json({
      accepted: true,
      event: payload.event,
      queue: published.queue,
    });
  } catch (error) {
    logError("Razorpay webhook handling failed", {
      route: "razorpay-webhook",
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      error: { code: "WEBHOOK_PROCESSING_FAILED", message: "Could not process webhook" },
    });
  }
});
