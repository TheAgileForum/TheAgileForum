import { Router } from "express";
import { optionalAuth } from "../middleware/optional-auth.js";
import { getJourneyState } from "../diagnosis/journey-state-service.js";
import { ApiError } from "../errors/api-error.js";

export const journeyStateRouter = Router();

journeyStateRouter.get("/:subjectId", optionalAuth, async (req, res, next) => {
  try {
    const state = await getJourneyState(req.params.subjectId);
    if (!state) {
      throw new ApiError({
        status: 404,
        code: "JOURNEY_STATE_NOT_FOUND",
        message: "No journey state found for this subject",
      });
    }
    return res.json({
      currentFlow: state.currentFlow,
      currentStep: state.currentStep,
      resumePayload: state.resumePayload,
      updatedAt: state.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
});
