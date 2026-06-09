import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../db/client.js";
import { createIntegrationAdapters } from "../integrations/factory.js";
import { logInfo } from "../runtime/logger.js";

const DEFAULT_TTL_HOURS = 48;

function apiPublicUrl(): string {
  return process.env.API_PUBLIC_URL?.trim() || "http://localhost:3001";
}

function appPublicUrl(): string {
  return process.env.APP_PUBLIC_URL?.trim() || "http://localhost:5173";
}

function verificationTtlHours(): number {
  const raw = process.env.EMAIL_VERIFICATION_TTL_HOURS;
  const parsed = raw ? Number(raw) : DEFAULT_TTL_HOURS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_HOURS;
}

export function createVerificationTokenValue(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex");
}

export async function issueEmailVerification(userId: string, email: string): Promise<void> {
  const token = createVerificationTokenValue();
  const expiresAt = new Date(Date.now() + verificationTtlHours() * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: expiresAt,
    },
  });

  const verifyUrl = `${apiPublicUrl()}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`;
  const adapters = createIntegrationAdapters();
  await adapters.email.sendTransactional({
    to: email,
    subject: "Verify your Agile Forum account",
    html: `<p>Confirm your email to secure your account.</p><p><a href="${verifyUrl}">Verify email</a></p><p>This link expires in ${verificationTtlHours()} hours.</p>`,
  });

  logInfo("Verification email queued", {
    component: "auth",
    event: "email_verification_sent",
    userId,
  });
}

export async function markEmailVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });
}

export type VerifyEmailResult =
  | { ok: true; userId: string }
  | { ok: false; code: string; message: string };

export async function verifyEmailByToken(token: string): Promise<VerifyEmailResult> {
  if (!token.trim()) {
    return { ok: false, code: "INVALID_TOKEN", message: "Verification token is required" };
  }

  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    return { ok: false, code: "INVALID_TOKEN", message: "Verification link is invalid or already used" };
  }

  if (user.emailVerifiedAt) {
    return { ok: true, userId: user.id };
  }

  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
    return { ok: false, code: "TOKEN_EXPIRED", message: "Verification link has expired" };
  }

  await markEmailVerified(user.id);
  return { ok: true, userId: user.id };
}

export function buildVerificationSuccessRedirect(): string {
  const url = new URL("/login", appPublicUrl());
  url.searchParams.set("verified", "1");
  return url.toString();
}

export function buildVerificationFailureRedirect(code: string): string {
  const url = new URL("/login", appPublicUrl());
  url.searchParams.set("verified", "0");
  url.searchParams.set("reason", code);
  return url.toString();
}

export function isEmailVerified(user: {
  emailVerifiedAt: Date | null;
}): boolean {
  return user.emailVerifiedAt !== null;
}

export function requireEmailVerificationEnabled(): boolean {
  return process.env.REQUIRE_EMAIL_VERIFICATION === "true";
}
