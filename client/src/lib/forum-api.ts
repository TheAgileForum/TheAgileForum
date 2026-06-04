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

export async function getAnalysisResult(runId: string) {
  return apiFetch<{
    readinessScore: number;
    insights: { strengths: string[]; gaps: string[]; confidence: number };
    primaryAction: PrimaryAction;
    rationale: Array<{ label: string; detail: string }>;
  }>(`/api/v1/diagnosis/runs/${runId}/result`);
}

export async function getJourneyState(subjectId: string) {
  return apiFetch<{
    currentFlow: string;
    currentStep: string;
    resumePayload: Record<string, unknown>;
    updatedAt: string;
  }>(`/api/v1/journey-state/${subjectId}`);
}

export type Offering = {
  code: string;
  title: string;
  kind: string;
  scheduleBound: boolean;
  safeOrgPaymentEligible: boolean;
  defaultUnitPrice: string;
  currency: string;
};

export type CartSummary = {
  id: string;
  status: string;
  currency: string;
  subtotal: string;
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

export type CheckoutStartResult = {
  orderId: string;
  orderNumber: string;
  variant: "standard" | "org_reimbursement";
  status: string;
  totalAmount: string;
  currency: string;
  cart: CartSummary;
  stripeCheckoutUrl?: string | null;
};

export async function getCart() {
  const res = await apiFetch<{ cart: CartSummary }>("/api/v1/commerce/cart");
  return res.cart;
}

export async function listOfferings() {
  const res = await apiFetch<{ offerings: Offering[] }>("/api/v1/catalog/offerings");
  return res.offerings;
}

export async function addToCart(offeringCode: string, scheduleRef?: string) {
  return apiFetch<{ item: { id: string; offeringCode: string; scheduleRef: string | null } }>(
    "/api/v1/commerce/cart/items",
    {
      method: "POST",
      body: JSON.stringify({ offeringCode, scheduleRef, quantity: 1 }),
    },
  );
}

export async function startCheckout(
  variant: "standard" | "org_reimbursement" = "standard",
  orgReimbursement?: OrgReimbursementInput,
) {
  return apiFetch<CheckoutStartResult>("/api/v1/commerce/checkout/start", {
    method: "POST",
    body: JSON.stringify({ variant, orgReimbursement }),
  });
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
