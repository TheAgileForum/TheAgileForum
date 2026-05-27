import { queueRetryPolicies, type QueueName } from "./contracts.js";

export type FailureTransition = {
  attempts: number;
  status: "queued" | "dead_letter";
  nextRunAt: Date | null;
  error: string;
};

export function calculateBackoffDelayMs(
  queue: QueueName,
  attempts: number,
): number {
  const policy = queueRetryPolicies[queue];
  const multiplierPow = Math.max(attempts - 1, 0);
  return policy.baseDelaySec * 1000 * policy.backoffMultiplier ** multiplierPow;
}

export function transitionOnJobFailure(input: {
  queue: QueueName;
  currentAttempts: number;
  now?: Date;
  error: string;
}): FailureTransition {
  const policy = queueRetryPolicies[input.queue];
  const attempts = input.currentAttempts + 1;
  const now = input.now ?? new Date();

  if (attempts >= policy.maxAttempts) {
    return {
      attempts,
      status: "dead_letter",
      nextRunAt: null,
      error: input.error,
    };
  }

  const delayMs = calculateBackoffDelayMs(input.queue, attempts);
  return {
    attempts,
    status: "queued",
    nextRunAt: new Date(now.getTime() + delayMs),
    error: input.error,
  };
}
