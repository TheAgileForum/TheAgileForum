import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireVerifiedEmail } from "../middleware/email-verification.js";
import { withBodyValidation } from "../middleware/validation.js";
import { getOffering } from "../catalog/offerings.js";
import { validateExamAccess } from "../commerce/checkout-policy.js";
import {
  addCartItem,
  getOrCreateActiveCart,
  serializeCart,
} from "../services/cart-service.js";
import { completeCheckout, startCheckout } from "../services/checkout-service.js";

export const commerceRouter = Router();

const addItemBody = z.object({
  offeringCode: z.string().min(1),
  scheduleRef: z.string().min(1).optional(),
  quantity: z.coerce.number().int().positive().optional(),
});

const checkoutStartBody = z.object({
  variant: z.enum(["standard", "org_reimbursement"]).default("standard"),
  orgReimbursement: z
    .object({
      organizationName: z.string().min(1),
      purchaseOrderNumber: z.string().min(1),
      billingContactEmail: z.string().email(),
    })
    .optional(),
});

const checkoutCompleteBody = z.object({
  orderId: z.string().uuid(),
  paymentRef: z.string().min(1).optional(),
});

commerceRouter.get("/cart", requireAuth, async (req, res) => {
  const cart = await getOrCreateActiveCart(req.auth!);
  return res.json({ cart: serializeCart(cart) });
});

commerceRouter.post(
  "/cart/items",
  requireAuth,
  withBodyValidation(addItemBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof addItemBody>;
    const result = await addCartItem(req.auth!, body);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    const cart = await getOrCreateActiveCart(req.auth!);
    return res.status(201).json({
      item: {
        id: result.item.id,
        offeringCode: result.item.offeringCode,
        scheduleRef: result.item.scheduleRef,
      },
      cart: serializeCart(cart),
    });
  },
);

commerceRouter.post(
  "/exam/access",
  requireAuth,
  withBodyValidation(z.object({ offeringCode: z.string().min(1) })),
  async (req, res) => {
    const { offeringCode } = req.body as { offeringCode: string };
    const offering = getOffering(offeringCode);
    if (!offering) {
      return res.status(404).json({
        error: { code: "UNKNOWN_OFFERING", message: "Offering not found" },
      });
    }

    const hasPaidEntitlement =
      offering.examAccess === "free" ||
      (await hasCompletedPaidOrder(req.auth!.userId, offeringCode));

    const policyError = validateExamAccess(offering, { hasPaidEntitlement });
    if (policyError) {
      return res.status(402).json({ error: policyError });
    }

    return res.json({
      access: {
        granted: true,
        offeringCode,
        examAccess: offering.examAccess,
      },
    });
  },
);

async function hasCompletedPaidOrder(
  userId: string,
  offeringCode: string,
): Promise<boolean> {
  const { prisma } = await import("../db/client.js");
  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: "paid",
      items: { some: { offeringCode } },
    },
  });
  return order !== null;
}

commerceRouter.post(
  "/checkout/start",
  requireAuth,
  requireVerifiedEmail,
  withBodyValidation(checkoutStartBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof checkoutStartBody>;
    const result = await startCheckout(req.auth!, body);
    if (!result.ok) {
      const status =
        result.error.code === "ORG_CHECKOUT_NOT_ELIGIBLE" ? 403 : 400;
      return res.status(status).json({ error: result.error });
    }
    return res.status(201).json(result.checkout);
  },
);

commerceRouter.post(
  "/checkout/complete",
  requireAuth,
  requireVerifiedEmail,
  withBodyValidation(checkoutCompleteBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof checkoutCompleteBody>;
    const result = await completeCheckout(req.auth!, body.orderId, body.paymentRef);
    if (!result.ok) {
      return res.status(404).json({ error: result.error });
    }
    return res.json({ order: result.order });
  },
);
