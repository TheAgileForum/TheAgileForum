import { expect, test } from "@playwright/test";

/**
 * E2E: India geo Razorpay stub checkout (no live keys required).
 * Requires API at localhost:3001 with seeded customer@demo.local / password123.
 */
test.describe("Razorpay stub checkout (FR-170)", () => {
  test.skip(
    !process.env.E2E_API_READY,
    "Set E2E_API_READY=1 with server running to execute commerce E2E",
  );

  test("stub redirect page confirms payment", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("customer@demo.local");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.goto("/checkout/razorpay/stub?order=ORD-E2E&ref=razorpay:order_stub_ord-e2e:stub_e2e", {
      state: {
        orderId: "00000000-0000-4000-8000-000000000099",
        orderNumber: "ORD-E2E",
        paymentMode: "full_pay",
      },
    });

    await expect(page.getByText(/Razorpay \(test mode\)/i)).toBeVisible();
  });
});
