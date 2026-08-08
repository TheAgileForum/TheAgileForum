import { listOfferings, type OfferingMeta } from "../catalog/offerings.js";
import {
  quoteOfferingPrice,
  resolveCurrencyContext,
  type CurrencyContext,
} from "../pricing/pricing-service.js";
import {
  isScrumMasterPathway,
  normalizeRoleKey,
  parseYearsOfExperience,
  resolveSmSafeOfferingCode,
  SM_PATHWAY_BLOCKED_CODES,
} from "./sm-pathway.js";

export const upsellContexts = [
  "diagnosis",
  "dashboard",
  "cart",
  "detail",
  "post_webinar",
] as const;

export type UpsellContext = (typeof upsellContexts)[number];

/** Resume / LinkedIn upgrade SKU shown when resume match is below this threshold. */
export const RESUME_UPSELL_SCORE_THRESHOLD = 85;
export const POWER_RESUME_OFFER_CODE = "service-power-resume-cover-letter";

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
  /** Default cohort when schedule-bound offerings can be added directly (FR-157). */
  scheduleRef?: string | null;
  relevanceScore: number;
};

function normalizeRole(targetRole: string): string {
  return normalizeRoleKey(targetRole);
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
  /** Diagnosis results rail always links to offer detail (View), never quick-add. */
  forceView = false,
): UpsellSku {
  const quote = quoteOfferingPrice(offering, currencyContext);
  const canQuickAdd =
    !forceView &&
    offering.kind !== "service" &&
    (!offering.scheduleBound || Boolean(offering.upcomingBatchId));
  return {
    code: offering.code,
    title: offering.title,
    category: offering.category,
    kind: offering.kind,
    priceQuote: {
      amount: quote.amount,
      currency: quote.currency,
    },
    action: canQuickAdd ? "add" : "book",
    scheduleRef: offering.scheduleBound ? (offering.upcomingBatchId ?? null) : null,
    relevanceScore,
  };
}

function rankSkus(
  offerings: OfferingMeta[],
  targetRole: string,
  gapTags: string[],
  currencyContext: CurrencyContext,
  forceView = false,
): UpsellSku[] {
  return offerings
    .map((offering) => {
      const roleScore = matchesRole(offering, targetRole) ? 10 : 0;
      const gapScore = gapRelevanceScore(offering, gapTags);
      return serializeUpsellSku(
        offering,
        currencyContext,
        roleScore + gapScore,
        forceView,
      );
    })
    .filter((sku) => sku.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Role-based SAFe cert + mock interview upsell (FR-181).
 * When readinessScore &lt; 85, also recommend New Resume + LinkedIn Upgrade.
 *
 * Scrum Master pathway: deterministic filter — never POPM/RTE; exactly one SAFe
 * cert by YOE (&lt;12 → SAFe SM, ≥12 → Leading SAFe; unknown YOE → SAFe SM).
 */
export function getUpsellRecommendations(input: {
  targetRole: string;
  context: UpsellContext;
  offerId?: string;
  gapTags?: string[];
  currency?: string;
  geo?: string;
  /** Explicit total years of experience when known (diagnosis enrichment). */
  yearsOfExperience?: number | null;
  /** Free-text hints (currentStatus / resume snippet) used when YOE not numeric. */
  experienceHint?: string | null;
  /**
   * Resume match / readiness % from diagnosis. When set and &lt; 85, include
   * service-power-resume-cover-letter in the pathway rail. ≥ 85 skips resume upsell.
   */
  readinessScore?: number | null;
}) {
  const currencyContext = resolveCurrencyContext({
    geo: input.geo ?? "US",
    currencyOverride: input.currency,
  });
  const gapTags = input.gapTags ?? [];
  const offerings = listOfferings();
  const smPathway = isScrumMasterPathway(input.targetRole);

  let safeCertCandidates = offerings.filter(
    (o) =>
      o.category === "certification" &&
      o.certBody === "scaled agile" &&
      matchesRole(o, input.targetRole),
  );

  if (smPathway) {
    const yoe =
      typeof input.yearsOfExperience === "number" && Number.isFinite(input.yearsOfExperience)
        ? input.yearsOfExperience
        : parseYearsOfExperience(input.experienceHint);
    const preferredCode = resolveSmSafeOfferingCode(yoe);
    // Deterministic: exactly one SAFe cert; never POPM/RTE for SM.
    safeCertCandidates = offerings.filter(
      (o) => o.code === preferredCode && !SM_PATHWAY_BLOCKED_CODES.has(o.code),
    );
  }

  const mockInterviewCandidates = offerings.filter(
    (o) =>
      o.kind === "service" &&
      o.code.startsWith("service-mock-interview") &&
      matchesRole(o, input.targetRole),
  );

  const readinessScore =
    typeof input.readinessScore === "number" && Number.isFinite(input.readinessScore)
      ? input.readinessScore
      : null;
  const includeResumeUpsell =
    readinessScore !== null && readinessScore < RESUME_UPSELL_SCORE_THRESHOLD;
  const resumeCandidate = includeResumeUpsell
    ? offerings.find((o) => o.code === POWER_RESUME_OFFER_CODE)
    : undefined;

  // Diagnosis pathway rail: View (book) for SAFe + Mock (+ resume) — not Add to cart.
  const forceView = input.context === "diagnosis";

  const safeCertSkus = rankSkus(
    safeCertCandidates,
    input.targetRole,
    gapTags,
    currencyContext,
    forceView,
  );
  const mockInterviewSkus = rankSkus(
    mockInterviewCandidates,
    input.targetRole,
    gapTags,
    currencyContext,
    forceView,
  );

  // Score-gated resume upsell: always include when below threshold (View on diagnosis).
  const resumeSkus = resumeCandidate
    ? [serializeUpsellSku(resumeCandidate, currencyContext, 10, forceView)]
    : [];

  const rankedItems = [...safeCertSkus, ...mockInterviewSkus, ...resumeSkus]
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
    resumeSkus,
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
