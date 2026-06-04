import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: {
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
  createVerificationTokenValue,
  issueEmailVerification,
  verifyEmailByToken,
} = await import("./email-verification-service.js");

describe("email-verification-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates opaque verification tokens", () => {
    const a = createVerificationTokenValue();
    const b = createVerificationTokenValue();
    expect(a).toHaveLength(64);
    expect(a).not.toBe(b);
  });

  it("issues verification email and stores token", async () => {
    prismaMock.user.update.mockResolvedValue({});
    await issueEmailVerification("user-1", "test@demo.local");
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({
          emailVerificationToken: expect.any(String),
          emailVerificationExpiresAt: expect.any(Date),
        }),
      }),
    );
    expect(emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@demo.local",
        subject: expect.stringContaining("Verify"),
      }),
    );
  });

  it("verifies valid token", async () => {
    const future = new Date(Date.now() + 60_000);
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      emailVerifiedAt: null,
      emailVerificationExpiresAt: future,
    });
    prismaMock.user.update.mockResolvedValue({});
    const result = await verifyEmailByToken("abc");
    expect(result).toEqual({ ok: true, userId: "user-1" });
  });

  it("rejects expired token", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      emailVerifiedAt: null,
      emailVerificationExpiresAt: new Date(Date.now() - 1),
    });
    const result = await verifyEmailByToken("abc");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("TOKEN_EXPIRED");
    }
  });
});
