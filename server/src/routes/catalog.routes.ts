import { Router } from "express";
import { buildCatalogFacets } from "../catalog/facets.js";
import { filterOfferings, parseCatalogFilterQuery } from "../catalog/filter.js";
import {
  catalogListCacheKey,
  readCatalogListCache,
  writeCatalogListCache,
} from "../catalog/catalog-list-cache.js";
import {
  listOfferingsByCategoryFromCatalog,
  listOfferingsFromCatalog,
  getOfferingFromCatalog,
} from "../catalog/catalog-repository.js";
import {
  listCertificationCourses,
  listTrainingCourses,
  isPublicCatalogOffering,
} from "../catalog/catalog-seed-data.js";
import type { OfferingMeta, OfferingCategory } from "../catalog/offerings.js";
import {
  parsePricingInputFromRequest,
  quoteOfferingPrice,
  resolveCurrencyContext,
  type CurrencyContext,
} from "../pricing/pricing-service.js";

function serializeOffering(o: OfferingMeta, context: CurrencyContext) {
  const priceQuote = quoteOfferingPrice(o, context);
  return {
    code: o.code,
    title: o.title,
    kind: o.kind,
    category: o.category,
    scheduleBound: o.scheduleBound,
    examAccess: o.examAccess,
    safeOrgPaymentEligible: o.safeOrgPaymentEligible,
    defaultUnitPrice: o.defaultUnitPrice,
    currency: o.currency,
    roleTags: o.roleTags,
    certBody: o.certBody,
    deliveryMode: o.deliveryMode,
    upcomingBatchId: o.upcomingBatchId,
    slug: o.slug,
    certificationName: o.certificationName,
    summary: o.summary,
    durationHours: o.durationHours,
    durationLabel: o.durationLabel,
    scheduleLabel: o.scheduleLabel,
    cohortSchedules: o.cohortSchedules,
    includes: o.includes,
    learningOutcomes: o.learningOutcomes,
    priceQuote: {
      amount: priceQuote.amount,
      currency: priceQuote.currency,
      installmentPlans: priceQuote.installmentPlans,
    },
  };
}

function pricingEnvelope(req: import("express").Request) {
  const input = parsePricingInputFromRequest(req);
  const context = resolveCurrencyContext(input);
  return {
    context,
    currencyContext: {
      currency: context.currency,
      geoDetected: context.geoDetected,
      source: context.source,
    },
  };
}

export const catalogRouter = Router();

catalogRouter.get("/offerings", async (req, res) => {
  const { context, currencyContext } = pricingEnvelope(req);
  const query = parseCatalogFilterQuery(
    req.query as Record<string, string | undefined>,
  );
  const base = query.category
    ? await listOfferingsByCategoryFromCatalog(query.category)
    : await listOfferingsFromCatalog();
  const filtered = filterOfferings(base, query);
  const offerings = filtered.map((o) => serializeOffering(o, context));
  return res.json({
    offerings,
    filters: query,
    facets: buildCatalogFacets(filtered),
    currencyContext,
  });
});

catalogRouter.get("/offerings/:code", async (req, res) => {
  const { context, currencyContext } = pricingEnvelope(req);
  const offering = await getOfferingFromCatalog(req.params.code);
  if (!offering) {
    return res.status(404).json({
      error: { code: "OFFERING_NOT_FOUND", message: "Offering not found" },
    });
  }
  const priceQuote = quoteOfferingPrice(offering, context);
  return res.json({
    offering: serializeOffering(offering, context),
    scheduleRequired: offering.scheduleBound,
    priceQuote: {
      amount: priceQuote.amount,
      currency: priceQuote.currency,
      installmentPlans: priceQuote.installmentPlans,
    },
    currencyContext,
  });
});

function categoryListing(category: OfferingCategory) {
  return async (
    req: import("express").Request,
    res: import("express").Response,
  ) => {
    const cacheKey = catalogListCacheKey({
      category,
      ...(req.query as Record<string, string | undefined>),
    });
    const cached = readCatalogListCache<Record<string, unknown>>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const { context, currencyContext } = pricingEnvelope(req);
    const query = parseCatalogFilterQuery({
      ...(req.query as Record<string, string | undefined>),
      category,
    });
    let base = await listOfferingsByCategoryFromCatalog(category);
    // Browse pages: prefer stub details when DB is sparse/stale (same pattern as certifications).
    if (category === "certification") {
      const courses = base.filter((o) => o.kind === "course");
      const byCode = new Map(courses.map((o) => [o.code, o]));
      for (const stub of listCertificationCourses()) {
        const existing = byCode.get(stub.code);
        // Prefer stub when it carries live-site enrichment (summary) or row is missing.
        if (!existing || stub.summary) {
          byCode.set(stub.code, stub);
        }
      }
      base = [...byCode.values()];
    } else if (category === "training") {
      const courses = base.filter((o) => o.kind === "course");
      const byCode = new Map(courses.map((o) => [o.code, o]));
      for (const stub of listTrainingCourses()) {
        const existing = byCode.get(stub.code);
        if (!existing || stub.summary) {
          byCode.set(stub.code, stub);
        }
      }
      base = [...byCode.values()];
    }
    base = base.filter((o) => isPublicCatalogOffering(o.code));
    const filtered = filterOfferings(base, query);
    const offerings = filtered.map((o) => serializeOffering(o, context));
    const payload = {
      category,
      offerings,
      filters: query,
      facets: buildCatalogFacets(filtered),
      currencyContext,
    };
    writeCatalogListCache(cacheKey, payload);
    return res.json(payload);
  };
}

catalogRouter.get("/trainings", categoryListing("training"));
catalogRouter.get("/certifications", categoryListing("certification"));
catalogRouter.get("/services", categoryListing("service"));
