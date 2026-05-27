export type IntegrationErrorCode =
  | "INTEGRATION_TIMEOUT"
  | "INTEGRATION_RETRY_EXHAUSTED"
  | "INTEGRATION_PROVIDER_FAILURE";

export class IntegrationError extends Error {
  constructor(
    public readonly code: IntegrationErrorCode,
    message: string,
    public readonly provider: string,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

export function mapProviderFailure(provider: string, reason: string): IntegrationError {
  if (reason.toLowerCase().includes("timeout")) {
    return new IntegrationError("INTEGRATION_TIMEOUT", reason, provider);
  }
  if (reason.toLowerCase().includes("retry")) {
    return new IntegrationError("INTEGRATION_RETRY_EXHAUSTED", reason, provider);
  }
  return new IntegrationError("INTEGRATION_PROVIDER_FAILURE", reason, provider);
}
