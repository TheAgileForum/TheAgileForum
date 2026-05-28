import { publishEvent } from "../events/publisher.js";

export type EnrollmentLine = {
  offeringCode: string;
  title: string;
  quantity: number;
  unitPrice: string;
  currency: string;
};

export async function publishEnrollmentNotifications(input: {
  orderId: string;
  orderNumber: string;
  userId: string;
  tenantId: string | null;
  items: EnrollmentLine[];
}): Promise<void> {
  const basePayload = {
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    userId: input.userId,
    tenantId: input.tenantId,
    items: input.items,
  };

  await publishEvent({
    eventName: "enrollment.order_confirmed",
    source: "checkout-service",
    idempotencyKey: `enrollment:confirm:${input.orderId}`,
    payload: basePayload,
  });

  await publishEvent({
    eventName: "notification.enrollment_welcome",
    source: "checkout-service",
    idempotencyKey: `notification:welcome:${input.orderId}`,
    payload: {
      ...basePayload,
      channels: ["email"],
      template: "enrollment_welcome_v1",
    },
  });
}
