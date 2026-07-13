import { describe, expect, it } from "vitest";
import { IntegrationError } from "../integrations/errors.js";
import { mapEmailDeliveryFailure } from "./email-delivery-errors.js";

describe("mapEmailDeliveryFailure", () => {
  it("maps Resend sandbox recipient restriction", () => {
    const err = mapEmailDeliveryFailure(
      new IntegrationError(
        "INTEGRATION_PROVIDER_FAILURE",
        'RESEND_SEND_FAILED:403:{"message":"only send testing emails to your own email"}',
        "email",
      ),
    );
    expect(err.code).toBe("EMAIL_DELIVERY_FAILED");
    expect(err.status).toBe(502);
    expect(err.message).toContain("Resend account owner");
  });

  it("maps unverified domain", () => {
    const err = mapEmailDeliveryFailure(
      new IntegrationError(
        "INTEGRATION_PROVIDER_FAILURE",
        'RESEND_SEND_FAILED:403:{"message":"domain is not verified"}',
        "email",
      ),
    );
    expect(err.message).toContain("not verified");
  });
});
