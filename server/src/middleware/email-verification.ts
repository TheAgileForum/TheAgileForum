import type { RequestHandler } from "express";
import { prisma } from "../db/client.js";
import {
  isEmailVerified,
  requireEmailVerificationEnabled,
} from "../services/email-verification-service.js";

export const requireVerifiedEmail: RequestHandler = async (req, res, next) => {
  if (!requireEmailVerificationEnabled()) {
    return next();
  }
  const userId = req.auth?.userId;
  if (!userId) {
    return next();
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerifiedAt: true },
  });
  if (user && isEmailVerified(user)) {
    return next();
  }
  return res.status(403).json({
    error: {
      code: "EMAIL_NOT_VERIFIED",
      message: "Verify your email before checkout",
    },
  });
};
