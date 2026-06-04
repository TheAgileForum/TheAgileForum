import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { prisma } from "../db/client.js";
import { DEFAULT_REGISTRATION_TENANT_ID } from "../constants/platform.js";
import type { SessionClaims } from "./auth-service.js";
import { issueEmailVerification } from "./email-verification-service.js";

export type RegisterInput = {
  email: string;
  password: string;
  policyVersion: string;
  acceptTerms: boolean;
  authProvider?: "local" | "google" | "linkedin";
  emailVerified?: boolean;
};

export type RegisterResult =
  | { ok: true; session: SessionClaims; userId: string; emailVerified: boolean }
  | { ok: false; code: string; message: string };

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  if (!input.acceptTerms) {
    return {
      ok: false,
      code: "TERMS_NOT_ACCEPTED",
      message: "You must accept the terms to register",
    };
  }

  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      code: "EMAIL_ALREADY_REGISTERED",
      message: "An account with this email already exists",
    };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: DEFAULT_REGISTRATION_TENANT_ID },
  });
  if (!tenant) {
    return {
      ok: false,
      code: "REGISTRATION_UNAVAILABLE",
      message: "Registration tenant is not configured",
    };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const verifiedNow = input.emailVerified === true;
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      authProvider: input.authProvider ?? "local",
      emailVerifiedAt: verifiedNow ? new Date() : null,
      memberships: {
        create: {
          tenantId: tenant.id,
          role: Role.CUSTOMER,
        },
      },
      consentEvents: {
        create: {
          tenantId: tenant.id,
          policyVersion: input.policyVersion,
          accepted: true,
          source: "registration",
        },
      },
    },
    include: { memberships: true },
  });

  const membership = user.memberships[0]!;

  if (!verifiedNow) {
    await issueEmailVerification(user.id, email);
  }

  return {
    ok: true,
    userId: user.id,
    emailVerified: verifiedNow,
    session: {
      userId: user.id,
      role: membership.role,
      tenantId: membership.tenantId,
      tenantIds: [membership.tenantId],
    },
  };
}
