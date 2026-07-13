import { ApiError } from "../errors/api-error.js";
import { IntegrationError } from "../integrations/errors.js";

function rawDeliveryMessage(error: unknown): string {
  if (error instanceof IntegrationError) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Map Resend / adapter failures to a client-safe API error. */
export function mapEmailDeliveryFailure(error: unknown): ApiError {
  const raw = rawDeliveryMessage(error);

  let message =
    "We could not send the verification email right now. Please try again in a few minutes.";

  if (raw.includes("only send testing emails")) {
    message =
      "Staging email is limited to the Resend account owner inbox. Verify a domain in Resend or register with that account email.";
  } else if (raw.includes("domain is not verified")) {
    message =
      "The sender domain is not verified in Resend. An administrator must verify the domain before verification emails can be delivered.";
  } else if (raw.includes("EMAIL_FROM is required")) {
    message = "Email delivery is not configured on the server (missing sender address).";
  }

  return new ApiError({
    status: 502,
    code: "EMAIL_DELIVERY_FAILED",
    message,
    retryable: true,
  });
}

export function warnResendSandboxMisconfiguration(): void {
  const from = process.env.EMAIL_FROM?.trim();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const mode = process.env.INTEGRATION_PROVIDER_MODE?.trim();
  if (!apiKey || mode !== "live") return;

  if (from === "onboarding@resend.dev") {
    // eslint-disable-next-line no-console -- boot-time operator warning
    console.warn(
      "[email] EMAIL_FROM=onboarding@resend.dev only delivers to the Resend account owner. " +
        "Verify a domain at resend.com/domains and set EMAIL_FROM to that domain for staging/production.",
    );
  }
}
