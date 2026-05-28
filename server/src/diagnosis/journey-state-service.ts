import { JourneySubjectType, type Prisma } from "@prisma/client";
import { prisma } from "../db/client.js";

export async function upsertSessionJourney(input: {
  sessionId: string;
  currentFlow: string;
  currentStep: string;
  resumePayload: Prisma.InputJsonValue;
}) {
  return prisma.journeyState.upsert({
    where: {
      subjectType_subjectId: {
        subjectType: JourneySubjectType.SESSION,
        subjectId: input.sessionId,
      },
    },
    update: {
      sessionId: input.sessionId,
      currentFlow: input.currentFlow,
      currentStep: input.currentStep,
      resumePayload: input.resumePayload,
    },
    create: {
      subjectType: JourneySubjectType.SESSION,
      subjectId: input.sessionId,
      sessionId: input.sessionId,
      currentFlow: input.currentFlow,
      currentStep: input.currentStep,
      resumePayload: input.resumePayload,
    },
  });
}

export async function getJourneyState(subjectId: string) {
  return prisma.journeyState.findUnique({
    where: {
      subjectType_subjectId: {
        subjectType: JourneySubjectType.SESSION,
        subjectId,
      },
    },
  });
}
