import express from "express";
import cookieParser from "cookie-parser";
import healthRouter from "./routes/health.js";
import { authRouter } from "./routes/auth.routes.js";
import { catalogRouter } from "./routes/catalog.routes.js";
import { commerceRouter } from "./routes/commerce.routes.js";
import { diagnosisRouter } from "./routes/diagnosis.routes.js";
import { journeyStateRouter } from "./routes/journey-state.routes.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { errorHandler } from "./middleware/error-handler.js";
import { corsMiddleware, securityHeadersMiddleware } from "./middleware/security.js";
import { stripeWebhookRouter } from "./routes/stripe-webhook.routes.js";

export function createApp() {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware);
  app.use(
    "/api/v1/integrations/stripe",
    express.raw({ type: "application/json", limit: "1mb" }),
  );
  app.use("/api/v1/integrations/stripe", stripeWebhookRouter);
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/catalog", catalogRouter);
  app.use("/api/v1/commerce", commerceRouter);
  app.use("/api/v1/diagnosis", diagnosisRouter);
  app.use("/api/v1/journey-state", journeyStateRouter);
  app.use(errorHandler);
  return app;
}
