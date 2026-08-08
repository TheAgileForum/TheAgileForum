import type { Order, OrderItem } from "@prisma/client";
import { getOfferingFromCatalog } from "../catalog/catalog-repository.js";
import { prisma } from "../db/client.js";

export type LearnerOrderItemView = {
  offeringCode: string;
  title: string;
  category?: string;
  quantity: number;
  unitPrice: string;
  currency: string;
};

export type LearnerOrderView = {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  totalAmount: string;
  createdAt: string;
  items: LearnerOrderItemView[];
};

type OrderWithItems = Order & { items: OrderItem[] };

async function enrichItems(items: OrderItem[]): Promise<LearnerOrderItemView[]> {
  return Promise.all(
    items.map(async (item) => {
      const offering = await getOfferingFromCatalog(item.offeringCode);
      return {
        offeringCode: item.offeringCode,
        title: offering?.title ?? item.offeringCode,
        category: offering?.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        currency: item.currency,
      };
    }),
  );
}

export async function serializeLearnerOrder(
  order: OrderWithItems,
): Promise<LearnerOrderView> {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    totalAmount: order.totalAmount.toFixed(2),
    createdAt: order.createdAt.toISOString(),
    items: await enrichItems(order.items),
  };
}

export async function listOrdersForUser(userId: string): Promise<LearnerOrderView[]> {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      // Soft-deleted abandoned checkouts stay in DB but leave My Orders.
      status: { not: "cancelled" },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(orders.map((order) => serializeLearnerOrder(order)));
}

export async function getOrderForUser(
  userId: string,
  orderId: string,
): Promise<LearnerOrderView | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) return null;
  return serializeLearnerOrder(order);
}
