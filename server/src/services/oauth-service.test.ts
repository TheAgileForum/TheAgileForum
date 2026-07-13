import { Role } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetEnvCache } from "../config/env.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    tenantMembership: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../db/client.js", () => ({
  prisma: prismaMock,
}));

import { buildOAuthStartUrl, completeOAuthLogin } from "./oauth-service.js";

function baseEnv(): void {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mybmadproj";
  process.env.JWT_SECRET = "test-jwt-secret-must-be-32-chars-min!!";
  process.env.API_PUBLIC_URL = "http://localhost:3001";
  process.env.APP_PUBLIC_URL = "http://localhost:5173";
  process.env.OAUTH_STUB_MODE = "true";
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.LINKEDIN_CLIENT_ID;
  delete process.env.LINKEDIN_CLIENT_SECRET;
  resetEnvCache();
}

describe("oauth-service", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    baseEnv();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.update.mockReset();
    prismaMock.tenantMembership.findMany.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("buildOAuthStartUrl", () => {
    it("uses linkedin stub callback when credentials are absent", async () => {
      const url = await buildOAuthStartUrl("linkedin");
      expect(url).toContain("/api/v1/auth/oauth/linkedin/callback");
      expect(url).toContain("code=dev-stub");
      expect(url).toContain("state=");
    });

    it("uses google stub when placeholder credentials are set in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.OAUTH_STUB_MODE = "false";
      process.env.GOOGLE_CLIENT_ID = "test";
      process.env.GOOGLE_CLIENT_SECRET = "test";
      resetEnvCache();

      const url = await buildOAuthStartUrl("google");

      expect(url).toContain("/api/v1/auth/oauth/google/callback");
      expect(url).toContain("code=dev-stub");
      expect(url).not.toContain("accounts.google.com");
    });

    it("uses localhost callback when staging URLs are set in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.API_PUBLIC_URL = "https://api.staging.theagileforum.com";
      process.env.APP_PUBLIC_URL = "https://app.staging.theagileforum.com";
      resetEnvCache();

      const url = await buildOAuthStartUrl("google");

      expect(url).toMatch(/^http:\/\/localhost:3001\/api\/v1\/auth\/oauth\/google\/callback\?/);
      expect(url).not.toContain("staging.theagileforum.com");
    });

    it("builds linkedin authorization URL when credentials are configured", async () => {
      process.env.OAUTH_STUB_MODE = "false";
      process.env.LINKEDIN_CLIENT_ID = "linkedin-client-id";
      process.env.LINKEDIN_CLIENT_SECRET = "linkedin-client-secret";
      resetEnvCache();

      const url = await buildOAuthStartUrl("linkedin");

      expect(url).toMatch(/^https:\/\/www\.linkedin\.com\/oauth\/v2\/authorization\?/);
      const parsed = new URL(url);
      expect(parsed.searchParams.get("client_id")).toBe("linkedin-client-id");
      expect(parsed.searchParams.get("response_type")).toBe("code");
      expect(parsed.searchParams.get("scope")).toBe("openid profile email");
      expect(parsed.searchParams.get("redirect_uri")).toBe(
        "http://localhost:3001/api/v1/auth/oauth/linkedin/callback",
      );
      expect(parsed.searchParams.get("state")).toBeTruthy();
    });
  });

  describe("completeOAuthLogin (linkedin live)", () => {
    it("exchanges code, loads profile, and issues session for existing user", async () => {
      process.env.OAUTH_STUB_MODE = "false";
      process.env.LINKEDIN_CLIENT_ID = "linkedin-client-id";
      process.env.LINKEDIN_CLIENT_SECRET = "linkedin-client-secret";
      resetEnvCache();

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "linkedin-access-token" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sub: "linkedin-sub-123",
            email: "learner@example.com",
            name: "Jane Learner",
            picture: "https://media.licdn.com/dms/image/example.jpg",
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "learner@example.com",
        emailVerifiedAt: new Date(),
      });
      prismaMock.user.update.mockResolvedValue({});
      prismaMock.tenantMembership.findMany.mockResolvedValue([
        { tenantId: "tenant-1", role: Role.CUSTOMER },
      ]);

      const startUrl = await buildOAuthStartUrl("linkedin");
      const state = new URL(startUrl).searchParams.get("state")!;

      const result = await completeOAuthLogin("linkedin", "auth-code-xyz", state);

      expect(result.token).toBeTruthy();
      expect(result.returnUrl).toContain("oauth=success");

      expect(fetchMock).toHaveBeenCalledTimes(3);
      const [tokenCall, profileCall, vanityCall] = fetchMock.mock.calls;
      expect(tokenCall[0]).toBe("https://www.linkedin.com/oauth/v2/accessToken");
      expect(String(tokenCall[1]?.body)).toContain("grant_type=authorization_code");
      expect(String(tokenCall[1]?.body)).toContain("code=auth-code-xyz");
      expect(profileCall[0]).toBe("https://api.linkedin.com/v2/userinfo");
      expect(profileCall[1]?.headers).toEqual({
        Authorization: "Bearer linkedin-access-token",
      });
      expect(vanityCall[0]).toBe("https://api.linkedin.com/v2/me?projection=(vanityName)");
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: expect.objectContaining({
          displayName: "Jane Learner",
          oauthSubject: "linkedin-sub-123",
          pictureUrl: "https://media.licdn.com/dms/image/example.jpg",
          authProvider: "linkedin",
        }),
      });
    });

    it("fails when linkedin token exchange returns an error", async () => {
      process.env.OAUTH_STUB_MODE = "false";
      process.env.LINKEDIN_CLIENT_ID = "linkedin-client-id";
      process.env.LINKEDIN_CLIENT_SECRET = "linkedin-client-secret";
      resetEnvCache();

      fetchMock.mockResolvedValueOnce({ ok: false, status: 400 });

      const startUrl = await buildOAuthStartUrl("linkedin");
      const state = new URL(startUrl).searchParams.get("state")!;

      await expect(completeOAuthLogin("linkedin", "bad-code", state)).rejects.toThrow(
        "OAUTH_TOKEN_EXCHANGE_FAILED",
      );
    });

    it("fails when linkedin profile is missing email", async () => {
      process.env.OAUTH_STUB_MODE = "false";
      process.env.LINKEDIN_CLIENT_ID = "linkedin-client-id";
      process.env.LINKEDIN_CLIENT_SECRET = "linkedin-client-secret";
      resetEnvCache();

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "linkedin-access-token" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sub: "linkedin-sub-123" }),
        });

      const startUrl = await buildOAuthStartUrl("linkedin");
      const state = new URL(startUrl).searchParams.get("state")!;

      await expect(completeOAuthLogin("linkedin", "auth-code-xyz", state)).rejects.toThrow(
        "OAUTH_PROFILE_FAILED",
      );
    });
  });
});
