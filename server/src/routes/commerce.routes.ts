import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireVerifiedEmail } from "../middleware/email-verification.js";
import { withBodyValidation } from "../middleware/validation.js";
import { getOfferingFromCatalog } from "../catalog/catalog-repository.js";
import { validateExamAccess } from "../commerce/checkout-policy.js";
import { resolvePaymentModes } from "../commerce/payment-mode.js";
import {
  addCartItem,
  getOrCreateActiveCart,
  pricingInputFromRequest as authPricingInput,
  removeCartItem,
  serializeCart,
  updateCartItemQuantity,
} from "../services/cart-service.js";
import {
  addGuestCartItem,
  clearGuestCartCookie,
  ensureGuestSessionToken,
  getOrCreateGuestCart,
  mergeGuestCartIntoUserCart,
  pricingInputFromRequest as guestPricingInput,
  readGuestSessionToken,
  removeGuestCartItem,
  serializeGuestCart,
  updateGuestCartItemQuantity,
} from "../services/guest-cart-service.js";
import { commerceJourneyOriginSchema } from "../commerce/journey-origin.js";
import {
  completeCheckout,
  completeOrderFromRazorpayPayment,
  completeOrderFromStripePayment,
  getRazorpayCheckoutConfig,
  startCheckout,
} from "../services/checkout-service.js";
import {
  applyCouponToCheckoutSession,
  removeCouponFromCheckoutSession,
} from "../commerce/coupon-service.js";
import {
  trackCartUpdated,
  trackGlobalCartViewed,
} from "../observability/commerce-analytics.js";
import {
  detectGeoFromRequest,
  parsePricingInputFromRequest,
} from "../pricing/pricing-service.js";

export const commerceRouter = Router();

const addItemBody = z.object({
  offeringCode: z.string().min(1),
  scheduleRef: z.string().min(1).optional(),
  quantity: z.coerce.number().int().positive().optional(),
  commerceJourneyOrigin: commerceJourneyOriginSchema,
});

const paymentModeSchema = z.enum(["full_pay", "installment"]);
const installmentProviderSchema = z.enum([
  "razorpay_emi",
  "affirm",
  "klarna",
  "clearpay",
  "afterpay",
  "zip",
]);

