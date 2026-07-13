import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveEmailAdapter } from "./adapters.live.js";

describe("LiveEmailAdapter", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("returns stub messageId when RESEND_API_KEY is unset", async () => {
    delete process.env.RESEND_API_KEY;
    const adapter = new LiveEmailAdapter();

    const result = await adapter.sendTransactional({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hi</p>",
    });

    expect(result.messageId).toMatch(/^live_email_stub_user@example\.com_\d+$/);
  });

  it("sends via Resend when API key and EMAIL_FROM are set", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "onboarding@resend.dev";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "msg_live_1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new LiveEmailAdapter();
    const result = await adapter.sendTransactional({
      to: "user@example.com",
      subject: "Verify",
      html: "<p>Verify</p>",
    });

    expect(result.messageId).toBe("msg_live_1");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("fails when RESEND_API_KEY is set but EMAIL_FROM is missing", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    delete process.env.EMAIL_FROM;

    const adapter = new LiveEmailAdapter();

    await expect(
      adapter.sendTransactional({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hi</p>",
      }),
    ).rejects.toThrow("EMAIL_FROM is required when RESEND_API_KEY is set");
  });
});
