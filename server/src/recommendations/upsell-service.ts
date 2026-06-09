import { listOfferings, type OfferingMeta } from "../catalog/offerings.js";
import {
  quoteOfferingPrice,
  resolveCurrencyContext,
  type CurrencyContext,
} from "../pricing/pricing-service.js";

export const upsellContexts = [
  "diagnosis",
  "dashboard",
  "cart",
  "detail",
  "post_webinar",
] as const;

export type UpsellContext = (typeof upsellContexts)[number];

export type UpsellSku = {
  code: string;
  title: string;
  category: string;
  kind: string;
  priceQuote: {
    amount: string;
    currency: string;
  };
  action: "add" | "book";
  relevanceScore: number;
};

function normalizeRole(targetRole: string): string {
  return targetRole.trim().toLowerCase().replace(/\s+/g, "_");
}

function matchesRole(offering: OfferingMeta, targetRole: string): boolean {
  const normalized = normalizeRole(targetRole);
  return (
    offering.roleTags.includes(normalized) ||
    offering.roleTags.includes("learner")
  );
}

function gapRelevanceScore(offering: OfferingMeta, gapTags: string[]): number {
  if (gapTags.length === 0) return 0;
  let score = 0;
  const gapText = gapTags.join(" ").toLowerCase();

  if (
    offering.kind === "service" &&
    (gapText.includes("interview") ||
      gapText.includes("communication") ||
      gapText.includes("presentation"))
  ) {
    score += 8;
  }

  if (
    offering.category === "certification" &&
    (gapText.includes("cert") ||
      gapText.includes("safe") ||
      gapText.includes("credential"))
  ) {
    score += 8;
  }

  if (
    offering.category === "training" &&
    (gapText.includes("agile") ||
      gapText.includes("scrum") ||
      gapText.includes("fundamental"))
  ) {
    score += 4;
  }

  return score;
}

function serializeUpsellSku(
  offering: OfferingMeta,
  currencyContext: CurrencyContext,
  relevanceScore: number,
): UpsellSku {
  const quote = quoteOfferingPrice(offering, currencyContext);
  return {
    code: offering.code,
    title: offering.title,
    category: offering.category,
    kind: offering.kind,
    priceQuote: {
      amount: quote.amount,
      currency: quote.currency,
    },
    action: offering.kind === "service" ? "book" : "add",
    relevanceScore,
  };
}

function rankSkus(
  offerings: OfferingMeta[],
  targetRole: string,
  gapTags: string[],
  currencyContext: CurrencyContext,
): UpsellSku[] {
  return offerings
    .map((offering) => {
      const roleScore = matchesRole(offering, targetRole) ? 10 : 0;
      const gapScore = gapRelevanceScore(offering, gapTags);
      return serializeUpsellSku(offering, currencyContext, roleScore + gapScore);
    })
    .filter((sku) => sku.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/** Role-based SAFe cert + mock interview upsell (FR-181). */
export function getUpsellRecommendations(input: {
  targetRole: string;
  context: UpsellContext;
  offerId?: string;
  gapTags?: string[];
  currency?: string;
  geo?: string;
}) {
  const currencyContext = resolveCurrencyContext({
    geo: input.geo ?? "US",
    currencyOverride: input.currency,
  });
  const gapTags = input.gapTags ?? [];
  const offerings = listOfferings();

  const safeCertCandidates = offerings.filter(
    (o) =>
      o.category === "certification" &&
      o.certBody === "scaled agile" &&
      matchesRole(o, input.targetRole),
  );

  const mockInterviewCandidates = offerings.filter(
    (o) =>
      o.kind === "service" &&
      o.code.startsWith("service-mock-interview") &&
      matchesRole(o, input.targetRole),
  );

  const safeCertSkus = rankSkus(
    safeCertCandidates,
    input.targetRole,
    gapTags,
    currencyContext,
  );
  const mockInterviewSkus = rankSkus(
    mockInterviewCandidates,
    input.targetRole,
    gapTags,
    currencyContext,
  );

  const rankedItems = [...safeCertSkus, ...mockInterviewSkus]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 4);

  const primarySku = rankedItems[0] ?? null;

  return {
    targetRole: normalizeRole(input.targetRole),
    context: input.context,
    offerId: input.offerId ?? null,
    currencyContext: {
      currency: currencyContext.currency,
      geoDetected: currencyContext.geoDetected,
      source: currencyContext.source,
    },
    items: rankedItems,
    safeCertSkus,
    mockInterviewSkus,
    primaryCta: primarySku
      ? {
          label:
            primarySku.action === "book"
              ? `Book ${primarySku.title}`
              : `Explore ${primarySku.title}`,
          offeringCode: primarySku.code,
        }
      : null,
  };
}
