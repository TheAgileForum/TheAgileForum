import type { RequestHandler } from "express";
import { getEnv } from "../config/env.js";
import { verifySessionToken } from "../services/auth-service.js";

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const env = getEnv();
  const raw = req.cookies?.[env.AUTH_COOKIE_NAME];
  const token = typeof raw === "string" ? raw : undefined;
  if (!token) {
    return next();
  }
  const claims = await verifySessionToken(token);
  if (claims) {
    req.auth = claims;
  }
  return next();
};
