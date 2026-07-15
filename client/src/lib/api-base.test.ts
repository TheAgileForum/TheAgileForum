import { afterEach, describe, expect, it, vi } from "vitest";

describe("api-base getApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("uses Vite proxy on localhost", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.staging.theagileforum.com");
    vi.stubGlobal("window", {
      location: { hostname: "localhost", protocol: "http:" },
    });
    const { getApiBaseUrl } = await import("./api-base");
    expect(getApiBaseUrl()).toBe("");
  });

  it("maps staging app host to direct API", async () => {
    vi.stubEnv("VITE_API_URL", "");
    vi.stubGlobal("window", {
      location: { hostname: "app.staging.theagileforum.com", protocol: "https:" },
    });
    const { getApiBaseUrl, apiUrl } = await import("./api-base");
    expect(getApiBaseUrl()).toBe("https://api.staging.theagileforum.com");
    expect(apiUrl("/api/v1/catalog/trainings")).toBe(
      "https://api.staging.theagileforum.com/api/v1/catalog/trainings",
    );
  });

  it("prefers VITE_API_URL override on non-local hosts", async () => {
    vi.stubEnv("VITE_API_URL", "https://custom-api.example.com/");
    vi.stubGlobal("window", {
      location: { hostname: "preview.example.com", protocol: "https:" },
    });
    const { getApiBaseUrl } = await import("./api-base");
    expect(getApiBaseUrl()).toBe("https://custom-api.example.com");
  });
});
