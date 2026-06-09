import type {
  EmailAdapter,
  StripeAdapter,
  StripeWebhookEvent,
  TelegramAdapter,
  WebinarAdapter,
} from "./contracts.js";
import { executeWithRetry } from "./external-call.js";
import { mapProviderFailure } from "./errors.js";

export class LiveStripeAdapter implements StripeAdapter {
  provider: "live" = "live";

  async verifyWebhookSignature(
    _payload: Buffer,
    _signature: string | undefined,
  ): Promise<boolean> {
    const result = await executeWithRetry(async () => {
      // Placeholder for Stripe SDK-based signature verification.
      return true;
    });
    return result.ok && result.data === true;
  }

  async parseWebhookEvent(payload: Buffer): Promise<StripeWebhookEvent> {
    const raw = payload.toString("utf8");
    let id = `live_evt_${Date.now()}`;
    let type = "unknown";
    let orderId: string | undefined;
    let sessionId: string | undefined;
    try {
      const json = JSON.parse(raw) as {
        id?: string;
        type?: string;
        data?: { object?: Record<string, unknown> };
      };
      if (json.id) id = String(json.id);
      if (json.type) type = String(json.type);
      const obj = (json.data?.object ?? json) as {
        id?: string;
        client_reference_id?: string;
        metadata?: { order_id?: string };
      };
      orderId = obj.metadata?.order_id ?? obj.client_reference_id;
      sessionId = obj.id;
    } catch {
      // keep placeholder id/type when payload is not JSON
    }
    return { id, type, rawPayload: raw, orderId, sessionId };
  }
}

export class LiveEmailAdapter implements EmailAdapter {
  provider: "live" = "live";

  async sendTransactional(input: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ messageId: string }> {
    const result = await executeWithRetry(async () => {
      return { messageId: `live_email_${input.to}_${Date.now()}` };
    });
    if (!result.ok || !result.data) {
      throw mapProviderFailure("email", result.error ?? "Live email adapter failed");
    }
    return result.data;
  }
}

export class LiveTelegramAdapter implements TelegramAdapter {
  provider: "live" = "live";

  async sendMessage(input: {
    chatId: string;
    text: string;
  }): Promise<{ deliveryId: string }> {
    const result = await executeWithRetry(async () => {
      return { deliveryId: `live_tg_${input.chatId}_${Date.now()}` };
    });
    if (!result.ok || !result.data) {
      throw mapProviderFailure("telegram", result.error ?? "Live telegram adapter failed");
    }
    return result.data;
  }
}

export class LiveWebinarAdapter implements WebinarAdapter {
  provider: "live" = "live";

  async syncSession(input: {
    sessionId: string;
    title: string;
    startsAtIso: string;
  }): Promise<{ externalId: string }> {
    const result = await executeWithRetry(async () => {
      return { externalId: `live_webinar_${input.sessionId}` };
    });
    if (!result.ok || !result.data) {
      throw mapProviderFailure("webinar", result.error ?? "Live webinar adapter failed");
    }
    return result.data;
  }
}
