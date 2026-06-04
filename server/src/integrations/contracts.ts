export type ExternalCallResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  attempts: number;
};

export type StripeWebhookEvent = {
  id: string;
  type: string;
  rawPayload: string;
  orderId?: string;
  sessionId?: string;
};

export interface StripeAdapter {
  provider: "stub" | "live";
  verifyWebhookSignature(payload: Buffer, signature: string | undefined): Promise<boolean>;
  parseWebhookEvent(payload: Buffer): Promise<StripeWebhookEvent>;
}

export interface EmailAdapter {
  provider: "stub" | "live";
  sendTransactional(input: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ messageId: string }>;
}

export interface TelegramAdapter {
  provider: "stub" | "live";
  sendMessage(input: {
    chatId: string;
    text: string;
  }): Promise<{ deliveryId: string }>;
}

export interface WebinarAdapter {
  provider: "stub" | "live";
  syncSession(input: {
    sessionId: string;
    title: string;
    startsAtIso: string;
  }): Promise<{ externalId: string }>;
}
