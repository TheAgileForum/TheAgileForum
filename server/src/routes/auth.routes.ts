import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../db/client.js";
import { getEnv } from "../config/env.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { createRateLimitMiddleware } from "../middleware/rate-limit.js";
import { withBodyValidation } from "../middleware/validation.js";
import { logPrivilegedAction } from "../security/audit.js";
import {
  authenticateUser,
  getCookieOptions,
  signSessionToken,
} from "../services/auth-service.js";

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const consentBody = z.object({
  policyVersion: z.string().min(1),
  accepted: z.boolean(),
  source: z.string().min(1).default("web"),
});

const unsubscribeBody = z.object({
  channel: z.enum(["email", "telegram"]),
  reason: z.string().max(500).optional(),
});

export const authRouter = Router();
const sensitiveLimiter = createRateLimitMiddleware("auth-sensitive");

authRouter.post("/register", (_req, res) => {
  return res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Registration contract reserved for Sprint 1 implementation",
    },
  });
});

authRouter.post("/login", sensitiveLimiter, withBodyValidation(loginBody), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginBody>;
  const session = await authenticateUser(email, password);
  if (!session) {
    return res.status(401).json({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
    });
  }

  const token = await signSessionToken(session);
  const env = getEnv();
  res.cookie(env.AUTH_COOKIE_NAME, token, getCookieOptions());

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true },
  });

  return res.json({
    user: {
      id: user!.id,
      email: user!.email,
      role: session.role,
      tenantId: session.tenantId,
      tenantIds: session.tenantIds,
    },
  });
});

authRouter.post("/logout", (_req, res) => {
  const env = getEnv();
  res.clearCookie(env.AUTH_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(204).send();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    select: { id: true, email: true },
  });
  return res.json({
    user: {
      id: user!.id,
      email: user!.email,
      role: req.auth!.role,
      tenantId: req.auth!.tenantId,
      tenantIds: req.auth!.tenantIds,
    },
  });
});

authRouter.post(
  "/consent",
  requireAuth,
  sensitiveLimiter,
  withBodyValidation(consentBody),
  async (req, res) => {
    const payload = req.body as z.infer<typeof consentBody>;
    const row = await prisma.consentEvent.upsert({
      where: {
        userId_policyVersion_source: {
          userId: req.auth!.userId,
          policyVersion: payload.policyVersion,
          source: payload.source,
        },
      },
      update: {
        accepted: payload.accepted,
        tenantId: req.auth!.tenantId,
      },
      create: {
        userId: req.auth!.userId,
        tenantId: req.auth!.tenantId,
        policyVersion: payload.policyVersion,
        accepted: payload.accepted,
        source: payload.source,
      },
    });

    return res.status(201).json({
      consent: {
        id: row.id,
        policyVersion: row.policyVersion,
        accepted: row.accepted,
        source: row.source,
        createdAt: row.createdAt,
      },
    });
  },
);

authRouter.post(
  "/unsubscribe",
  requireAuth,
  sensitiveLimiter,
  withBodyValidation(unsubscribeBody),
  async (req, res) => {
    const payload = req.body as z.infer<typeof unsubscribeBody>;
    const source = `unsubscribe:${payload.channel}`;
    await prisma.consentEvent.upsert({
      where: {
        userId_policyVersion_source: {
          userId: req.auth!.userId,
          policyVersion: "marketing-v1",
          source,
        },
      },
      update: {
        accepted: false,
        tenantId: req.auth!.tenantId,
      },
      create: {
        userId: req.auth!.userId,
        tenantId: req.auth!.tenantId,
        policyVersion: "marketing-v1",
        accepted: false,
        source,
      },
    });

    return res.status(202).json({
      unsubscribe: {
        accepted: true,
        channel: payload.channel,
        status: "scheduled",
      },
    });
  },
);

const contextCheckHandler: RequestHandler = (req, res) => {
  const spoofQuery = req.query.tenantId;
  const body = req.body as { tenantId?: string } | undefined;
  const spoofBody = body?.tenantId;
  return res.json({
    userId: req.auth!.userId,
    role: req.auth!.role,
    tenantId: req.auth!.tenantId,
    tenantIds: req.auth!.tenantIds,
    ignoredClientHints: {
      queryTenantId: spoofQuery ?? null,
      bodyTenantId: spoofBody ?? null,
    },
  });
};

authRouter.get("/context-check", requireAuth, contextCheckHandler);
authRouter.post("/context-check", requireAuth, contextCheckHandler);

authRouter.get(
  "/admin-check",
  requireAuth,
  requireRoles(["OPS_ADMIN"]),
  (req, res) => {
    logPrivilegedAction({
      action: "admin_check_access",
      actorUserId: req.auth!.userId,
      actorRole: req.auth!.role,
      tenantId: req.auth!.tenantId,
      requestId: req.requestId ?? null,
    });
    return res.status(200).json({ ok: true });
  },
);
