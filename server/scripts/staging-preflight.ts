/**
 * Validates staging/production URL wiring for OAuth + CORS before deploy.
 * Usage: npm run staging:preflight
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type DomainsFile = {
  staging: {
    appPublicUrl: string;
    apiPublicUrl: string;
    corsAllowedOrigins: string[];
    oauthRedirects: Record<string, string>;
  };
};

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function ok(message: string): void {
  console.log(`OK: ${message}`);
}

function normalizeUrl(value: string): string {
  return value.replace(/\/$/, "");
}

function main(): void {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const domainsPath = path.join(root, "deploy", "domains.json");
  const domains = JSON.parse(readFileSync(domainsPath, "utf8")) as DomainsFile;
  const staging = domains.staging;

  const appUrl = process.env.APP_PUBLIC_URL?.trim();
  const apiUrl = process.env.API_PUBLIC_URL?.trim();
  const cors = process.env.CORS_ALLOWED_ORIGINS?.trim();
  const stubMode = process.env.OAUTH_STUB_MODE;
  const linkedinId = process.env.LINKEDIN_CLIENT_ID?.trim();
  const linkedinSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
  const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  console.log("Staging preflight — OAuth + URL wiring\n");
  console.log(`Canonical (deploy/domains.json):`);
  console.log(`  APP  ${staging.appPublicUrl}`);
  console.log(`  API  ${staging.apiPublicUrl}`);
  console.log(`  LinkedIn redirect ${staging.oauthRedirects.linkedin}`);
  console.log("");

  if (!appUrl) fail("APP_PUBLIC_URL is not set");
  if (!apiUrl) fail("API_PUBLIC_URL is not set");
  if (!cors) fail("CORS_ALLOWED_ORIGINS is not set");

  ok(`APP_PUBLIC_URL=${normalizeUrl(appUrl)}`);
  ok(`API_PUBLIC_URL=${normalizeUrl(apiUrl)}`);

  if (!cors.split(",").map((s) => normalizeUrl(s.trim())).includes(normalizeUrl(appUrl))) {
    fail(`CORS_ALLOWED_ORIGINS must include APP_PUBLIC_URL (${appUrl})`);
  }
  ok("CORS allows app origin");

  for (const [provider, redirect] of Object.entries(staging.oauthRedirects)) {
    const expected = `${normalizeUrl(apiUrl)}/api/v1/auth/oauth/${provider}/callback`;
    if (normalizeUrl(redirect) !== expected && normalizeUrl(apiUrl) === normalizeUrl(staging.apiPublicUrl)) {
      console.warn(
        `WARN: deploy/domains.json ${provider} redirect differs from API_PUBLIC_URL — update domains.json or env`,
      );
    }
    ok(`${provider} callback → ${expected} (register in provider console)`);
  }

  if (stubMode === "true") {
    console.warn("WARN: OAUTH_STUB_MODE=true — live LinkedIn/Google will not run on staging");
  } else {
    ok("OAUTH_STUB_MODE is not true");
    if (!linkedinId || !linkedinSecret) {
      console.warn("WARN: LINKEDIN_CLIENT_ID/SECRET missing — LinkedIn live disabled");
    } else {
      ok("LinkedIn credentials present");
    }
    if (!googleId || !googleSecret) {
      console.warn("WARN: GOOGLE_CLIENT_ID/SECRET missing — Google live disabled");
    } else {
      ok("Google credentials present");
    }
  }

  if (!process.env.DATABASE_URL?.trim()) fail("DATABASE_URL is not set");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    fail("JWT_SECRET must be at least 32 characters");
  }
  ok("DATABASE_URL and JWT_SECRET present");

  console.log("\nPreflight passed. Next:");
  console.log("  1. Register OAuth redirect URIs (printed above) in LinkedIn + Google consoles");
  console.log("  2. Build client with VITE_API_URL=" + normalizeUrl(apiUrl));
  console.log("  3. curl " + normalizeUrl(apiUrl) + "/api/v1/health");
  console.log("  4. Manual login test — docs/staging-deploy.md §7");
}

main();
