const SENDER_API_BASE = "https://api.sender.net/v2";

export type SenderSendEmailResponse = {
  success: boolean;
  message?: string;
  emailId: string;
};

export async function sendSenderEmail(input: {
  apiToken: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SenderSendEmailResponse> {
  const body: Record<string, unknown> = {
    from: {
      email: input.fromEmail,
      name: input.fromName,
    },
    to: {
      email: input.toEmail,
      ...(input.toName ? { name: input.toName } : {}),
    },
    subject: input.subject,
    html: input.html,
  };
  if (input.text) {
    body.text = input.text;
  }

  const res = await fetch(`${SENDER_API_BASE}/message/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`SENDER_SEND_FAILED:${res.status}:${errBody.slice(0, 200)}`);
  }

  const json = (await res.json()) as SenderSendEmailResponse;
  if (!json.emailId) {
    throw new Error("SENDER_SEND_INVALID_RESPONSE");
  }
  return json;
}
