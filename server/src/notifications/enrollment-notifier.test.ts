import { describe, expect, it, vi, beforeEach } from "vitest";

const mockSendEmail = vi.fn();
const mockSendTelegram = vi.fn();
const mockPublishEvent = vi.fn();
const mockFindUser = vi.fn();

vi.mock("../integrations/factory.js", () => ({
  createIntegrationAdapters: () => ({
    email: { sendTransactional: mockSendEmail },
    telegram: { sendMessage: mockSendTelegram },
  }),
}));

vi.mock("../events/publisher.js", () => ({
  publishEvent: mockPublishEvent,
}));

vi.mock("../db/client.js", () => ({
  prisma: {
    user: { findUnique: mockFindUser },
  },
}));

vi.mock("../runtime/logger.js", () => ({
  logInfo: vi.fn(),
}));

describe("deliverEnrollmentNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ENROLLMENT_OPS_TELEGRAM_CHAT_ID;
    mockFindUser.mockResolvedValue({ email: "learner@demo.local" });
    mockSendEmail.mockResolvedValue({ messageId: "email-1" });
    mockSendTelegram.mockResolvedValue({ deliveryId: "tg-1" });
    mockPublishEvent.mockResolvedValue({});
  });

  it("sends learner and ops email and records delivery event", async () => {
    const { deliverEnrollmentNotifications } = await import("./enrollment-notifier.js");

    await deliverEnrollmentNotifications({
      orderId: "ord-1",
      orderNumber: "ORD-TEST",
      userId: "user-1",
      items: [
        {
          offeringCode: "exam-practice-free",
          title: "Free Practice Exam",
          quantity: 1,
          unitPrice: "0.00",
          currency: "USD",
        },
      ],
    });

    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    expect(mockSendEmail.mock.calls[0][0].to).toBe("learner@demo.local");
    expect(mockSendEmail.mock.calls[1][0].to).toBe("ops@demo.local");
    expect(mockPublishEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "notification.enrollment_delivered" }),
    );
  });

  it("sends telegram ops alert when chat id configured", async () => {
    process.env.ENROLLMENT_OPS_TELEGRAM_CHAT_ID = "chat-123";
    const { deliverEnrollmentNotifications } = await import("./enrollment-notifier.js");

    await deliverEnrollmentNotifications({
      orderId: "ord-2",
      orderNumber: "ORD-TG",
      userId: "user-1",
      items: [],
    });

    expect(mockSendTelegram).toHaveBeenCalledWith(
      expect.objectContaining({ chatId: "chat-123" }),
    );
  });
});
