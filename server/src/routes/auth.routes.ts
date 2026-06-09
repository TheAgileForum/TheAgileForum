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
import { registerUser } from "../services/registration-service.js";
import { mergeGuestCartAfterAuth } from "../services/guest-cart-service.js";
import {
  buildVerificationFailureRedirect,
  buildVerificationSuccessRedirect,
  isEmailVerified,
  issueEmailVerification,
  requireEmailVerificationEnabled,
  verifyEmailByToken,
} from "../services/email-verification-service.js";

function serializeAuthUser(
  user: { id: string; email: string; emailVerifiedAt: Date | null },
  session: { role: string; tenantId: string | null; tenantIds: string[] },
) {
  return {
    id: user.id,
    email: user.email,
    role: session.role,
    tenantId: session.tenantId,
    tenantIds: session.tenantIds,
    emailVerified: isEmailVerified(user),
  };
}

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  policyVersion: z.string().min(1),
  acceptTerms: z.literal(true),
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

authRouter.post(
  "/register",
  sensitiveLimiter,
  withBodyValidation(registerBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof registerBody>;
    const result = await registerUser(body);
    if (!result.ok) {
      const status = result.code === "EMAIL_ALREADY_REGISTERED" ? 409 : 400;
      return res.status(status).json({
        error: { code: result.code, message: result.message },
      });
    }

    const token = await signSessionToken(result.session);
    const env = getEnv();
    res.cookie(env.AUTH_COOKIE_NAME, token, getCookieOptions());
    await mergeGuestCartAfterAuth(req, res, result.session);

    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: { id: true, email: true, emailVerifiedAt: true },
    });

    return res.status(201).json({
      user: serializeAuthUser(user!, result.session),
      emailVerificationSent: !result.emailVerified,
    });
  },
);

const oauthProviders = ["google", "linkedin"] as const;

authRouter.get("/oauth/:provider/start", async (req, res, next) => {
  try {
    const provider = req.params.provider;
    if (!oauthProviders.includes(provider as (typeof oauthProviders)[number])) {
      return res.status(400).json({
        error: { code: "UNKNOWN_OAUTH_PROVIDER", message: "Unsupported OAuth provider" },
      });
    }
    const { buildOAuthStartUrl, isOAuthProviderSupported } = await import(
      "../services/oauth-service.js"
    );
    if (!isOAuthProviderSupported(provider)) {
      return res.status(400).json({
        error: { code: "UNKNOWN_OAUTH_PROVIDER", message: "Unsupported OAuth provider" },
      });
    }
    const oauthProvider = provider as (typeof oauthProviders)[number];
    const url = await buildOAuthStartUrl(oauthProvider);
    return res.redirect(url);
  } catch (error) {
    if (error instanceof Error && error.message === "OAUTH_NOT_CONFIGURED") {
      return res.status(501).json({
        error: {
          code: "OAUTH_NOT_CONFIGURED",
          message: "OAuth provider credentials are not configured",
        },
      });
    }
    return next(error);
  }
});

authRouter.get("/oauth/:provider/callback", async (req, res, next) => {
  try {
    const provider = req.params.provider;
    if (!oauthProviders.includes(provider as (typeof oauthProviders)[number])) {
      return res.status(400).json({
        error: { code: "UNKNOWN_OAUTH_PROVIDER", message: "Unsupported OAuth provider" },
      });
    }
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    if (!code || !state) {
      return res.status(400).json({
        error: { code: "OAUTH_CALLBACK_INVALID", message: "Missing code or state" },
      });
    }
    const { completeOAuthLogin } = await import("../services/oauth-service.js");
    const oauthProvider = provider as (typeof oauthProviders)[number];
    const result = await completeOAuthLogin(oauthProvider, code, state);
    const env = getEnv();
    res.cookie(env.AUTH_COOKIE_NAME, result.token, getCookieOptions());
    return res.redirect(result.returnUrl);
  } catch (error) {
    const appUrl = process.env.APP_PUBLIC_URL?.trim() || "http://localhost:5173";
    const fail = new URL("/login", appUrl);
    fail.searchParams.set("oauth", "error");
    if (error instanceof Error) {
      fail.searchParams.set("reason", error.message);
    }
    return res.redirect(fail.toString());
  }
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
  await mergeGuestCartAfterAuth(req, res, session);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, emailVerifiedAt: true },
  });

  return res.json({
    user: serializeAuthUser(user!, session),
  });
});

authRouter.get("/verify-email", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const result = await verifyEmailByToken(token);
  if (!result.ok) {
    return res.redirect(buildVerificationFailureRedirect(result.code));
  }
  return res.redirect(buildVerificationSuccessRedirect());
});

authRouter.post("/verify-email/resend", requireAuth, sensitiveLimiter, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  if (!user) {
    return res.status(404).json({
      error: { code: "USER_NOT_FOUND", message: "User not found" },
    });
  }
  if (isEmailVerified(user)) {
    return res.status(200).json({ ok: true, alreadyVerified: true });
  }
  await issueEmailVerification(user.id, user.email);
  return res.status(202).json({ ok: true, alreadyVerified: false });
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
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  return res.json({
    user: serializeAuthUser(user!, req.auth!),
    requireEmailVerification: requireEmailVerificationEnabled(),
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
