import type { RequestHandler } from "express";
import { getEnv } from "../config/env.js";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function bucketKey(routeKey: string, ip: string) {
  return `${routeKey}:${ip}`;
}

export function createRateLimitMiddleware(routeKey: string): RequestHandler {
  return (req, res, next) => {
    const env = getEnv();
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = bucketKey(routeKey, ip);
    const existing = buckets.get(key);
    const resetAt = now + env.RATE_LIMIT_WINDOW_MS;

    if (!existing || now >= existing.resetAt) {
      buckets.set(key, { count: 1, resetAt });
      return next();
    }

    if (existing.count >= env.RATE_LIMIT_MAX_REQUESTS) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      return res.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please retry later",
        },
      });
    }

    existing.count += 1;
    buckets.set(key, existing);
    return next();
  };
}

export function resetRateLimitBuckets() {
  buckets.clear();
}
