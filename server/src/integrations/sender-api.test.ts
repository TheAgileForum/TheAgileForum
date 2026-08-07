import { afterEach, describe, expect, it, vi } from "vitest";
import { sendSenderEmail } from "./sender-api.js";

describe("sender api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends email via Sender.net message/send API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Email sent",
        emailId: "ep2W4y-7pn8o21-YPpLY9PR5Jy9-x7GYQ",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendSenderEmail({
      apiToken: "sender_test_token",
      fromEmail: "DhirenderVerma@theagileforum.com",
      fromName: "The Agile Forum",
      toEmail: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result.emailId).toBe("ep2W4y-7pn8o21-YPpLY9PR5Jy9-x7GYQ");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.sender.net/v2/message/send",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer sender_test_token",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          from: {
            email: "DhirenderVerma@theagileforum.com",
            name: "The Agile Forum",
          },
          to: {
            email: "user@example.com",
          },
          subject: "Test",
          html: "<p>Hello</p>",
        }),
      }),
    );
  });

  it("throws on API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => '{"message":"Unauthorized"}',
      }),
    );

    await expect(
      sendSenderEmail({
        apiToken: "bad_token",
        fromEmail: "DhirenderVerma@theagileforum.com",
        fromName: "The Agile Forum",
        toEmail: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    ).rejects.toThrow("SENDER_SEND_FAILED:401:");
  });

  it("throws when response lacks emailId", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );

    await expect(
      sendSenderEmail({
        apiToken: "sender_test_token",
        fromEmail: "DhirenderVerma@theagileforum.com",
        fromName: "The Agile Forum",
        toEmail: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    ).rejects.toThrow("SENDER_SEND_INVALID_RESPONSE");
  });
});
