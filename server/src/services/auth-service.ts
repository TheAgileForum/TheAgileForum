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

type AuthCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
  domain?: string;
};

/**
 * When the SPA proxies /api on app.* but OAuth callbacks hit api.* directly, the session
 * cookie must be scoped to the shared parent domain (e.g. .staging.theagileforum.com).
 */
export function resolveAuthCookieDomain(): string | undefined {
  const explicit = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (explicit) {
    return explicit.startsWith(".") ? explicit : `.${explicit}`;
  }

  const appUrl = process.env.APP_PUBLIC_URL?.trim();
  const apiUrl = process.env.API_PUBLIC_URL?.trim();
  if (!appUrl || !apiUrl) return undefined;

  try {
    const appHost = new URL(appUrl).hostname;
    const apiHost = new URL(apiUrl).hostname;
    if (appHost === apiHost || appHost === "localhost" || apiHost === "localhost") {
      return undefined;
    }

    const appParent = appHost.includes(".") ? appHost.slice(appHost.indexOf(".") + 1) : null;
    const apiParent = apiHost.includes(".") ? apiHost.slice(apiHost.indexOf(".") + 1) : null;
    if (appParent && appParent === apiParent) {
      return `.${appParent}`;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function getCookieOptions(): AuthCookieOptions {
  const env = getEnv();
  const domain = resolveAuthCookieDomain();
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
    ...(domain ? { domain } : {}),
  };
}

export function getClearCookieOptions(): Omit<AuthCookieOptions, "maxAge"> {
  const { maxAge: _maxAge, ...options } = getCookieOptions();
  return options;
}
