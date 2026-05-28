import { Router } from "express";
import { listOfferings } from "../catalog/offerings.js";

export const catalogRouter = Router();

catalogRouter.get("/offerings", (_req, res) => {
  const offerings = listOfferings().map((o) => ({
    code: o.code,
    title: o.title,
    kind: o.kind,
    scheduleBound: o.scheduleBound,
    examAccess: o.examAccess,
    safeOrgPaymentEligible: o.safeOrgPaymentEligible,
    defaultUnitPrice: o.defaultUnitPrice,
    currency: o.currency,
    roleTags: o.roleTags,
  }));
  return res.json({ offerings });
});
