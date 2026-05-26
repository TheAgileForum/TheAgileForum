import express from "express";
import cookieParser from "cookie-parser";
import healthRouter from "./routes/health.js";
import { authRouter } from "./routes/auth.routes.js";
import { requestIdMiddleware } from "./middleware/request-id.js";

export function createApp() {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", authRouter);
  return app;
}
