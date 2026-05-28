import { getOffering, type OfferingMeta } from "../catalog/offerings.js";

export type CartLineInput = {
  offeringCode: string;
  scheduleRef?: string | null;
  quantity?: number;
};

export type CheckoutPolicyError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export function validateAddToCartLine(
  line: CartLineInput,
): CheckoutPolicyError | null {
  const offering = getOffering(line.offeringCode);
  if (!offering) {
    return {
      code: "UNKNOWN_OFFERING",
      message: `Offering ${line.offeringCode} is not in catalog`,
    };
  }

  if (offering.scheduleBound && !line.scheduleRef?.trim()) {
    return {
      code: "SCHEDULE_REQUIRED",
      message: "Schedule-bound offerings require scheduleRef",
      details: { offeringCode: line.offeringCode },
    };
  }

  const qty = line.quantity ?? 1;
  if (!Number.isInteger(qty) || qty < 1) {
    return {
      code: "INVALID_QUANTITY",
      message: "Quantity must be a positive integer",
    };
  }

  return null;
}

export function validateExamAccess(
  offering: OfferingMeta,
  options: { hasPaidEntitlement: boolean },
): CheckoutPolicyError | null {
  if (offering.examAccess === "paid" && !options.hasPaidEntitlement) {
    return {
      code: "EXAM_PAYMENT_REQUIRED",
      message: "Paid exam access requires checkout before use",
      details: { offeringCode: offering.code },
    };
  }
  return null;
}

export function cartHasSafeOrgEligibleItem(
  offeringCodes: string[],
): boolean {
  return offeringCodes.some((code) => getOffering(code)?.safeOrgPaymentEligible);
}

export type OrgReimbursementInput = {
  organizationName: string;
  purchaseOrderNumber: string;
  billingContactEmail: string;
};

export function validateOrgReimbursement(
  input: OrgReimbursementInput,
): CheckoutPolicyError | null {
  if (!input.organizationName.trim()) {
    return { code: "ORG_NAME_REQUIRED", message: "Organization name is required" };
  }
  if (!input.purchaseOrderNumber.trim()) {
    return {
      code: "PO_NUMBER_REQUIRED",
      message: "Purchase order number is required",
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.billingContactEmail)) {
    return {
      code: "INVALID_BILLING_EMAIL",
      message: "Billing contact email is invalid",
    };
  }
  return null;
}
