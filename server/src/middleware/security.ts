import type { RequestHandler } from "express";
import { getEnv } from "../config/env.js";

const defaultAllowedHeaders = "Content-Type, Authorization, X-Request-Id, Stripe-Signature";
const defaultAllowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS";

export const securityHeadersMiddleware: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("X-XSS-Protection", "0");
  next();
};

function getAllowedOrigins(): Set<string> {
  const env = getEnv();
  const origins = env.CORS_ALLOWED_ORIGINS.split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return new Set(origins);
}

export const corsMiddleware: RequestHandler = (req, res, next) => {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin;

  if (!origin) {
    return next();
  }

  if (!allowedOrigins.has(origin)) {
    return res.status(403).json({
      error: {
        code: "CORS_ORIGIN_BLOCKED",
        message: "Origin is not allowed",
      },
    });
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", defaultAllowedHeaders);
  res.setHeader("Access-Control-Allow-Methods", defaultAllowedMethods);

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  return next();
};
