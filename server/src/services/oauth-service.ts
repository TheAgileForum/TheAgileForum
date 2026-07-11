import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { getEnv, getApiPublicUrl, getAppPublicUrl } from "../config/env.js";
import { prisma } from "../db/client.js";
import { Role } from "@prisma/client";
import { registerUser } from "./registration-service.js";
import type { SessionClaims } from "./auth-service.js";
import { signSessionToken } from "./auth-service.js";

export type OAuthProvider = "google" | "linkedin";

const STATE_TTL_SEC = 600;

const PLACEHOLDER_OAUTH_VALUES = new Set([
  "test",
  "changeme",
  "change-me",
  "your-client-id",
  "your-client-secret",
  "xxx",
  "placeholder",
]);

function isRealOAuthCredential(value: string | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  if (PLACEHOLDER_OAUTH_VALUES.has(trimmed.toLowerCase())) return false;
  return trimmed.length >= 8;
}

function oauthStubEnabled(): boolean {
  if (process.env.OAUTH_STUB_MODE === "false") return false;
  if (process.env.OAUTH_STUB_MODE === "true") return true;
  return getEnv().NODE_ENV !== "production";
}

function providerConfigured(provider: OAuthProvider): boolean {
  if (provider === "google") {
    return (
      isRealOAuthCredential(process.env.GOOGLE_CLIENT_ID) &&
      isRealOAuthCredential(process.env.GOOGLE_CLIENT_SECRET)
    );
  }
  return (
    isRealOAuthCredential(process.env.LINKEDIN_CLIENT_ID) &&
    isRealOAuthCredential(process.env.LINKEDIN_CLIENT_SECRET)
  );
}

function hasPartialProviderCredentials(provider: OAuthProvider): boolean {
  if (provider === "google") {
    return Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() || process.env.GOOGLE_CLIENT_SECRET?.trim(),
    );
  }
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID?.trim() || process.env.LINKEDIN_CLIENT_SECRET?.trim(),
  );
}

function shouldUseOAuthStub(provider: OAuthProvider): boolean {
  if (oauthStubEnabled()) return true;
  if (providerConfigured(provider)) return false;
  if (process.env.OAUTH_STUB_MODE === "false") {
    // Stub explicitly disabled: fail closed unless dev env still has placeholder/partial creds.
    if (getEnv().NODE_ENV === "production") return false;
    return hasPartialProviderCredentials(provider);
  }
  // Local dev: avoid broken redirects when credentials are missing or placeholders.
  return getEnv().NODE_ENV !== "production";
}

export function isOAuthProviderSupported(provider: string): provider is OAuthProvider {
  return provider === "google" || provider === "linkedin";
}

async function signOAuthState(provider: OAuthProvider): Promise<string> {
  const secret = new TextEncoder().encode(getEnv().JWT_SECRET);
  return new SignJWT({ provider })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SEC}s`)
    .sign(secret);
}

export async function verifyOAuthState(state: string, provider: OAuthProvider): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(getEnv().JWT_SECRET);
    const { payload } = await jwtVerify(state, secret);
    return payload.provider === provider;
  } catch {
    return false;
  }
}

function publicAppUrl(): string {
  return getAppPublicUrl();
}

function apiPublicUrl(): string {
  return getApiPublicUrl();
}

export async function buildOAuthStartUrl(provider: OAuthProvider): Promise<string> {
  const state = await signOAuthState(provider);
  const redirectUri = `${apiPublicUrl()}/api/v1/auth/oauth/${provider}/callback`;

  if (shouldUseOAuthStub(provider)) {
    const params = new URLSearchParams({ code: "dev-stub", state });
    return `${redirectUri}?${params.toString()}`;
  }

  if (!providerConfigured(provider)) {
    throw new Error("OAUTH_NOT_CONFIGURED");
  }

  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: redirectUri,
    state,
    scope: "openid profile email",
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

type OAuthProfile = { email: string; subject: string };

async function fetchGoogleProfile(code: string): Promise<OAuthProfile> {
  const redirectUri = `${apiPublicUrl()}/api/v1/auth/oauth/google/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!profileRes.ok) throw new Error("OAUTH_PROFILE_FAILED");
  const profile = (await profileRes.json()) as { email?: string; sub?: string };
  if (!profile.email || !profile.sub) throw new Error("OAUTH_PROFILE_FAILED");
  return { email: profile.email.toLowerCase(), subject: profile.sub };
}

async function resolveStubProfile(provider: OAuthProvider): Promise<OAuthProfile> {
  const suffix = createHash("sha256").update(randomBytes(8)).digest("hex").slice(0, 8);
  return {
    email: `${provider}-user-${suffix}@oauth.stub.local`,
    subject: `${provider}-stub-${suffix}`,
  };
}

async function fetchLinkedInProfile(code: string): Promise<OAuthProfile> {
  const redirectUri = `${apiPublicUrl()}/api/v1/auth/oauth/linkedin/callback`;
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });
  if (!tokenRes.ok) throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");

  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!profileRes.ok) throw new Error("OAUTH_PROFILE_FAILED");
  const profile = (await profileRes.json()) as { email?: string; sub?: string };
  if (!profile.email || !profile.sub) throw new Error("OAUTH_PROFILE_FAILED");
  return { email: profile.email.toLowerCase(), subject: profile.sub };
}

async function resolveProfile(provider: OAuthProvider, code: string): Promise<OAuthProfile> {
  if (code === "dev-stub" && oauthStubEnabled()) {
    return resolveStubProfile(provider);
  }
  if (provider === "google") {
    return fetchGoogleProfile(code);
  }
  if (provider === "linkedin") {
    return fetchLinkedInProfile(code);
  }
  throw new Error("OAUTH_PROVIDER_NOT_IMPLEMENTED");
}

async function ensureUserForOAuthProfile(
  provider: OAuthProvider,
  profile: OAuthProfile,
): Promise<SessionClaims> {
  const existing = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existing) {
    if (!existing.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          emailVerifiedAt: new Date(),
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
          authProvider: provider,
        },
      });
    }
    const memberships = await prisma.tenantMembership.findMany({
      where: { userId: existing.id },
    });
    const primary = memberships[0];
    return {
      userId: existing.id,
      role: primary?.role ?? Role.CUSTOMER,
      tenantId: primary?.tenantId ?? null,
      tenantIds: memberships.map((m) => m.tenantId),
    };
  }

  const registered = await registerUser({
    email: profile.email,
    password: randomBytes(24).toString("hex"),
    policyVersion: "oauth-v1",
    acceptTerms: true,
    authProvider: provider,
    emailVerified: true,
  });
  if (!registered.ok) {
    throw new Error(registered.code ?? "OAUTH_REGISTER_FAILED");
  }
  return registered.session;
}

export async function completeOAuthLogin(
  provider: OAuthProvider,
  code: string,
  state: string,
): Promise<{ token: string; returnUrl: string }> {
  const stateOk = await verifyOAuthState(state, provider);
  if (!stateOk) {
    throw new Error("OAUTH_STATE_INVALID");
  }

  const profile = await resolveProfile(provider, code);
  const session = await ensureUserForOAuthProfile(provider, profile);
  const token = await signSessionToken(session);
  const returnUrl = new URL("/login", publicAppUrl());
  returnUrl.searchParams.set("oauth", "success");
  return { token, returnUrl: returnUrl.toString() };
}
