import { apiFetch } from "./api";

const SESSION_KEY = "af_diagnosis_session_id";

export function getStoredSessionId(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function storeSessionId(id: string) {
  sessionStorage.setItem(SESSION_KEY, id);
}

export function clearStoredSessionId() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function createDiagnosisSession(input?: {
  roleIntent?: string;
  campaignId?: string;
}) {
  return apiFetch<{ diagnosisSessionId: string; nextStep: string }>(
    "/api/v1/diagnosis/session",
    { method: "POST", body: JSON.stringify(input ?? {}) },
  );
}

export async function saveDiagnosisIntent(
  sessionId: string,
  body: {
    targetRole: string;
    timeline: string;
    currentStatus: string;
    consentAck: true;
    policyVersion?: string;
    roleIntent?: string;
  },
) {
  return apiFetch<{ saved: boolean; nextStep: string }>(
    `/api/v1/diagnosis/session/${sessionId}/intent`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function uploadResumeMetadata(
  sessionId: string,
  body: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksum?: string;
  },
) {
  return apiFetch<{ resumeAssetId: string; validationStatus: string }>(
    `/api/v1/diagnosis/session/${sessionId}/resume`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function saveJdInput(
  sessionId: string,
  body: { jdText?: string; jdUrl?: string; targetRole: string },
) {
  return apiFetch<{ saved: boolean; nextStep: string }>(
    `/api/v1/diagnosis/session/${sessionId}/jd`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function requestAnalysis(sessionId: string, runReason?: string) {
  return apiFetch<{ analysisRunId: string; status: string }>(
    `/api/v1/diagnosis/session/${sessionId}/analyze`,
    { method: "POST", body: JSON.stringify({ runReason }) },
  );
}

export async function getAnalysisStatus(runId: string) {
  return apiFetch<{
    status: string;
    stage: string | null;
    progressPct: number;
    errorMessage: string | null;
  }>(`/api/v1/diagnosis/runs/${runId}`);
}

export type PrimaryAction = {
  type: string;
  label: string;
  href: string;
  offeringCode?: string;
};

export type ConfidenceTier = "high" | "medium" | "low";

export type RoadmapMilestone = {
  phase: string;
  title: string;
  description: string;
  status: "current" | "upcoming" | "future";
};

export type SecondaryAction = {
  id: string;
  label: string;
  href: string;
  type: "micro_exam" | "webinar" | "mentor" | "support";
};

export type EscalationOptions = {
  title: string;
  message: string;
  mentorCtaLabel: string;
  mentorHref: string;
  supportHref: string;
};

export type AnalysisResult = {
  targetRole: string | null;
  readinessScore: number;
  summaryPlain: string;
  confidenceTier: ConfidenceTier;
  insights: { strengths: string[]; gaps: string[]; confidence: number };
  roadmapPreview: RoadmapMilestone[];
  recommendation: {
    primaryAction: PrimaryAction;
    rationale: Array<{ label: string; detail: string }>;
  };
  rationale: Array<{ label: string; detail: string }>;
  primaryAction: PrimaryAction;
  secondaryActions: SecondaryAction[];
  escalation: EscalationOptions | null;
};

export async function getAnalysisResult(runId: string) {
  return apiFetch<AnalysisResult>(`/api/v1/diagnosis/runs/${runId}/result`);
}

export async function getJourneyState(subjectId: string) {
  return apiFetch<{
    currentFlow: string;
    currentStep: string;
    resumePayload: Record<string, unknown>;
    updatedAt: string;
  }>(`/api/v1/journey-state/${subjectId}`);
}

export type CatalogOffering = {
  code: string;
  title: string;
  kind: string;
  category: "training" | "certification" | "service";
  scheduleBound: boolean;
  examAccess?: string;
  safeOrgPaymentEligible: boolean;
  defaultUnitPrice: string;
  currency: string;
  roleTags: string[];
  certBody?: string;
  deliveryMode: "live" | "self_paced";
  upcomingBatchId?: string;
  slug?: string;
  certificationName?: string;
  summary?: string;
  durationHours?: number;
  scheduleLabel?: string;
  includes?: string[];
  learningOutcomes?: string[];
  priceQuote?: {
    amount: string;
    currency: string;
    installmentPlans?: Array<{
      provider: string;
      monthlyAmount: string;
      currency: string;
    }>;
  };
};

export type CurrencyContextResponse = {
  currency: string;
  geoDetected: string;
  source: "geo" | "user";
  saved?: boolean;
};

export type PriceQuote = {
  offerId: string;
  amount: string;
  currency: string;
  installmentPlans?: Array<{
    provider: string;
    monthlyAmount: string;
    currency: string;
  }>;
};

export type UpsellItem = {
  code: string;
  title: string;
  category: string;
  kind: string;
  priceQuote: { amount: string; currency: string };
  action: "add" | "book";
  relevanceScore: number;
};

export type UpsellRecommendations = {
  targetRole: string;
  context: string;
  offerId: string | null;
  currencyContext: CurrencyContextResponse;
  items: UpsellItem[];
  safeCertSkus: UpsellItem[];
  mockInterviewSkus: UpsellItem[];
  primaryCta: { label: string; offeringCode: string } | null;
};

const DIAGNOSIS_ROLE_KEY = "af_diagnosis_target_role";
const DIAGNOSIS_GAPS_KEY = "af_diagnosis_gap_tags";

export function storeDiagnosisPersonalization(targetRole: string | null, gaps: string[]) {
  if (targetRole) sessionStorage.setItem(DIAGNOSIS_ROLE_KEY, targetRole);
  if (gaps.length) sessionStorage.setItem(DIAGNOSIS_GAPS_KEY, gaps.join(","));
}

export function getStoredDiagnosisTargetRole(): string | null {
  return sessionStorage.getItem(DIAGNOSIS_ROLE_KEY);
}

export function getStoredDiagnosisGapTags(): string[] {
  const raw = sessionStorage.getItem(DIAGNOSIS_GAPS_KEY);
  return raw ? raw.split(",").map((t) => t.trim()).filter(Boolean) : [];
}

function pricingQuery(geo?: string, currency?: string): string {
  const params = new URLSearchParams();
  if (geo) params.set("geo", geo);
  if (currency) params.set("currency_override", currency);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getCurrencyContext(geo?: string, currencyOverride?: string) {
  return apiFetch<CurrencyContextResponse>(
    `/api/v1/pricing/currency-context${pricingQuery(geo, currencyOverride)}`,
  );
}

export async function postSessionCurrency(currency: string, geo?: string) {
  return apiFetch<CurrencyContextResponse>("/api/v1/pricing/session-currency", {
    method: "POST",
    body: JSON.stringify({ currency, geo }),
  });
}

export async function postPricingQuote(body: {
  offerIds: string[];
  currency: string;
  geo: string;
}) {
  return apiFetch<{ quotes: PriceQuote[]; currency: string }>("/api/v1/pricing/quote", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getUpsellRecommendations(params: {
  targetRole: string;
  context: "diagnosis" | "dashboard" | "cart" | "detail" | "post_webinar";
  offerId?: string;
  gapTags?: string[];
  geo?: string;
  currency?: string;
}) {
  const qs = new URLSearchParams({
    target_role: params.targetRole,
    context: params.context,
  });
  if (params.offerId) qs.set("offer_id", params.offerId);
  if (params.gapTags?.length) qs.set("gap_tags", params.gapTags.join(","));
  if (params.geo) qs.set("geo", params.geo);
  if (params.currency) qs.set("currency_override", params.currency);
  return apiFetch<UpsellRecommendations>(`/api/v1/recommendations/upsell?${qs.toString()}`);
}

export type Offering = CatalogOffering;

export type CartSummary = {
  id: string;
  status: string;
  currency: string;
  subtotal: string;
  lineCount?: number;
  couponCode?: string;
  discountApplied?: string;
  adjustedTotal?: string;
  items: Array<{
    id: string;
    offeringCode: string;
    scheduleRef: string | null;
    quantity: number;
    unitPrice: string;
    currency: string;
  }>;
};

export type OrgReimbursementInput = {
  organizationName: string;
  purchaseOrderNumber: string;
  billingContactEmail: string;
};

export type PaymentMode = "full_pay" | "installment";

export type InstallmentProvider =
  | "razorpay_emi"
  | "affirm"
  | "klarna"
  | "clearpay"
  | "afterpay"
  | "zip";

export type PaymentModesResponse = {
  geo: string;
  countryGroup: string;
  availableModes: PaymentMode[];
  fullPayProvider: "stripe" | "razorpay";
  installmentProviders: InstallmentProvider[];
  localPaymentMethods: Array<"upi" | "paynow" | "cards">;
  disclaimerSource: "gateway";
};

export type PaymentProvider = "stripe" | "razorpay";

export type RazorpayCheckoutConfig = {
  mode: "stub" | "live";
  keyId?: string;
  amountMinor?: number;
  currency: string;
  providerOrderId: string;
};

export type CheckoutStartResult = {
  orderId: string;
  orderNumber: string;
  variant: "standard" | "org_reimbursement";
  status: string;
  totalAmount: string;
  currency: string;
  cart: CartSummary;
  stripeCheckoutUrl?: string | null;
  stripePaymentRef?: string | null;
  stripeCheckout?: {
    mode: "live";
    sessionId: string;
    checkoutUrl: string;
  };
  razorpayCheckoutUrl?: string | null;
  razorpayPaymentRef?: string | null;
  razorpayCheckout?: RazorpayCheckoutConfig;
  razorpayEmiPlans?: Array<{
    provider: string;
    monthlyAmount: string;
    currency: string;
  }>;
  paymentProvider?: PaymentProvider | null;
  paymentMode?: PaymentMode;
  installmentProvider?: InstallmentProvider | null;
};

export type PricingRequest = {
  geo?: string;
  currency?: string;
};

export type InstallmentPlanQuote = {
  provider: string;
  monthlyAmount: string;
  currency: string;
  termMonths: number;
};

export type InstallmentPlansResponse = {
  offerId?: string | null;
  amount: string;
  currency: string;
  geo: string;
  plans?: InstallmentPlanQuote[];
  provider?: string | null;
  disclaimerRef: "gateway";
};

export async function getPaymentModes(geo?: string) {
  const qs = geo ? `?geo=${encodeURIComponent(geo)}` : "";
  return apiFetch<PaymentModesResponse>(`/api/v1/commerce/payment-modes${qs}`);
}

export async function postInstallmentPlans(body: {
  offerId?: string;
  amount?: string;
  currency: string;
  geo: string;
}) {
  return apiFetch<InstallmentPlansResponse>("/api/v1/payments/installment-plans", {
    method: "POST",
    body: JSON.stringify({
      offer_id: body.offerId,
      amount: body.amount,
      currency: body.currency,
      geo: body.geo,
    }),
  });
}

export async function getCart(pricing?: PricingRequest) {
  const res = await apiFetch<{ cart: CartSummary }>(
    `/api/v1/commerce/cart${pricingQuery(pricing?.geo, pricing?.currency)}`,
  );
  return res.cart;
}

export async function listOfferings() {
  const res = await apiFetch<{ offerings: Offering[] }>("/api/v1/catalog/offerings");
  return res.offerings;
}

export type CatalogFacets = {
  roles: string[];
  certBodies: string[];
  deliveryModes: string[];
  priceRange: { min: number; max: number } | null;
  upcomingBatchCount: number;
};

export type CatalogListResponse = {
  category?: string;
  offerings: CatalogOffering[];
  filters: Record<string, unknown>;
  facets?: CatalogFacets;
  currencyContext?: CurrencyContextResponse;
};

export async function getOfferingDetail(code: string, geo?: string, currency?: string) {
  return apiFetch<{
    offering: CatalogOffering;
    priceQuote: { amount: string; currency: string; installmentPlans?: PriceQuote["installmentPlans"] };
    currencyContext: CurrencyContextResponse;
  }>(`/api/v1/catalog/offerings/${encodeURIComponent(code)}${pricingQuery(geo, currency)}`);
}

export async function listCatalogCategory(
  path: "trainings" | "certifications" | "services",
  query = "",
  pricing?: { geo?: string; currency?: string },
) {
  const base = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  const pricingQs = pricingQuery(pricing?.geo, pricing?.currency);
  const join = base && pricingQs ? `${base}&${pricingQs.slice(1)}` : base || pricingQs;
  return apiFetch<CatalogListResponse>(`/api/v1/catalog/${path}${join}`);
}

export async function getGuestCart(pricing?: PricingRequest) {
  const res = await apiFetch<{ cart: CartSummary }>(
    `/api/v1/commerce/cart/guest${pricingQuery(pricing?.geo, pricing?.currency)}`,
  );
  return res.cart;
}

export async function addGuestCartItem(
  offeringCode: string,
  scheduleRef?: string,
  pricing?: PricingRequest,
) {
  return apiFetch<{ item: { id: string; offeringCode: string; scheduleRef: string | null }; cart: CartSummary }>(
    `/api/v1/commerce/cart/guest/items${pricingQuery(pricing?.geo, pricing?.currency)}`,
    {
      method: "POST",
      body: JSON.stringify({ offeringCode, scheduleRef, quantity: 1 }),
    },
  );
}

export async function mergeGuestCart(pricing?: PricingRequest) {
  return apiFetch<{ merged: boolean; cart: CartSummary }>(
    `/api/v1/commerce/cart/merge${pricingQuery(pricing?.geo, pricing?.currency)}`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}

export async function addToCart(
  offeringCode: string,
  scheduleRef?: string,
  pricing?: PricingRequest,
) {
  return apiFetch<{ item: { id: string; offeringCode: string; scheduleRef: string | null }; cart: CartSummary }>(
    `/api/v1/commerce/cart/items${pricingQuery(pricing?.geo, pricing?.currency)}`,
    {
      method: "POST",
      body: JSON.stringify({ offeringCode, scheduleRef, quantity: 1 }),
    },
  );
}

export async function removeGuestCartItem(itemId: string, pricing?: PricingRequest) {
  return apiFetch<{ cart: CartSummary }>(
    `/api/v1/commerce/cart/guest/items/${itemId}${pricingQuery(pricing?.geo, pricing?.currency)}`,
    { method: "DELETE" },
  );
}

export async function updateGuestCartItemQuantity(
  itemId: string,
  quantity: number,
  pricing?: PricingRequest,
) {
  return apiFetch<{ cart: CartSummary }>(
    `/api/v1/commerce/cart/guest/items/${itemId}${pricingQuery(pricing?.geo, pricing?.currency)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
  );
}

export async function removeCartItem(itemId: string, pricing?: PricingRequest) {
  return apiFetch<{ cart: CartSummary }>(
    `/api/v1/commerce/cart/items/${itemId}${pricingQuery(pricing?.geo, pricing?.currency)}`,
    { method: "DELETE" },
  );
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
  pricing?: PricingRequest,
) {
  return apiFetch<{ cart: CartSummary }>(
    `/api/v1/commerce/cart/items/${itemId}${pricingQuery(pricing?.geo, pricing?.currency)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
  );
}

export type CheckoutCouponResult = {
  couponCode: string | null;
  discount_applied: string;
  adjusted_total: string;
  currency: string;
  cart: CartSummary;
};

export async function applyCheckoutCoupon(
  sessionId: string,
  couponCode: string,
  pricing?: PricingRequest,
) {
  return apiFetch<CheckoutCouponResult>(
    `/api/v1/commerce/checkout/sessions/${encodeURIComponent(sessionId)}/coupon${pricingQuery(pricing?.geo, pricing?.currency)}`,
    {
      method: "POST",
      body: JSON.stringify({ coupon_code: couponCode }),
    },
  );
}

export async function removeCheckoutCoupon(sessionId: string, pricing?: PricingRequest) {
  return apiFetch<CheckoutCouponResult>(
    `/api/v1/commerce/checkout/sessions/${encodeURIComponent(sessionId)}/coupon${pricingQuery(pricing?.geo, pricing?.currency)}`,
    { method: "DELETE" },
  );
}

export async function startCheckout(
  variant: "standard" | "org_reimbursement" = "standard",
  options?: {
    orgReimbursement?: OrgReimbursementInput;
    paymentMode?: PaymentMode;
    installmentProvider?: InstallmentProvider;
    commerceJourneyOrigin?: string;
    pricing?: PricingRequest;
  },
) {
  const pricingQs = pricingQuery(options?.pricing?.geo, options?.pricing?.currency);
  return apiFetch<CheckoutStartResult>(
    `/api/v1/commerce/checkout/start${pricingQs}`,
    {
      method: "POST",
      body: JSON.stringify({
        variant,
        orgReimbursement: options?.orgReimbursement,
        paymentMode: options?.paymentMode,
        installmentProvider: options?.installmentProvider,
        commerceJourneyOrigin: options?.commerceJourneyOrigin,
      }),
    },
  );
}

export async function getRazorpayCheckoutConfig(orderId: string) {
  const res = await apiFetch<{
    config: RazorpayCheckoutConfig & { orderNumber: string };
  }>(`/api/v1/commerce/razorpay/checkout-config/${orderId}`);
  return res.config;
}

export async function confirmRazorpayCheckout(input: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMode?: PaymentMode;
}) {
  return apiFetch<{ order: { id: string; orderNumber: string; status: string; paymentRef?: string } }>(
    "/api/v1/commerce/checkout/razorpay/confirm",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function confirmStripeCheckout(input: {
  orderId: string;
  stripeSessionId: string;
}) {
  return apiFetch<{ order: { id: string; orderNumber: string; status: string; paymentRef?: string } }>(
    "/api/v1/commerce/checkout/stripe/confirm",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function completeCheckout(orderId: string, paymentRef?: string) {
  return apiFetch<{ order: { id: string; orderNumber: string; status: string; paymentRef?: string } }>(
    "/api/v1/commerce/checkout/complete",
    {
      method: "POST",
      body: JSON.stringify({ orderId, paymentRef: paymentRef ?? "stub-payment" }),
    },
  );
}
