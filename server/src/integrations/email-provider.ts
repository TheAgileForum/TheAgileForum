/**
 * Resolve which transactional email backend LiveEmailAdapter should use.
 *
 * Priority:
 * 1. Explicit EMAIL_PROVIDER=resend|sender (requires matching credentials)
 * 2. Auto: Resend if RESEND_API_KEY set, else Sender if token set, else stub
 *
 * Token: prefer SENDER_API_TOKEN; accept SENDER_API_KEY as alias.
 */
export type TransactionalEmailProvider = "resend" | "sender" | "stub";

export function getSenderApiToken(): string | undefined {
  const token =
    process.env.SENDER_API_TOKEN?.trim() || process.env.SENDER_API_KEY?.trim();
  return token || undefined;
}

export function getResendApiKey(): string | undefined {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || undefined;
}

export function resolveTransactionalEmailProvider(): TransactionalEmailProvider {
  const explicit = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const resendKey = getResendApiKey();
  const senderToken = getSenderApiToken();

  if (explicit === "resend") {
    return resendKey ? "resend" : "stub";
  }
  if (explicit === "sender") {
    return senderToken ? "sender" : "stub";
  }

  if (resendKey) return "resend";
  if (senderToken) return "sender";
  return "stub";
}

export function getEmailFromName(): string {
  return process.env.EMAIL_FROM_NAME?.trim() || "The Agile Forum";
}
