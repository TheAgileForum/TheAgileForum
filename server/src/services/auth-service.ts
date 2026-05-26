import bcrypt from "bcrypt";
import * as jose from "jose";
import type { Role } from "@prisma/client";
import { prisma } from "../db/client.js";
import { getEnv } from "../config/env.js";

const DUMMY_BCRYPT =
  "$2b$10$Q8tVqJZQZQZQZQZQZQZQZeQ8tVqJZQZQZQZQZQZQZQZQZQZQZQZQZ";

export interface SessionClaims {
  userId: string;
  role: Role;
  tenantId: string | null;
  tenantIds: string[];
}

function getJwtSecretKey(): Uint8Array {
  const env = getEnv();
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function signSessionToken(claims: SessionClaims): Promise<string> {
  const env = getEnv();
  const jwt = await new jose.SignJWT({
    role: claims.role,
    tenantId: claims.tenantId,
    tenantIds: claims.tenantIds,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecretKey());

  return jwt;
}

export async function verifySessionToken(
  token: string,
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    const role = payload.role as Role | undefined;
    const tenantId = (payload.tenantId as string | null | undefined) ?? null;
    const tenantIdsRaw = payload.tenantIds;
    if (
      typeof sub !== "string" ||
      role === undefined ||
      !Array.isArray(tenantIdsRaw) ||
      !tenantIdsRaw.every((t) => typeof t === "string")
    ) {
      return null;
    }
    return {
      userId: sub,
      role,
      tenantId,
      tenantIds: tenantIdsRaw as string[],
    };
  } catch {
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<SessionClaims | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { memberships: true },
  });

  const hash = user?.passwordHash ?? DUMMY_BCRYPT;
  const valid = await bcrypt.compare(password, hash);
  if (!user || !valid || user.memberships.length === 0) {
    return null;
  }

  const primary = user.memberships[0]!;

  if (primary.role === "OPS_ADMIN") {
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
    const tenantIds = tenants.map((t) => t.id);
    return {
      userId: user.id,
      role: primary.role,
      tenantId: tenantIds[0] ?? null,
      tenantIds,
    };
  }

  return {
    userId: user.id,
    role: primary.role,
    tenantId: primary.tenantId,
    tenantIds: [primary.tenantId],
  };
}

export function getCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
} {
  const env = getEnv();
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  };
}
