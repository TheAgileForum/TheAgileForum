import { logInfo } from "../runtime/logger.js";

export function logPrivilegedAction(input: {
  action: string;
  actorUserId: string;
  actorRole: string;
  tenantId: string | null;
  requestId: string | null;
  metadata?: Record<string, unknown>;
}) {
  logInfo("Privileged action", {
    component: "audit",
    event: "privileged_action",
    action: input.action,
    actorUserId: input.actorUserId,
    actorRole: input.actorRole,
    tenantId: input.tenantId,
    requestId: input.requestId,
    ...(input.metadata ?? {}),
  });
}
