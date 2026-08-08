import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  order: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  cart: {
    findFirst: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
};

const addCartItem = vi.fn();
const getOrCreateActiveCart = vi.fn();

vi.mock("../db/client.js", () => ({
  prisma: prismaMock,
}));

vi.mock("./cart-service.js", () => ({
  addCartItem: (...args: unknown[]) => addCartItem(...args),
  getOrCreateActiveCart: (...args: unknown[]) => getOrCreateActiveCart(...args),
}));

describe("order-lifecycle-service", () => {
  beforeEach(() => {
    prismaMock.order.findFirst.mockReset();
    prismaMock.order.update.mockReset();
    prismaMock.cart.findFirst.mockReset();
    prismaMock.cart.update.mockReset();
    prismaMock.cart.updateMany.mockReset();
    addCartItem.mockReset();
    getOrCreateActiveCart.mockReset();
  });

  it("cancels checkout_started orders owned by the user", async () => {
    prismaMock.order.findFirst.mockResolvedValue({
      id: "ord-1",
      userId: "user-1",
      status: "checkout_started",
      cartId: "cart-1",
    });
    prismaMock.order.update.mockResolvedValue({
      id: "ord-1",
      status: "cancelled",
    });
    prismaMock.cart.updateMany.mockResolvedValue({ count: 1 });

    const { cancelAbandonedOrder } = await import("./order-lifecycle-service.js");
    const result = await cancelAbandonedOrder("user-1", "ord-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.status).toBe("cancelled");
    }
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "ord-1" },
      data: { status: "cancelled" },
    });
    expect(prismaMock.cart.updateMany).toHaveBeenCalledWith({
      where: {
        id: "cart-1",
        userId: "user-1",
        status: "checkout_in_progress",
      },
      data: { status: "active" },
    });
  });

  it("refuses to cancel paid orders", async () => {
    prismaMock.order.findFirst.mockResolvedValue({
      id: "ord-paid",
      userId: "user-1",
      status: "paid",
      cartId: null,
    });

    const { cancelAbandonedOrder } = await import("./order-lifecycle-service.js");
    const result = await cancelAbandonedOrder("user-1", "ord-paid");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("ORDER_NOT_CANCELLABLE");
    }
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it("resumes checkout by reactivating the linked cart", async () => {
    prismaMock.order.findFirst.mockResolvedValue({
      id: "ord-1",
      userId: "user-1",
      status: "checkout_started",
      cartId: "cart-1",
      items: [{ offeringCode: "safe-agilist", quantity: 1 }],
    });
    prismaMock.cart.findFirst.mockResolvedValue({
      id: "cart-1",
      status: "checkout_in_progress",
      items: [{ id: "li-1", offeringCode: "safe-agilist" }],
    });
    prismaMock.cart.update.mockResolvedValue({ id: "cart-1", status: "active" });

    const { resumeAbandonedOrderCheckout } = await import("./order-lifecycle-service.js");
    const result = await resumeAbandonedOrderCheckout(
      { userId: "user-1", role: "CUSTOMER", tenantId: null, tenantIds: [] },
      "ord-1",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cartId).toBe("cart-1");
    }
    expect(prismaMock.cart.update).toHaveBeenCalledWith({
      where: { id: "cart-1" },
      data: { status: "active" },
    });
    expect(getOrCreateActiveCart).not.toHaveBeenCalled();
  });

  it("rebuilds cart lines when linked cart is missing", async () => {
    prismaMock.order.findFirst.mockResolvedValue({
      id: "ord-2",
      userId: "user-1",
      status: "checkout_started",
      cartId: null,
      items: [{ offeringCode: "safe-agilist", quantity: 1 }],
    });
    getOrCreateActiveCart.mockResolvedValue({
      id: "cart-new",
      items: [],
    });
    addCartItem.mockResolvedValue({ ok: true, cartId: "cart-new" });

    const { resumeAbandonedOrderCheckout } = await import("./order-lifecycle-service.js");
    const result = await resumeAbandonedOrderCheckout(
      { userId: "user-1", role: "CUSTOMER", tenantId: null, tenantIds: [] },
      "ord-2",
    );

    expect(result.ok).toBe(true);
    expect(addCartItem).toHaveBeenCalledWith(
      expect.anything(),
      { offeringCode: "safe-agilist", quantity: 1 },
      undefined,
    );
  });
});
