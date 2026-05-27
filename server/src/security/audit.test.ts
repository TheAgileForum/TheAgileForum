import { afterEach, describe, expect, it, vi } from "vitest";
import { logPrivilegedAction } from "./audit.js";

describe("privileged action audit logging", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits structured audit event fields", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logPrivilegedAction({
      action: "admin_check_access",
      actorUserId: "user_1",
      actorRole: "OPS_ADMIN",
      tenantId: "tenant_1",
      requestId: "req_1",
      metadata: { targetRoute: "/api/v1/auth/admin-check" },
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const [rawLine] = logSpy.mock.calls[0] ?? [];
    const payload = JSON.parse(String(rawLine));
    expect(payload.level).toBe("INFO");
    expect(payload.message).toBe("Privileged action");
    expect(payload.component).toBe("audit");
    expect(payload.event).toBe("privileged_action");
    expect(payload.action).toBe("admin_check_access");
    expect(payload.actorRole).toBe("OPS_ADMIN");
    expect(payload.targetRoute).toBe("/api/v1/auth/admin-check");
  });
});
