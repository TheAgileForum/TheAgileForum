import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { resetEnvCache } from "../config/env.js";

const mockCreateSession = vi.fn();
const mockSaveIntent = vi.fn();
const mockRegisterResume = vi.fn();
const mockRequestAnalysis = vi.fn();

vi.mock("./diagnosis-service.js", () => ({
  createDiagnosisSession: (...args: unknown[]) => mockCreateSession(...args),
  saveDiagnosisIntent: (...args: unknown[]) => mockSaveIntent(...args),
  registerResumeAsset: (...args: unknown[]) => mockRegisterResume(...args),
  saveJdInput: vi.fn(),
  requestAnalysis: (...args: unknown[]) => mockRequestAnalysis(...args),
  getAnalysisRunStatus: vi.fn(),
  getAnalysisResult: vi.fn(),
}));

describe("diagnosis API contracts (no DB)", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = "postgresql://local:test@localhost:5432/test";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    resetEnvCache();
    vi.clearAllMocks();
  });

  it("POST /session returns 201 with session id", async () => {
    mockCreateSession.mockResolvedValue({
      diagnosisSessionId: "sess-1",
      nextStep: "step_1",
    });
    const res = await request(createApp())
      .post("/api/v1/diagnosis/session")
      .send({ campaignId: "home-hero" });
    expect(res.status).toBe(201);
    expect(res.body.diagnosisSessionId).toBe("sess-1");
  });

  it("PUT /intent returns 400 when consent is false", async () => {
    const res = await request(createApp())
      .put("/api/v1/diagnosis/session/sess-1/intent")
      .send({
        targetRole: "Scrum Master",
        timeline: "3 months",
        currentStatus: "Practitioner",
        consentAck: false,
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /analyze returns 400 CONSENT_REQUIRED from service", async () => {
    const { ApiError } = await import("../errors/api-error.js");
    mockRequestAnalysis.mockRejectedValue(
      new ApiError({
        status: 400,
        code: "CONSENT_REQUIRED",
        message: "Consent is required before analysis",
      }),
    );
    const res = await request(createApp())
      .post("/api/v1/diagnosis/session/sess-1/analyze")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("CONSENT_REQUIRED");
  });

  it("PUT /jd accepts targetRole without jd text (resume-only path)", async () => {
    const diagnosisService = await import("./diagnosis-service.js");
    vi.mocked(diagnosisService.saveJdInput).mockResolvedValue({ saved: true, nextStep: "step_2" });
    const res = await request(createApp())
      .put("/api/v1/diagnosis/session/sess-1/jd")
      .send({ targetRole: "Scrum Master" });
    expect(res.status).toBe(200);
    expect(res.body.saved).toBe(true);
  });

  it("POST /resume returns 400 for unsupported mime", async () => {
    const { ApiError } = await import("../errors/api-error.js");
    mockRegisterResume.mockRejectedValue(
      new ApiError({
        status: 400,
        code: "UNSUPPORTED_MIME",
        message: "Only PDF/DOC/DOCX resume uploads are supported",
        retryable: true,
      }),
    );
    const res = await request(createApp())
      .post("/api/v1/diagnosis/session/sess-1/resume")
      .send({
        fileName: "resume.exe",
        mimeType: "application/octet-stream",
        sizeBytes: 1000,
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("UNSUPPORTED_MIME");
    expect(res.body.error.retryable).toBe(true);
  });
});
