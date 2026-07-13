import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../db/client.js";
import { createIntegrationAdapters } from "../integrations/factory.js";
import { logError, logInfo } from "../runtime/logger.js";

const DEFAULT_TTL_HOURS = 1;

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account exists for that email, you will receive a password reset link shortly.";

function appPublicUrl(): string {
  return process.env.APP_PUBLIC_URL?.trim() || "http://localhost:5173";
}

function resetTtlHours(): number {
  const raw = process.env.PASSWORD_RESET_TTL_HOURS;
  const parsed = raw ? Number(raw) : DEFAULT_TTL_HOURS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_HOURS;
}

export function createPasswordResetTokenValue(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex");
}

export function isOAuthOnlyUser(user: {
  authProvider: string | null;
}): boolean {
  return user.authProvider === "google" || user.authProvider === "linkedin";
}

export function canRequestPasswordReset(user: {
  authProvider: string | null;
}): boolean {
  return !isOAuthOnlyUser(user);
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, authProvider: true },
  });

  if (!user || !canRequestPasswordReset(user)) {
    return { message: GENERIC_FORGOT_PASSWORD_MESSAGE };
  }

  const token = createPasswordResetTokenValue();
  const expiresAt = new Date(Date.now() + resetTtlHours() * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    },
  });

  const resetUrl = `${appPublicUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const adapters = createIntegrationAdapters();
  try {
    await adapters.email.sendTransactional({
      to: user.email,
      subject: "Reset your Agile Forum password",
      html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in ${resetTtlHours()} hour(s). If you did not request this, you can ignore this email.</p>`,
    });
  } catch (err) {
    logError("Password reset email failed", {
      component: "auth",
      event: "password_reset_email_failed",
      userId: user.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  logInfo("Password reset email queued", {
    component: "auth",
    event: "password_reset_sent",
    userId: user.id,
  });

  return { message: GENERIC_FORGOT_PASSWORD_MESSAGE };
}

export type ValidateResetTokenResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export async function validatePasswordResetToken(token: string): Promise<ValidateResetTokenResult> {
  if (!token.trim()) {
    return { ok: false, code: "INVALID_TOKEN", message: "Reset token is required" };
  }

  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token },
    select: { passwordResetExpiresAt: true },
  });

  if (!user) {
    return { ok: false, code: "INVALID_TOKEN", message: "Reset link is invalid or already used" };
  }

  if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    return { ok: false, code: "TOKEN_EXPIRED", message: "Reset link has expired" };
  }

  return { ok: true };
}

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export async function resetPasswordByToken(
  token: string,
  password: string,
): Promise<ResetPasswordResult> {
  const validation = await validatePasswordResetToken(token);
  if (!validation.ok) {
    return validation;
  }

  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token },
    select: { id: true },
  });

  if (!user) {
    return { ok: false, code: "INVALID_TOKEN", message: "Reset link is invalid or already used" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  logInfo("Password reset completed", {
    component: "auth",
    event: "password_reset_completed",
    userId: user.id,
  });

  return { ok: true };
}

export { GENERIC_FORGOT_PASSWORD_MESSAGE };
