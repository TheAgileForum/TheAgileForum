import { beforeEach, describe, expect, it } from "vitest";
import { resetEnvCache } from "../config/env.js";
import { validateResumeUpload } from "./upload-policy.js";

describe("resume upload policy", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mybmadproj";
    process.env.JWT_SECRET = "test-jwt-secret-must-be-32-chars-min!!";
    process.env.RESUME_UPLOAD_MAX_MB = "1";
    resetEnvCache();
  });

  it("rejects unsupported mime types", () => {
    const result = validateResumeUpload({
      mimeType: "image/png",
      sizeBytes: 1000,
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("UNSUPPORTED_MIME");
  });

  it("rejects files above max size", () => {
    const result = validateResumeUpload({
      mimeType: "application/pdf",
      sizeBytes: 2 * 1024 * 1024,
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("FILE_TOO_LARGE");
  });
});
