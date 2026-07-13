import { afterEach, describe, expect, it } from "vitest";
import {
  getClearCookieOptions,
  getCookieOptions,
  resolveAuthCookieDomain,
} from "./auth-service.js";
import { resetEnvCache } from "../config/env.js";

describe("resolveAuthCookieDomain", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
  });

  it("returns explicit AUTH_COOKIE_DOMAIN with leading dot", () => {
    process.env.AUTH_COOKIE_DOMAIN = "staging.theagileforum.com";
    expect(resolveAuthCookieDomain()).toBe(".staging.theagileforum.com");
  });

  it("derives parent domain from app and api staging hosts", () => {
    process.env.APP_PUBLIC_URL = "https://app.staging.theagileforum.com";
    process.env.API_PUBLIC_URL = "https://api.staging.theagileforum.com";
    expect(resolveAuthCookieDomain()).toBe(".staging.theagileforum.com");
  });

  it("derives parent domain from production app and api hosts", () => {
    process.env.APP_PUBLIC_URL = "https://app.theagileforum.com";
    process.env.API_PUBLIC_URL = "https://api.theagileforum.com";
    expect(resolveAuthCookieDomain()).toBe(".theagileforum.com");
  });

  it("returns undefined for same host or localhost", () => {
    process.env.APP_PUBLIC_URL = "http://localhost:5173";
    process.env.API_PUBLIC_URL = "http://localhost:3001";
    expect(resolveAuthCookieDomain()).toBeUndefined();
  });
});

describe("getCookieOptions", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
  });

  it("includes shared domain when app and api are sibling subdomains", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/db";
    process.env.JWT_SECRET = "x".repeat(32);
    process.env.APP_PUBLIC_URL = "https://app.staging.theagileforum.com";
    process.env.API_PUBLIC_URL = "https://api.staging.theagileforum.com";

    expect(getCookieOptions().domain).toBe(".staging.theagileforum.com");
    expect(getClearCookieOptions().domain).toBe(".staging.theagileforum.com");
  });
});
