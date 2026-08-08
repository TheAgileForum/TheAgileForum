import { prisma } from "../db/client.js";
import { createIntegrationAdapters } from "../integrations/factory.js";
import { logInfo } from "../runtime/logger.js";
import { publishEvent } from "../events/publisher.js";
import type { EnrollmentLine } from "../services/order-notification-service.js";
import {
  buildMockInterviewWelcomeHtml,
  MOCK_INTERVIEW_WELCOME_SUBJECT,
  orderIncludesMockInterview,
} from "./mock-interview-welcome-email.js";

const DEFAULT_OPS_ALERT_EMAIL = "ops@demo.local";

export type EnrollmentDeliveryResult = {
  learnerEmailMessageId: string | null;
  opsEmailMessageId: string | null;
  opsTelegramDeliveryId: string | null;
};

function buildGenericLearnerHtml(orderNumber: string, itemSummary: string): string {
  return `<p>Thank you for your enrollment.</p><p>Order <strong>${orderNumber}</strong></p><p>${itemSummary}</p>`;
}

export async function deliverEnrollmentNotifications(input: {
  orderId: string;
  orderNumber: string;
  userId: string;
  items: EnrollmentLine[];
}): Promise<EnrollmentDeliveryResult> {
  const adapters = createIntegrationAdapters();
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { email: true, displayName: true },
  });

  const itemSummary = input.items
    .map((i) => `${i.title} (${i.quantity} × ${i.currency} ${i.unitPrice})`)
    .join("; ");

  const mockInterview = orderIncludesMockInterview(input.items);

  let learnerEmailMessageId: string | null = null;
  if (user?.email) {
    const subject = mockInterview
      ? MOCK_INTERVIEW_WELCOME_SUBJECT
      : `Enrollment confirmed — ${input.orderNumber}`;
    const html = mockInterview
      ? buildMockInterviewWelcomeHtml({
          displayName: user.displayName,
          orderNumber: input.orderNumber,
          itemSummary,
        })
      : buildGenericLearnerHtml(input.orderNumber, itemSummary);

    const sent = await adapters.email.sendTransactional({
      to: user.email,
      subject,
      html,
    });
    learnerEmailMessageId = sent.messageId;
  }

  const opsEmail = process.env.OPS_ENROLLMENT_ALERT_EMAIL ?? DEFAULT_OPS_ALERT_EMAIL;
  const opsSent = await adapters.email.sendTransactional({
    to: opsEmail,
    subject: `[Ops] New enrollment ${input.orderNumber}`,
    html: `<p>New paid enrollment for user ${user?.email ?? input.userId}.</p><p>${itemSummary}</p>`,
  });

  let opsTelegramDeliveryId: string | null = null;
  const opsChatId = process.env.ENROLLMENT_OPS_TELEGRAM_CHAT_ID;
  if (opsChatId) {
    const tg = await adapters.telegram.sendMessage({
      chatId: opsChatId,
      text: `Enrollment ${input.orderNumber}: ${user?.email ?? input.userId} — ${itemSummary}`,
    });
    opsTelegramDeliveryId = tg.deliveryId;
  }

  logInfo("Enrollment notifications delivered", {
    component: "notifications",
    event: "enrollment_delivered",
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    mockInterviewWelcome: mockInterview,
    learnerEmailMessageId,
    opsEmailMessageId: opsSent.messageId,
    opsTelegramDeliveryId,
  });

  await publishEvent({
    eventName: "notification.enrollment_delivered",
    source: "enrollment-notifier",
    idempotencyKey: `notification:delivered:${input.orderId}`,
    payload: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      userId: input.userId,
      mockInterviewWelcome: mockInterview,
      learnerEmailMessageId,
      opsEmailMessageId: opsSent.messageId,
      opsTelegramDeliveryId,
    },
  });

  return {
    learnerEmailMessageId,
    opsEmailMessageId: opsSent.messageId,
    opsTelegramDeliveryId,
  };
}
