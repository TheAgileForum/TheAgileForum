import { z } from "zod";

export const queueNames = [
  "q_critical",
  "q_notifications",
  "q_reporting",
  "q_ai_processing",
] as const;

export const queueNameSchema = z.enum(queueNames);
export type QueueName = z.infer<typeof queueNameSchema>;

export const eventStatusSchema = z.enum(["pending", "dispatched", "failed"]);
export type EventStatus = z.infer<typeof eventStatusSchema>;

export const jobStatusSchema = z.enum(["queued", "processing", "done", "failed", "dead_letter"]);
export type JobStatus = z.infer<typeof jobStatusSchema>;

export const eventEnvelopeSchema = z.object({
  eventName: z.string().min(1),
  source: z.string().min(1),
  idempotencyKey: z.string().min(8),
  payload: z.record(z.unknown()),
});

export type EventEnvelopeInput = z.infer<typeof eventEnvelopeSchema>;

export type RetryPolicy = {
  maxAttempts: number;
  baseDelaySec: number;
  backoffMultiplier: number;
};

export const queueRetryPolicies: Record<QueueName, RetryPolicy> = {
  q_critical: { maxAttempts: 8, baseDelaySec: 5, backoffMultiplier: 2 },
  q_notifications: { maxAttempts: 5, baseDelaySec: 15, backoffMultiplier: 2 },
  q_reporting: { maxAttempts: 3, baseDelaySec: 30, backoffMultiplier: 2 },
  q_ai_processing: { maxAttempts: 4, baseDelaySec: 20, backoffMultiplier: 2 },
};
