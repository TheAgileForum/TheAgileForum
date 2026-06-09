import { Router } from "express";
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

export const diagnosisRouter = Router();

diagnosisRouter.use(optionalAuth);

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

diagnosisRouter.post(
  "/session/:sessionId/resume",
  withBodyValidation(resumeBody),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof resumeBody>;
      const result = await registerResumeAsset(req.params.sessionId, body);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },
);

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
