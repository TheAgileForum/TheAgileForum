import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockApply = vi.fn();
const mockRemove = vi.fn();

vi.mock("../middleware/auth.js", () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.auth = {
      userId: "user-1",
      role: "CUSTOMER",
      tenantId: "00000000-0000-4000-8000-000000000001",
      tenantIds: ["00000000-0000-4000-8000-000000000001"],
    };
    next();
  },
}));

vi.mock("../commerce/coupon-service.js", () => ({
  applyCouponToCheckoutSession: (...args: unknown[]) => mockApply(...args),
  removeCouponFromCheckoutSession: (...args: unknown[]) => mockRemove(...args),
}));

import { commerceRouter } from "./commerce.routes.js";

function app() {
  const a = express();
  a.use(express.json());
  a.use("/api/v1/commerce", commerceRouter);
  return a;
}

describe("commerce routes — checkout coupon (FR-179)", () => {
  beforeEach(() => {
    mockApply.mockReset();
    mockRemove.mockReset();
  });

  it("POST /checkout/sessions/:id/coupon applies valid stub code", async () => {
    mockApply.mockResolvedValue({
      ok: true,
      coupon: {
        couponCode: "WELCOME10",
        discountApplied: "10.00",
        adjustedTotal: "90.00",
        currency: "USD",
        cart: { id: "cart-1", subtotal: "100.00", currency: "USD", items: [] },
      },
    });

    const res = await request(app())
      .post("/api/v1/commerce/checkout/sessions/cart-1/coupon")
      .send({ coupon_code: "WELCOME10" });

    expect(res.status).toBe(200);
    expect(res.body.discount_applied).toBe("10.00");
    expect(res.body.adjusted_total).toBe("90.00");
    expect(res.body.currency).toBe("USD");
    expect(res.body.couponCode).toBe("WELCOME10");
  });

  it("POST /checkout/sessions/:id/coupon rejects invalid code", async () => {
    mockApply.mockResolvedValue({
      ok: false,
      error: { code: "INVALID_COUPON", message: "Coupon code is not valid" },
    });

    const res = await request(app())
      .post("/api/v1/commerce/checkout/sessions/cart-1/coupon")
      .send({ coupon_code: "NOTREAL" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_COUPON");
  });

  it("DELETE /checkout/sessions/:id/coupon removes applied coupon", async () => {
    mockRemove.mockResolvedValue({
      ok: true,
      coupon: {
        couponCode: null,
        discountApplied: "0.00",
        adjustedTotal: "100.00",
        currency: "USD",
        cart: { id: "cart-1", subtotal: "100.00", currency: "USD", items: [] },
      },
    });

    const res = await request(app()).delete(
      "/api/v1/commerce/checkout/sessions/cart-1/coupon",
    );

    expect(res.status).toBe(200);
    expect(res.body.discount_applied).toBe("0.00");
    expect(res.body.adjusted_total).toBe("100.00");
    expect(res.body.couponCode).toBeNull();
  });
});
