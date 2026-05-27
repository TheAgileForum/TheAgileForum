import { resetEnvCache } from "./config/env.js";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/mybmadproj";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "test-jwt-secret-must-be-32-chars-min!!";
process.env.CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:5173";

resetEnvCache();