const checkoutStartBody = z.object({
  variant: z.enum(["standard", "org_reimbursement"]).default("standard"),
  commerceJourneyOrigin: commerceJourneyOriginSchema,
  paymentMode: paymentModeSchema.optional(),
  installmentProvider: installmentProviderSchema.optional(),
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

const checkoutCouponBody = z.object({
  coupon_code: z.string().min(1),
});

commerceRouter.get("/payment-modes", (req, res) => {
  const geo =
    typeof req.query.geo === "string" && req.query.geo.trim()
      ? req.query.geo
      : detectGeoFromRequest(req);
  const modes = resolvePaymentModes(geo);
  return res.json({
    geo: geo.trim().toUpperCase(),
    ...modes,
  });
});

commerceRouter.get("/cart/guest", async (req, res) => {
  const sessionToken = ensureGuestSessionToken(
    res,
    readGuestSessionToken(req.cookies?.guest_cart_session),
  );
  const cart = await getOrCreateGuestCart(sessionToken);
  const pricingInput = guestPricingInput(req);
  const serialized = await serializeGuestCart(cart, pricingInput);
  void trackGlobalCartViewed({
    distinctId: sessionToken,
    lineCount: serialized.lineCount,
    guest: true,
    surface: "guest_cart_get",
  });
  return res.json({ cart: serialized });
});

commerceRouter.post(
  "/cart/guest/items",
  withBodyValidation(addItemBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof addItemBody>;
    const sessionToken = ensureGuestSessionToken(
      res,
      readGuestSessionToken(req.cookies?.guest_cart_session),
    );
    const pricingInput = guestPricingInput(req);
    const result = await addGuestCartItem(sessionToken, body, pricingInput);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    const cart = await getOrCreateGuestCart(sessionToken);
    const serialized = await serializeGuestCart(cart, pricingInput);
    void trackCartUpdated({
      distinctId: sessionToken,
      cartId: cart.id,
      cart: serialized,
      guest: true,
      commerceJourneyOrigin: body.commerceJourneyOrigin ?? null,
    });
    return res.status(201).json({
      item: {
        id: result.item.id,
        offeringCode: result.item.offeringCode,
        scheduleRef: result.item.scheduleRef,
      },
      commerceJourneyOrigin: body.commerceJourneyOrigin ?? null,
      cart: serialized,
    });
  },
);

commerceRouter.post("/cart/merge", requireAuth, async (req, res) => {
  const pricingInput = authPricingInput(req);
  const sessionToken = readGuestSessionToken(req.cookies?.guest_cart_session);
  if (!sessionToken) {
    const cart = await getOrCreateActiveCart(req.auth!);
    return res.json({
      merged: false,
      cart: await serializeCart(cart, pricingInput),
    });
  }

  const result = await mergeGuestCartIntoUserCart(
    sessionToken,
    req.auth!,
    pricingInput,
  );
  if (result.merged) {
    clearGuestCartCookie(res);
  }
  return res.json({
    merged: result.merged,
    guestCartId: result.guestCartId,
    cart: result.cart,
  });
});

commerceRouter.get("/cart", requireAuth, async (req, res) => {
  const cart = await getOrCreateActiveCart(req.auth!);
  const pricingInput = authPricingInput(req);
  return res.json({ cart: await serializeCart(cart, pricingInput) });
});

const updateQtyBody = z.object({
  quantity: z.coerce.number().int().min(0),
});

commerceRouter.delete("/cart/guest/items/:itemId", async (req, res) => {
  const sessionToken = ensureGuestSessionToken(
    res,
    readGuestSessionToken(req.cookies?.guest_cart_session),
  );
  const result = await removeGuestCartItem(sessionToken, req.params.itemId);
  if (!result.ok) {
    return res.status(404).json({ error: result.error });
  }
  const cart = await getOrCreateGuestCart(sessionToken);
  const pricingInput = guestPricingInput(req);
  return res.json({ cart: await serializeGuestCart(cart, pricingInput) });
});

commerceRouter.patch(
  "/cart/guest/items/:itemId",
  withBodyValidation(updateQtyBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof updateQtyBody>;
    const sessionToken = ensureGuestSessionToken(
      res,
      readGuestSessionToken(req.cookies?.guest_cart_session),
    );
    const result = await updateGuestCartItemQuantity(
      sessionToken,
      req.params.itemId,
      body.quantity,
    );
    if (!result.ok) {
      return res.status(404).json({ error: result.error });
    }
    const cart = await getOrCreateGuestCart(sessionToken);
    const pricingInput = guestPricingInput(req);
    return res.json({ cart: await serializeGuestCart(cart, pricingInput) });
  },
);

commerceRouter.delete("/cart/items/:itemId", requireAuth, async (req, res) => {
  const result = await removeCartItem(req.auth!, req.params.itemId);
  if (!result.ok) {
    return res.status(404).json({ error: result.error });
  }
  const cart = await getOrCreateActiveCart(req.auth!);
  const pricingInput = authPricingInput(req);
  return res.json({ cart: await serializeCart(cart, pricingInput) });
});

commerceRouter.patch(
  "/cart/items/:itemId",
  requireAuth,
  withBodyValidation(updateQtyBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof updateQtyBody>;
    const result = await updateCartItemQuantity(
      req.auth!,
      req.params.itemId,
      body.quantity,
    );
    if (!result.ok) {
      return res.status(404).json({ error: result.error });
    }
    const cart = await getOrCreateActiveCart(req.auth!);
    const pricingInput = authPricingInput(req);
    return res.json({ cart: await serializeCart(cart, pricingInput) });
  },
);

commerceRouter.post(
  "/cart/items",
  requireAuth,
  withBodyValidation(addItemBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof addItemBody>;
    const pricingInput = authPricingInput(req);
    const result = await addCartItem(req.auth!, body, pricingInput);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    const cart = await getOrCreateActiveCart(req.auth!);
    const serialized = await serializeCart(cart, pricingInput);
    void trackCartUpdated({
      distinctId: req.auth!.userId,
      cartId: cart.id,
      cart: serialized,
      guest: false,
      commerceJourneyOrigin: body.commerceJourneyOrigin ?? null,
    });
    return res.status(201).json({
      item: {
        id: result.item.id,
        offeringCode: result.item.offeringCode,
        scheduleRef: result.item.scheduleRef,
      },
      commerceJourneyOrigin: body.commerceJourneyOrigin ?? null,
      cart: serialized,
    });
  },
);

commerceRouter.post(
  "/exam/access",
  requireAuth,
  withBodyValidation(z.object({ offeringCode: z.string().min(1) })),
  async (req, res) => {
    const { offeringCode } = req.body as { offeringCode: string };
    const offering = await getOfferingFromCatalog(offeringCode);
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

const razorpayConfirmBody = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  paymentMode: paymentModeSchema.optional(),
});

const stripeConfirmBody = z.object({
  orderId: z.string().uuid(),
  stripeSessionId: z.string().min(1),
});

commerceRouter.get(
  "/razorpay/checkout-config/:orderId",
  requireAuth,
  async (req, res) => {
    const result = await getRazorpayCheckoutConfig(req.auth!, req.params.orderId);
    if (!result.ok) {
      const status = result.error.code === "ORDER_NOT_FOUND" ? 404 : 400;
      return res.status(status).json({ error: result.error });
    }
    return res.json({ config: result.config });
  },
);

commerceRouter.post(
  "/checkout/razorpay/confirm",
  requireAuth,
  requireVerifiedEmail,
  withBodyValidation(razorpayConfirmBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof razorpayConfirmBody>;
    const result = await completeOrderFromRazorpayPayment({
      auth: req.auth!,
      orderId: body.orderId,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
      paymentMode: body.paymentMode,
    });
    if (!result.ok) {
      const status =
        result.error.code === "ORDER_NOT_FOUND"
          ? 404
          : result.error.code === "RAZORPAY_SIGNATURE_INVALID"
            ? 400
            : 400;
      return res.status(status).json({ error: result.error });
    }
    return res.json({ order: result.order });
  },
);

commerceRouter.post(
  "/checkout/stripe/confirm",
  requireAuth,
  requireVerifiedEmail,
  withBodyValidation(stripeConfirmBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof stripeConfirmBody>;
    const result = await completeOrderFromStripePayment({
      auth: req.auth!,
      orderId: body.orderId,
      stripeSessionId: body.stripeSessionId,
    });
    if (!result.ok) {
      const status =
        result.error.code === "ORDER_NOT_FOUND"
          ? 404
          : result.error.code === "STRIPE_PAYMENT_INCOMPLETE"
            ? 402
            : 400;
      return res.status(status).json({ error: result.error });
    }
    return res.json({ order: result.order });
  },
);

commerceRouter.post(
  "/checkout/start",
  requireAuth,
  requireVerifiedEmail,
  withBodyValidation(checkoutStartBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof checkoutStartBody>;
    const result = await startCheckout(req.auth!, {
      ...body,
      pricingInput: parsePricingInputFromRequest(req),
    });
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

commerceRouter.post(
  "/checkout/sessions/:sessionId/coupon",
  requireAuth,
  withBodyValidation(checkoutCouponBody),
  async (req, res) => {
    const body = req.body as z.infer<typeof checkoutCouponBody>;
    const result = await applyCouponToCheckoutSession(
      req.auth!,
      req.params.sessionId,
      body.coupon_code,
      parsePricingInputFromRequest(req),
    );
    if (!result.ok) {
      const status =
        result.error.code === "CHECKOUT_SESSION_NOT_FOUND"
          ? 404
          : result.error.code === "INVALID_COUPON"
            ? 400
            : 400;
      return res.status(status).json({ error: result.error });
    }
    return res.json({
      couponCode: result.coupon.couponCode,
      discount_applied: result.coupon.discountApplied,
      adjusted_total: result.coupon.adjustedTotal,
      currency: result.coupon.currency,
      cart: result.coupon.cart,
    });
  },
);

commerceRouter.delete(
  "/checkout/sessions/:sessionId/coupon",
  requireAuth,
  async (req, res) => {
    const result = await removeCouponFromCheckoutSession(
      req.auth!,
      req.params.sessionId,
      parsePricingInputFromRequest(req),
    );
    if (!result.ok) {
      return res.status(404).json({ error: result.error });
    }
    return res.json({
      couponCode: null,
      discount_applied: result.coupon.discountApplied,
      adjusted_total: result.coupon.adjustedTotal,
      currency: result.coupon.currency,
      cart: result.coupon.cart,
    });
  },
);
