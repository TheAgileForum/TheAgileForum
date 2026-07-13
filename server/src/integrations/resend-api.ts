const RESEND_API_BASE = "https://api.resend.com";

export type ResendSendEmailResponse = {
  id: string;
};

export async function sendResendEmail(input: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<ResendSendEmailResponse> {
  const res = await fetch(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RESEND_SEND_FAILED:${res.status}:${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as ResendSendEmailResponse;
  if (!json.id) {
    throw new Error("RESEND_SEND_INVALID_RESPONSE");
  }
  return json;
}
