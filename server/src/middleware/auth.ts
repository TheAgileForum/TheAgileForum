import type { RequestHandler } from "express";
import { getEnv } from "../config/env.js";
import { verifySessionToken } from "../services/auth-service.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const env = getEnv();
  const raw = req.cookies?.[env.AUTH_COOKIE_NAME];
  const token = typeof raw === "string" ? raw : undefined;
  if (!token) {
    return res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "Not signed in" },
    });
  }
  const claims = await verifySessionToken(token);
  if (!claims) {
    return res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "Invalid session" },
    });
  }
  req.auth = claims;
  next();
};
