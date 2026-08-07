import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { optionalAuth } from "../middleware/optional-auth.js";
import { withBodyValidation } from "../middleware/validation.js";
import {
  analyzeBody,
  createSessionBody,
  intentBody,
  jdBody,
  resumeBody,
} from "../diagnosis/contracts.js";
import {
  createDiagnosisSession,
  getAnalysisResult,
  getAnalysisRunStatus,
  registerResumeAsset,
  requestAnalysis,
  saveDiagnosisIntent,
  saveJdInput,
} from "../diagnosis/diagnosis-service.js";
import { getEnv } from "../config/env.js";
import { ApiError } from "../errors/api-error.js";

export const diagnosisRouter = Router();

diagnosisRouter.use(optionalAuth);

const resumeMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Math.max(1, (Number(process.env.RESUME_UPLOAD_MAX_MB) || 5) * 1024 * 1024),
  },
});

diagnosisRouter.post(
  "/session",
  withBodyValidation(createSessionBody),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof createSessionBody>;
      const result = await createDiagnosisSession({
        userId: req.auth?.userId,
        roleIntent: body.roleIntent,
        campaignId: body.campaignId,
      });
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },
);

diagnosisRouter.put(
  "/session/:sessionId/intent",
  withBodyValidation(intentBody),
  async (req, res, next) => {
    try {
      const result = await saveDiagnosisIntent(req.params.sessionId, req.body);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * Multipart file upload (preferred): field name `file`.
 * Legacy JSON metadata body still accepted when Content-Type is application/json.
 */
diagnosisRouter.post("/session/:sessionId/resume", (req, res, next) => {
  const contentType = req.headers["content-type"] ?? "";
  if (contentType.includes("multipart/form-data")) {
    return resumeMulter.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError({
              status: 400,
              code: "FILE_TOO_LARGE",
              message: `Resume exceeds max size of ${getEnv().RESUME_UPLOAD_MAX_MB}MB`,
              retryable: true,
            }),
          );
        }
        return next(err);
      }
      void (async () => {
        try {
          const file = req.file;
          if (!file) {
            throw new ApiError({
              status: 400,
              code: "RESUME_FILE_REQUIRED",
              message: "Resume file is required (multipart field: file)",
              retryable: true,
            });
          }
          const mimeType =
            file.mimetype ||
            (typeof req.body?.mimeType === "string" ? req.body.mimeType : "") ||
            "application/octet-stream";
          const result = await registerResumeAsset(req.params.sessionId, {
            fileName: file.originalname || "resume",
            mimeType,
            sizeBytes: file.size,
            buffer: file.buffer,
          });
          return res.status(201).json(result);
        } catch (error) {
          return next(error);
        }
      })();
    });
  }

  return withBodyValidation(resumeBody)(req, res, (validationErr) => {
    if (validationErr) return next(validationErr);
    void (async () => {
      try {
        const body = req.body as z.infer<typeof resumeBody>;
        const result = await registerResumeAsset(req.params.sessionId, body);
        return res.status(201).json(result);
      } catch (error) {
        return next(error);
      }
    })();
  });
});

diagnosisRouter.put(
  "/session/:sessionId/jd",
  withBodyValidation(jdBody),
  async (req, res, next) => {
    try {
      const result = await saveJdInput(req.params.sessionId, req.body);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  },
);

diagnosisRouter.post(
  "/session/:sessionId/analyze",
  withBodyValidation(analyzeBody),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof analyzeBody>;
      const result = await requestAnalysis(req.params.sessionId, body.runReason);
      return res.status(202).json(result);
    } catch (error) {
      return next(error);
    }
  },
);

diagnosisRouter.get("/runs/:runId", async (req, res, next) => {
  try {
    const result = await getAnalysisRunStatus(req.params.runId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

diagnosisRouter.get("/runs/:runId/result", async (req, res, next) => {
  try {
    const result = await getAnalysisResult(req.params.runId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});
