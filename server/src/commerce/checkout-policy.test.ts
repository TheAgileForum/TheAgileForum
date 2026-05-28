import { describe, expect, it } from "vitest";
import {
  cartHasSafeOrgEligibleItem,
  validateAddToCartLine,
  validateExamAccess,
  validateOrgReimbursement,
} from "./checkout-policy.js";
import { getOffering } from "../catalog/offerings.js";

describe("checkout policy", () => {
  it("blocks schedule-bound offerings without scheduleRef (FR-157)", () => {
    const err = validateAddToCartLine({
      offeringCode: "course-agile-fundamentals",
    });
    expect(err?.code).toBe("SCHEDULE_REQUIRED");
  });

  it("allows schedule-bound offering with scheduleRef (FR-157)", () => {
    const err = validateAddToCartLine({
      offeringCode: "course-agile-fundamentals",
      scheduleRef: "cohort-2026-q3",
    });
    expect(err).toBeNull();
  });

  it("enforces paid exam access without entitlement (FR-85–87)", () => {
    const offering = getOffering("exam-mock-certification")!;
    const err = validateExamAccess(offering, { hasPaidEntitlement: false });
    expect(err?.code).toBe("EXAM_PAYMENT_REQUIRED");
  });

  it("allows free exam access policy", () => {
    const offering = getOffering("exam-practice-free")!;
    const err = validateExamAccess(offering, { hasPaidEntitlement: false });
    expect(err).toBeNull();
  });

  it("detects SAFe org-payment eligible carts (FR-152)", () => {
    expect(cartHasSafeOrgEligibleItem(["safe-leading-safe"])).toBe(true);
    expect(cartHasSafeOrgEligibleItem(["exam-practice-free"])).toBe(false);
  });

  it("validates org reimbursement contract (FR-153)", () => {
    const err = validateOrgReimbursement({
      organizationName: "Acme Corp",
      purchaseOrderNumber: "PO-123",
      billingContactEmail: "billing@acme.example",
    });
    expect(err).toBeNull();
  });
});
