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
    let id = `stub_evt_${Date.now()}`;
    let type = "checkout.session.completed";
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
      // keep stub defaults for minimal payloads
    }
    return { id, type, rawPayload: raw, orderId, sessionId };
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

export class StubRazorpayCheckoutAdapter {
  provider: "stub" = "stub";

  async createCheckoutSession(input: {
    orderId: string;
    orderNumber: string;
    amount: string;
    currency: string;
  }): Promise<{ checkoutUrl: string; paymentRef: string; providerOrderId: string }> {
    const providerOrderId = `order_stub_${input.orderNumber.toLowerCase()}`;
    const paymentRef = `razorpay:${providerOrderId}:stub_${Date.now()}`;
    const appUrl = process.env.APP_PUBLIC_URL?.trim() || "http://localhost:5173";
    return {
      providerOrderId,
      paymentRef,
      checkoutUrl: `${appUrl}/checkout/razorpay/stub?order=${encodeURIComponent(input.orderNumber)}&ref=${encodeURIComponent(paymentRef)}`,
    };
  }
}
