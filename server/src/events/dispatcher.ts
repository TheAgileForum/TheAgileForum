import type { QueueName } from "./contracts.js";

const queueRoutingRules: Array<{ pattern: RegExp; queue: QueueName }> = [
  { pattern: /^checkout\./, queue: "q_critical" },
  { pattern: /^order\./, queue: "q_critical" },
  { pattern: /^enrollment\./, queue: "q_critical" },
  { pattern: /^campaign\./, queue: "q_notifications" },
  { pattern: /^notification\./, queue: "q_notifications" },
  { pattern: /^analytics\./, queue: "q_reporting" },
  { pattern: /^report\./, queue: "q_reporting" },
  { pattern: /^ai\./, queue: "q_ai_processing" },
  { pattern: /^resume\./, queue: "q_ai_processing" },
  { pattern: /^diagnosis\./, queue: "q_ai_processing" },
];

export function resolveQueueForEvent(eventName: string): QueueName {
  const rule = queueRoutingRules.find((item) => item.pattern.test(eventName));
  return rule?.queue ?? "q_reporting";
}
