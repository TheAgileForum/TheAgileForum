import { test, expect } from "@playwright/test";

const emptyCart = {
  id: "00000000-0000-4000-8000-000000000099",
  status: "active",
  currency: "USD",
  subtotal: "0.00",
  lineCount: 0,
  items: [],
};

const sampleOffering = {
  code: "exam-practice-free",
  title: "Free Practice Exam",
  kind: "exam",
  category: "certification",
  scheduleBound: false,
  examAccess: "free",
  safeOrgPaymentEligible: false,
  defaultUnitPrice: "0.00",
  currency: "USD",
  roleTags: ["learner"],
  certBody: "scrum.org",
  deliveryMode: "self_paced",
};

function mockGuestApis(page: import("@playwright/test").Page, cartState: { current: typeof emptyCart }) {
  return Promise.all([
    page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Not signed in" } }),
      });
    }),
    page.route("**/api/v1/commerce/cart/guest", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({ cart: cartState.current }),
        });
        return;
      }
      await route.continue();
    }),
    page.route("**/api/v1/commerce/cart/merge", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ merged: false, cart: cartState.current }),
      });
    }),
  ]);
}

test.describe("Global cart badge (FR-177)", () => {
  test("shows cart affordance with zero count on forum home", async ({ page }) => {
    const cartState = { current: { ...emptyCart } };
    await mockGuestApis(page, cartState);
    await page.goto("/");
    const cartButton = page.getByTestId("global-cart-button");
    await expect(cartButton).toBeVisible();
    await expect(cartButton).toHaveAttribute("aria-label", "Cart, 0 items");
  });

  test("is hidden on login page (minimal auth flow)", async ({ page }) => {
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Not signed in" } }),
      });
    });
    await page.goto("/login");
    await expect(page.getByTestId("global-cart-button")).toHaveCount(0);
  });

  test("updates badge count after add-to-cart from catalog", async ({ page }) => {
    const cartState = { current: { ...emptyCart } };

    await mockGuestApis(page, cartState);

    await page.route("**/api/v1/catalog/certifications**", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          category: "certification",
          offerings: [sampleOffering],
          filters: {},
          facets: { roles: ["learner"], certBodies: ["scrum.org"], deliveryModes: ["self_paced"], priceRange: null, upcomingBatchCount: 0 },
        }),
      });
    });

    await page.route("**/api/v1/commerce/cart/guest/items", async (route) => {
      cartState.current = {
        ...emptyCart,
        subtotal: "0.00",
        lineCount: 1,
        items: [
          {
            id: "00000000-0000-4000-8000-000000000001",
            offeringCode: sampleOffering.code,
            scheduleRef: null,
            quantity: 1,
            unitPrice: "0.00",
            currency: "USD",
          },
        ],
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          item: {
            id: cartState.current.items[0].id,
            offeringCode: sampleOffering.code,
            scheduleRef: null,
          },
          commerceJourneyOrigin: null,
          cart: cartState.current,
        }),
      });
    });

    await page.goto("/certifications");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByTestId("global-cart-button")).toHaveAttribute(
      "aria-label",
      "Cart, 1 items",
    );
    await expect(page.locator(".MuiBadge-badge")).toHaveText("1");
  });
});
