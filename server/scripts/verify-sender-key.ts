/**
 * Quick check: SENDER_API_TOKEN can send a test email via Sender.net API.
 * Usage: npx tsx scripts/verify-sender-key.ts [recipient@email.com]
 */
import "dotenv/config";
import { getEmailFromName, getSenderApiToken } from "../src/integrations/email-provider.js";
import { sendSenderEmail } from "../src/integrations/sender-api.js";

async function main(): Promise<void> {
  const apiToken = getSenderApiToken();
  if (!apiToken) {
    console.log("SENDER: SENDER_API_TOKEN (or SENDER_API_KEY) not set");
    process.exit(1);
  }

  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    console.log("SENDER: EMAIL_FROM not set (required with SENDER_API_TOKEN)");
    process.exit(1);
  }

  const to = process.argv[2]?.trim() || process.env.SENDER_VERIFY_TO?.trim();
  if (!to) {
    console.log("SENDER: pass recipient as argv or set SENDER_VERIFY_TO");
    process.exit(1);
  }

  const fromName = getEmailFromName();
  const sent = await sendSenderEmail({
    apiToken,
    fromEmail: from,
    fromName,
    toEmail: to,
    subject: "The Agile Forum — Sender verify",
    html: "<p>Sender API token verification from verify-sender-key.ts</p>",
  });

  console.log(
    `SENDER: sent test email (emailId=${sent.emailId}) to ${to} from ${fromName} <${from}>`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
