import type { ErrorRequestHandler } from "express";
import { isApiError } from "../errors/api-error.js";
import { logError } from "../runtime/logger.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (isApiError(error)) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        retryable: error.retryable,
        requestId: req.requestId ?? null,
      },
    });
  }

  logError("Unhandled API error", {
    route: req.originalUrl,
    method: req.method,
    requestId: req.requestId ?? null,
    error: error instanceof Error ? error.message : String(error),
  });

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected error",
      requestId: req.requestId ?? null,
    },
  });
};
