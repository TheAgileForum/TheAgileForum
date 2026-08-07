import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  order: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
};

vi.mock("../db/client.js", () => ({
  prisma: prismaMock,
}));

vi.mock("../catalog/catalog-repository.js", () => ({
  getOfferingFromCatalog: vi.fn(async (code: string) => {
    if (code === "course-agile-fundamentals") {
      return {
        code,
        title: "Scrum Master Mentorship Masterclass",
        category: "training",
      };
    }
    return undefined;
  }),
}));

describe("order-query-service", () => {
  beforeEach(() => {
    prismaMock.order.findMany.mockReset();
    prismaMock.order.findFirst.mockReset();
  });

  it("lists orders newest-first with catalog titles", async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: "ord-1",
        orderNumber: "AF-1001",
        userId: "user-1",
        status: "paid",
        currency: "USD",
        totalAmount: { toFixed: () => "499.00" },
        createdAt: new Date("2026-08-01T10:00:00.000Z"),
        items: [
          {
            offeringCode: "course-agile-fundamentals",
            quantity: 1,
            unitPrice: { toFixed: () => "499.00" },
            currency: "USD",
          },
        ],
      },
    ]);

    const { listOrdersForUser } = await import("./order-query-service.js");
    const orders = await listOrdersForUser("user-1");

    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1", status: { not: "cancelled" } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    expect(orders).toHaveLength(1);
    expect(orders[0].orderNumber).toBe("AF-1001");
    expect(orders[0].items[0].title).toBe("Scrum Master Mentorship Masterclass");
    expect(orders[0].items[0].category).toBe("training");
  });

  it("returns null when order is missing or not owned", async () => {
    prismaMock.order.findFirst.mockResolvedValue(null);
    const { getOrderForUser } = await import("./order-query-service.js");
    await expect(getOrderForUser("user-1", "ord-missing")).resolves.toBeNull();
    expect(prismaMock.order.findFirst).toHaveBeenCalledWith({
      where: { id: "ord-missing", userId: "user-1" },
      include: { items: true },
    });
  });

  it("falls back to offering code when catalog miss", async () => {
    prismaMock.order.findFirst.mockResolvedValue({
      id: "ord-2",
      orderNumber: "AF-1002",
      userId: "user-1",
      status: "created",
      currency: "USD",
      totalAmount: { toFixed: () => "79.00" },
      createdAt: new Date("2026-08-02T10:00:00.000Z"),
      items: [
        {
          offeringCode: "unknown-sku",
          quantity: 1,
          unitPrice: { toFixed: () => "79.00" },
          currency: "USD",
        },
      ],
    });

    const { getOrderForUser } = await import("./order-query-service.js");
    const order = await getOrderForUser("user-1", "ord-2");
    expect(order?.items[0].title).toBe("unknown-sku");
    expect(order?.items[0].category).toBeUndefined();
  });
});
