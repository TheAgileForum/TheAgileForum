/**
 * Quick check: RESEND_API_KEY can send a test email via Resend API.
 * Usage: npx tsx scripts/verify-resend-key.ts [recipient@email.com]
 */
import "dotenv/config";
import { sendResendEmail } from "../src/integrations/resend-api.js";

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.log("RESEND: RESEND_API_KEY not set");
    process.exit(1);
  }

  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    console.log("RESEND: EMAIL_FROM not set (required with RESEND_API_KEY)");
    process.exit(1);
  }

  const to = process.argv[2]?.trim() || process.env.RESEND_VERIFY_TO?.trim();
  if (!to) {
    console.log("RESEND: pass recipient as argv or set RESEND_VERIFY_TO");
    process.exit(1);
  }

  const sent = await sendResendEmail({
    apiKey,
    from,
    to,
    subject: "The Agile Forum — Resend verify",
    html: "<p>Resend API key verification from verify-resend-key.ts</p>",
  });

  console.log(`RESEND: sent test email (id=${sent.id}) to ${to} from ${from}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
