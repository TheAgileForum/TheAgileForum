import type {
  EmailAdapter,
  StripeAdapter,
  StripeWebhookEvent,
  TelegramAdapter,
  WebinarAdapter,
} from "./contracts.js";
import {
  getEmailFromName,
  getResendApiKey,
  getSenderApiToken,
  resolveTransactionalEmailProvider,
} from "./email-provider.js";
import { executeWithRetry } from "./external-call.js";
import { mapProviderFailure } from "./errors.js";
import { sendResendEmail } from "./resend-api.js";
import { sendSenderEmail } from "./sender-api.js";
import {
  parseStripeWebhookEvent,
  verifyStripeWebhookSignature,
} from "./stripe-api.js";

export class LiveStripeAdapter implements StripeAdapter {
  provider: "live" = "live";

  async verifyWebhookSignature(
    payload: Buffer,
    signature: string | undefined,
  ): Promise<boolean> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) return false;
    return verifyStripeWebhookSignature({
      payload: payload.toString("utf8"),
      signatureHeader: signature,
      secret,
    });
  }

  async parseWebhookEvent(payload: Buffer): Promise<StripeWebhookEvent> {
    const raw = payload.toString("utf8");
    const parsed = parseStripeWebhookEvent(raw);
    return {
      id: parsed.id,
      type: parsed.type,
      rawPayload: raw,
      orderId: parsed.orderId,
      sessionId: parsed.sessionId,
    };
  }
}

export class LiveEmailAdapter implements EmailAdapter {
  provider: "live" = "live";

  async sendTransactional(input: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ messageId: string }> {
    const selected = resolveTransactionalEmailProvider();
    if (selected === "stub") {
      return { messageId: `live_email_stub_${input.to}_${Date.now()}` };
    }

    const from = process.env.EMAIL_FROM?.trim();
    if (!from) {
      throw mapProviderFailure(
        "email",
        `EMAIL_FROM is required when EMAIL_PROVIDER=${selected}`,
      );
    }

    const result = await executeWithRetry(async () => {
      if (selected === "sender") {
        const apiToken = getSenderApiToken();
        if (!apiToken) {
          throw new Error("SENDER_API_TOKEN is required when EMAIL_PROVIDER=sender");
        }
        const sent = await sendSenderEmail({
          apiToken,
          fromEmail: from,
          fromName: getEmailFromName(),
          toEmail: input.to,
          subject: input.subject,
          html: input.html,
        });
        return { messageId: sent.emailId };
      }

      const apiKey = getResendApiKey();
      if (!apiKey) {
        throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
      }
      const sent = await sendResendEmail({
        apiKey,
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
      return { messageId: sent.id };
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
