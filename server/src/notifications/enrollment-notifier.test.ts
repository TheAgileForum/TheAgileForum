import { describe, expect, it, vi, beforeEach } from "vitest";
import { MOCK_INTERVIEW_WELCOME_SUBJECT } from "./mock-interview-welcome-email.js";

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
    mockFindUser.mockResolvedValue({
      email: "learner@demo.local",
      displayName: "Alex",
    });
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
    expect(mockSendEmail.mock.calls[0][0].subject).toBe(
      "Enrollment confirmed — ORD-TEST",
    );
    expect(mockSendEmail.mock.calls[0][0].html).toContain("Thank you for your enrollment");
    expect(mockSendEmail.mock.calls[0][0].html).not.toContain("Mock Interview");
    expect(mockSendEmail.mock.calls[1][0].to).toBe("ops@demo.local");
    expect(mockPublishEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "notification.enrollment_delivered" }),
    );
  });

  it("sends Mock Interview welcome template for service-mock-interview-sm", async () => {
    const { deliverEnrollmentNotifications } = await import("./enrollment-notifier.js");

    await deliverEnrollmentNotifications({
      orderId: "ord-mi",
      orderNumber: "ORD-MI",
      userId: "user-1",
      items: [
        {
          offeringCode: "service-mock-interview-sm",
          title: "Mock Interview Series with Interview Preparation",
          quantity: 1,
          unitPrice: "249.00",
          currency: "USD",
        },
      ],
    });

    const learnerCall = mockSendEmail.mock.calls[0][0];
    expect(learnerCall.subject).toBe(MOCK_INTERVIEW_WELCOME_SUBJECT);
    expect(learnerCall.html).toContain("Hi Alex,");
    expect(learnerCall.html).toContain("Scrum Master 1:1 Mock Interview");
    expect(learnerCall.html).toContain("Pre-requisite");
    expect(learnerCall.html).toContain("Preparation");
    expect(learnerCall.html).toContain("scrumguides.org");
    expect(learnerCall.html).toContain("1drv.ms/x/s!Ard0cF-GOR3Esx700Rpz1gJSltbQ");
    expect(learnerCall.html).toContain("1drv.ms/f/s!Ard0cF-GOR3ErglcUZ4xiPj4khvz");
    expect(learnerCall.html).toContain("1drv.ms/b/s!Ard0cF-GOR3EsFTyJLlloW1XSeK4");
    expect(learnerCall.html).toContain("1drv.ms/w/s!Ard0cF-GOR3EswSSNshnSS_0ATtu");
    expect(learnerCall.html).toContain("1drv.ms/w/s!Ard0cF-GOR3EtX5smsju6ULpjIMV");
    expect(learnerCall.html).toContain("calendly.com/coach_Dhirender_Verma");
    expect(learnerCall.html).not.toContain("link forthcoming");
  });

  it("sends Mock Interview welcome for slug alias offering codes", async () => {
    const { deliverEnrollmentNotifications } = await import("./enrollment-notifier.js");

    await deliverEnrollmentNotifications({
      orderId: "ord-mi-alias",
      orderNumber: "ORD-MI-A",
      userId: "user-1",
      items: [
        {
          offeringCode: "mock-interview-series-with-interview-preparation",
          title: "Mock Interview Series",
          quantity: 1,
          unitPrice: "15000.00",
          currency: "INR",
        },
      ],
    });

    expect(mockSendEmail.mock.calls[0][0].subject).toBe(MOCK_INTERVIEW_WELCOME_SUBJECT);
    expect(mockSendEmail.mock.calls[0][0].html).toContain("Congratulations on the enrolment");
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
