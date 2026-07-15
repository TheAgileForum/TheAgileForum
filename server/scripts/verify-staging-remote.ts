/**
 * Remote staging smoke probes (no secrets required).
 * Usage: npm run staging:verify
 */
const API = process.env.STAGING_API_URL?.trim() || "https://api.staging.theagileforum.com";
const APP = process.env.STAGING_APP_URL?.trim() || "https://app.staging.theagileforum.com";

type Probe = { name: string; ok: boolean; detail: string };

async function probe(name: string, fn: () => Promise<Probe>): Promise<Probe> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name, ok: false, detail: msg };
  }
}

function oauthMode(location: string | null): "live-linkedin" | "live-google" | "stub" | "unknown" {
  if (!location) return "unknown";
  if (location.includes("linkedin.com/oauth")) return "live-linkedin";
  if (location.includes("accounts.google.com")) return "live-google";
  if (location.includes("code=dev-stub")) return "stub";
  return "unknown";
}

async function main(): Promise<void> {
  console.log(`Staging verify — API ${API}\n`);
  const results: Probe[] = [];

  results.push(
    await probe("health", async () => {
      const res = await fetch(`${API}/api/v1/health`);
      const body = await res.text();
      return {
        name: "health",
        ok: res.ok && body.includes('"ok"'),
        detail: `${res.status} ${body}`,
      };
    }),
  );

  results.push(
    await probe("catalog", async () => {
      const res = await fetch(`${API}/api/v1/catalog/offerings`);
      const json = (await res.json()) as { offerings?: unknown[] };
      const count = json.offerings?.length ?? 0;
      return {
        name: "catalog",
        ok: count > 0,
        detail: `${count} offerings (run db:seed if 0)`,
      };
    }),
  );

  results.push(
    await probe("spa-direct-api-bundle", async () => {
      const htmlRes = await fetch(`${APP}/trainings`);
      const html = await htmlRes.text();
      const match = html.match(/\/assets\/(index-[^"']+\.js)/);
      if (!match) {
        return {
          name: "spa-direct-api-bundle",
          ok: false,
          detail: "could not find index-*.js in SPA HTML — redeploy client on Vercel",
        };
      }
      const bundleName = match[1];
      const bundleRes = await fetch(`${APP}/assets/${bundleName}`);
      const bundle = await bundleRes.text();
      const hasDirectApiHost =
        bundle.includes("api.staging.theagileforum.com") ||
        bundle.includes("DIRECT_API_BY_HOST");
      // Prefer direct API host mapping (faster than Vercel /api rewrite).
      // Legacy same-origin-only bundles still pass via spa-catalog-proxy probe.
      return {
        name: "spa-direct-api-bundle",
        ok: true,
        detail: hasDirectApiHost
          ? `${bundleName} maps app.staging → api.staging (direct)`
          : `${bundleName} may still use same-origin /api proxy — preferred: redeploy client with direct API map`,
      };
    }),
  );

  results.push(
    await probe("spa-catalog-proxy", async () => {
      const res = await fetch(`${APP}/api/v1/catalog/trainings`);
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const snippet = (await res.text()).slice(0, 80);
        return {
          name: "spa-catalog-proxy",
          ok: false,
          detail: `${res.status} non-JSON (${contentType || "no content-type"}) — ${snippet}`,
        };
      }
      const json = (await res.json()) as { offerings?: unknown[] };
      const count = json.offerings?.length ?? 0;
      return {
        name: "spa-catalog-proxy",
        ok: res.ok && count > 0,
        detail: `${res.status} ${count} trainings via ${APP}/api proxy`,
      };
    }),
  );

  results.push(
    await probe("linkedin-oauth", async () => {
      const res = await fetch(`${API}/api/v1/auth/oauth/linkedin/start`, { redirect: "manual" });
      const location = res.headers.get("location");
      const mode = oauthMode(location);
      return {
        name: "linkedin-oauth",
        ok: mode === "live-linkedin",
        detail: `mode=${mode}${location ? ` → ${location.slice(0, 80)}…` : ""}`,
      };
    }),
  );

  results.push(
    await probe("google-oauth", async () => {
      const res = await fetch(`${API}/api/v1/auth/oauth/google/start`, { redirect: "manual" });
      if (res.status === 501) {
        return { name: "google-oauth", ok: false, detail: "501 OAUTH_NOT_CONFIGURED (optional)" };
      }
      const location = res.headers.get("location");
      const mode = oauthMode(location);
      return {
        name: "google-oauth",
        ok: mode === "live-google",
        detail: `mode=${mode}${location ? ` → ${location.slice(0, 80)}…` : ""}`,
      };
    }),
  );

  results.push(
    await probe("spa-login", async () => {
      const res = await fetch(`${APP}/login`);
      return {
        name: "spa-login",
        ok: res.ok,
        detail: `status=${res.status}`,
      };
    }),
  );

  results.push(
    await probe("auth-register", async () => {
      const email = `staging-probe-${Date.now()}@example.com`;
      const res = await fetch(`${API}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: "ProbePass123!",
          policyVersion: "v1",
          acceptTerms: true,
        }),
      });
      const body = await res.text();
      return {
        name: "auth-register",
        ok: res.status === 201,
        detail: `${res.status} ${body.slice(0, 120)}`,
      };
    }),
  );

  results.push(
    await probe("auth-login-demo", async () => {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "customer@demo.local", password: "password123" }),
      });
      const body = await res.text();
      const ok = res.status === 200 || res.status === 401;
      return {
        name: "auth-login-demo",
        ok,
        detail: ok
          ? `${res.status} auth route reachable`
          : `${res.status} ${body.slice(0, 120)} — check users/oauth migrations`,
      };
    }),
  );

  let failed = 0;
  for (const r of results) {
    const tag = r.ok ? "PASS" : "FAIL";
    console.log(`${tag}  ${r.name}: ${r.detail}`);
    if (!r.ok) failed += 1;
  }

  console.log(`\n${results.length - failed}/${results.length} passed`);
  if (failed > 0) process.exit(1);
}

main();
