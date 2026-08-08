import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  cart: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock("../db/client.js", () => ({
  prisma: prismaMock,
}));

vi.mock("../catalog/catalog-repository.js", () => ({
  getOfferingFromCatalog: vi.fn(),
}));

vi.mock("../catalog/offerings.js", () => ({
  getOffering: vi.fn(),
}));

vi.mock("../commerce/checkout-policy.js", () => ({
  validateAddToCartLine: vi.fn(),
}));

vi.mock("../pricing/pricing-service.js", () => ({
  parsePricingInputFromRequest: vi.fn(),
  quoteOfferingPrice: vi.fn(),
  resolveCartLineTotals: vi.fn(),
  resolveCurrencyContext: vi.fn(),
}));

vi.mock("../commerce/coupon-service.js", () => ({
  resolveCartCouponTotals: vi.fn(),
}));

describe("getOrCreateActiveCart", () => {
  beforeEach(() => {
    prismaMock.cart.findMany.mockReset();
    prismaMock.cart.findFirst.mockReset();
    prismaMock.cart.findUniqueOrThrow.mockReset();
    prismaMock.cart.updateMany.mockReset();
    prismaMock.cart.create.mockReset();
  });

  it("does not revive a cart that payment completed concurrently", async () => {
    prismaMock.cart.findMany.mockResolvedValue([]);
    prismaMock.cart.findFirst.mockResolvedValue({
      id: "cart-checkout",
      status: "checkout_in_progress",
    });
    // Payment won the race — status already completed, so reclaim is a no-op.
    prismaMock.cart.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.cart.create.mockResolvedValue({
      id: "cart-new",
      status: "active",
      items: [],
    });

    const { getOrCreateActiveCart } = await import("./cart-service.js");
    const cart = await getOrCreateActiveCart({
      userId: "user-1",
      tenantId: "tenant-1",
      tenantIds: ["tenant-1"],
      role: "CUSTOMER",
    });

    expect(prismaMock.cart.updateMany).toHaveBeenCalledWith({
      where: { id: "cart-checkout", status: "checkout_in_progress" },
      data: { status: "active" },
    });
    expect(prismaMock.cart.create).toHaveBeenCalled();
    expect(cart.id).toBe("cart-new");
    expect(cart.items).toEqual([]);
  });

  it("reclaims abandoned checkout_in_progress when still unpaid", async () => {
    prismaMock.cart.findMany.mockResolvedValue([]);
    prismaMock.cart.findFirst.mockResolvedValue({
      id: "cart-checkout",
      status: "checkout_in_progress",
    });
    prismaMock.cart.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.cart.findUniqueOrThrow.mockResolvedValue({
      id: "cart-checkout",
      status: "active",
      items: [{ id: "line-1", offeringCode: "course-x", quantity: 1 }],
    });

    const { getOrCreateActiveCart } = await import("./cart-service.js");
    const cart = await getOrCreateActiveCart({
      userId: "user-1",
      tenantId: "tenant-1",
      tenantIds: ["tenant-1"],
      role: "CUSTOMER",
    });

    expect(cart.id).toBe("cart-checkout");
    expect(cart.items).toHaveLength(1);
    expect(prismaMock.cart.create).not.toHaveBeenCalled();
  });
});
