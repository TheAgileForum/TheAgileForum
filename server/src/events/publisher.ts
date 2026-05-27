import { prisma } from "../db/client.js";
import type { Prisma } from "@prisma/client";
import {
  eventEnvelopeSchema,
  queueRetryPolicies,
  type EventEnvelopeInput,
} from "./contracts.js";
import { resolveQueueForEvent } from "./dispatcher.js";

export type PublishedEventResult = {
  eventId: string;
  jobId: string;
  queue: string;
  eventName: string;
  idempotencyKey: string;
};

export async function publishEvent(input: EventEnvelopeInput): Promise<PublishedEventResult> {
  const payload = eventEnvelopeSchema.parse(input);
  const queue = resolveQueueForEvent(payload.eventName);
  const retryPolicy = queueRetryPolicies[queue];
  const jsonPayload = payload.payload as Prisma.InputJsonValue;

  const event = await prisma.eventLog.upsert({
    where: { idempotencyKey: payload.idempotencyKey },
    update: {
      payload: jsonPayload,
      source: payload.source,
      eventName: payload.eventName,
      status: "pending",
    },
    create: {
      eventName: payload.eventName,
      payload: jsonPayload,
      source: payload.source,
      idempotencyKey: payload.idempotencyKey,
      status: "pending",
    },
  });

  const runAt = new Date();
  const job = await prisma.jobRun.create({
    data: {
      jobType: `dispatch:${payload.eventName}`,
      queue,
      runAt,
      attempts: 0,
      status: "queued",
      error: null,
    },
  });

  await prisma.eventLog.update({
    where: { id: event.id },
    data: {
      status: "dispatched",
      payload: {
        ...payload.payload,
        _dispatch: {
          queue,
          retryPolicy,
          jobId: job.id,
          dispatchedAt: runAt.toISOString(),
        },
      } as Prisma.InputJsonValue,
    },
  });

  return {
    eventId: event.id,
    jobId: job.id,
    queue,
    eventName: payload.eventName,
    idempotencyKey: payload.idempotencyKey,
  };
}
