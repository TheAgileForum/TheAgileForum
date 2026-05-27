import type {
  EmailAdapter,
  StripeAdapter,
  StripeWebhookEvent,
  TelegramAdapter,
  WebinarAdapter,
} from "./contracts.js";

export class StubStripeAdapter implements StripeAdapter {
  provider: "stub" = "stub";

  async verifyWebhookSignature(
    _payload: Buffer,
    signature: string | undefined,
  ): Promise<boolean> {
    return signature === "stub-valid-signature";
  }

  async parseWebhookEvent(payload: Buffer): Promise<StripeWebhookEvent> {
    const raw = payload.toString("utf8");
    return {
      id: `stub_evt_${Date.now()}`,
      type: "checkout.session.completed",
      rawPayload: raw,
    };
  }
}

export class StubEmailAdapter implements EmailAdapter {
  provider: "stub" = "stub";

  async sendTransactional(input: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ messageId: string }> {
    return {
      messageId: `stub_email_${input.to}_${Date.now()}`,
    };
  }
}

export class StubTelegramAdapter implements TelegramAdapter {
  provider: "stub" = "stub";

  async sendMessage(input: {
    chatId: string;
    text: string;
  }): Promise<{ deliveryId: string }> {
    return {
      deliveryId: `stub_tg_${input.chatId}_${Date.now()}`,
    };
  }
}

export class StubWebinarAdapter implements WebinarAdapter {
  provider: "stub" = "stub";

  async syncSession(input: {
    sessionId: string;
    title: string;
    startsAtIso: string;
  }): Promise<{ externalId: string }> {
    return {
      externalId: `stub_webinar_${input.sessionId}`,
    };
  }
}
