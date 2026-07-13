import { afterEach, describe, expect, it, vi } from "vitest";
import { sendResendEmail } from "./resend-api.js";

describe("resend api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends email via Resend API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "msg_abc123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendResendEmail({
      apiKey: "re_test_key",
      from: "onboarding@resend.dev",
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result.id).toBe("msg_abc123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer re_test_key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: ["user@example.com"],
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
        status: 422,
        text: async () => '{"message":"Invalid from address"}',
      }),
    );

    await expect(
      sendResendEmail({
        apiKey: "re_test_key",
        from: "bad@example.com",
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    ).rejects.toThrow("RESEND_SEND_FAILED:422:");
  });

  it("throws when response lacks id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    await expect(
      sendResendEmail({
        apiKey: "re_test_key",
        from: "onboarding@resend.dev",
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    ).rejects.toThrow("RESEND_SEND_INVALID_RESPONSE");
  });
});
