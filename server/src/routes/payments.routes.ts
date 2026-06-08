import { Router } from "express";
import { z } from "zod";
import { withBodyValidation } from "../middleware/validation.js";
import { quoteInstallmentPlans } from "../payments/installment-plans-service.js";

export const paymentsRouter = Router();

const installmentPlansBodySchema = z.object({
  offerId: z.string().min(1).optional(),
  offer_id: z.string().min(1).optional(),
  amount: z.string().min(1).optional(),
  currency: z.string().length(3),
  geo: z.string().min(1),
});

paymentsRouter.post(
  "/installment-plans",
  withBodyValidation(installmentPlansBodySchema),
  async (req, res) => {
    const body = req.body as z.infer<typeof installmentPlansBodySchema>;
    const result = await quoteInstallmentPlans({
      offerId: body.offerId ?? body.offer_id,
      amount: body.amount,
      currency: body.currency,
      geo: body.geo,
    });

    if (result.plans.length === 0) {
      return res.json({
        offerId: result.offerId,
        amount: result.amount,
        currency: result.currency,
        geo: result.geo,
        disclaimerRef: result.disclaimerRef,
      });
    }

    return res.json({
      offerId: result.offerId,
      amount: result.amount,
      currency: result.currency,
      geo: result.geo,
      plans: result.plans,
      provider: result.provider,
      disclaimerRef: result.disclaimerRef,
    });
  },
);
