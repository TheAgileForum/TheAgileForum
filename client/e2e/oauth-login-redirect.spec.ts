import { test, expect } from "@playwright/test";

const demoUser = {
  id: "user-oauth-1",
  email: "oauth-user@example.com",
  displayName: "OAuth User",
  pictureUrl: null,
  oauthProfileUrl: null,
  role: "CUSTOMER",
  tenantId: "tenant-1",
  tenantIds: ["tenant-1"],
  emailVerified: true,
};

test("login redirects after oauth=success when session is restored", async ({ page }) => {
  let meCalls = 0;
  await page.route("**/api/v1/auth/me", async (route) => {
    meCalls += 1;
    await route.fulfill({
      status: meCalls >= 1 ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify(
        meCalls >= 1
          ? { user: demoUser, requireEmailVerification: false }
          : { error: { code: "UNAUTHENTICATED", message: "Not signed in" } },
      ),
    });
  });

  await page.goto("/login?oauth=success");
  await expect(page).toHaveURL("/", { timeout: 10_000 });
});

test("login shows session error when oauth=success but /me stays unauthenticated", async ({ page }) => {
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Not signed in" } }),
    });
  });

  await page.goto("/login?oauth=success");
  await expect(page.getByRole("status")).toContainText("session could not be restored", {
    timeout: 10_000,
  });
  await expect(page).toHaveURL("/login");
});
