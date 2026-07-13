import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

const emailSend = vi.fn().mockResolvedValue(undefined);

vi.mock("../db/client.js", () => ({ prisma: prismaMock }));
vi.mock("../integrations/factory.js", () => ({
  createIntegrationAdapters: () => ({
    email: { sendTransactional: emailSend },
  }),
}));

const {
  canRequestPasswordReset,
  createPasswordResetTokenValue,
  isOAuthOnlyUser,
  requestPasswordReset,
  resetPasswordByToken,
  validatePasswordResetToken,
  GENERIC_FORGOT_PASSWORD_MESSAGE,
} = await import("./password-reset-service.js");

describe("password-reset-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates opaque reset tokens", () => {
    const a = createPasswordResetTokenValue();
    const b = createPasswordResetTokenValue();
    expect(a).toHaveLength(64);
    expect(a).not.toBe(b);
  });

  it("detects oauth-only users", () => {
    expect(isOAuthOnlyUser({ authProvider: "google" })).toBe(true);
    expect(isOAuthOnlyUser({ authProvider: "linkedin" })).toBe(true);
    expect(isOAuthOnlyUser({ authProvider: "local" })).toBe(false);
    expect(isOAuthOnlyUser({ authProvider: null })).toBe(false);
  });

  it("returns generic message when user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const result = await requestPasswordReset("missing@demo.local");
    expect(result.message).toBe(GENERIC_FORGOT_PASSWORD_MESSAGE);
    expect(emailSend).not.toHaveBeenCalled();
  });

  it("returns generic message for oauth-only users without sending email", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "oauth@demo.local",
      authProvider: "google",
    });
    const result = await requestPasswordReset("oauth@demo.local");
    expect(result.message).toBe(GENERIC_FORGOT_PASSWORD_MESSAGE);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(emailSend).not.toHaveBeenCalled();
  });

  it("issues reset email for local auth users", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "local@demo.local",
      authProvider: "local",
    });
    prismaMock.user.update.mockResolvedValue({});
    const result = await requestPasswordReset("local@demo.local");
    expect(result.message).toBe(GENERIC_FORGOT_PASSWORD_MESSAGE);
    expect(prismaMock.user.update).toHaveBeenCalled();
    expect(emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "local@demo.local",
        subject: expect.stringContaining("Reset"),
      }),
    );
  });

  it("validates active reset token", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      passwordResetExpiresAt: new Date(Date.now() + 60_000),
    });
    const result = await validatePasswordResetToken("abc");
    expect(result).toEqual({ ok: true });
  });

  it("rejects expired reset token", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      passwordResetExpiresAt: new Date(Date.now() - 1),
    });
    const result = await validatePasswordResetToken("abc");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("TOKEN_EXPIRED");
    }
  });

  it("resets password and clears token", async () => {
    prismaMock.user.findFirst
      .mockResolvedValueOnce({
        passwordResetExpiresAt: new Date(Date.now() + 60_000),
      })
      .mockResolvedValueOnce({ id: "user-1" });
    prismaMock.user.update.mockResolvedValue({});
    const result = await resetPasswordByToken("abc", "newpassword1");
    expect(result).toEqual({ ok: true });
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({
          passwordHash: expect.any(String),
          passwordResetToken: null,
          passwordResetExpiresAt: null,
        }),
      }),
    );
  });

  it("canRequestPasswordReset mirrors oauth-only rule", () => {
    expect(canRequestPasswordReset({ authProvider: "local" })).toBe(true);
    expect(canRequestPasswordReset({ authProvider: "google" })).toBe(false);
  });
});
