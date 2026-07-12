/**
 * Quick check: STRIPE_SECRET_KEY reaches Stripe API (test mode).
 * Usage: npx tsx scripts/verify-stripe-key.ts
 */
import "dotenv/config";

async function main(): Promise<void> {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    console.log("STRIPE: STRIPE_SECRET_KEY not set");
    process.exit(1);
  }
  const mode = key.startsWith("sk_live_") ? "live" : key.startsWith("sk_test_") ? "test" : "unknown";
  const res = await fetch("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.log(`STRIPE: API rejected key (${res.status})`);
    process.exit(1);
  }
  console.log(`STRIPE: key valid (${mode} mode)`);
  const webhook = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  console.log(`STRIPE_WEBHOOK_SECRET: ${webhook ? "set" : "not set (confirm API or Stripe CLI for local)"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
