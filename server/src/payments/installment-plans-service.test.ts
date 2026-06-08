import { describe, expect, it } from "vitest";
import { quoteInstallmentPlans } from "./installment-plans-service.js";

describe("installment plans service (FR-174)", () => {
  it("returns Razorpay EMI plans for India geo", async () => {
    const result = await quoteInstallmentPlans({
      offerId: "safe-leading-safe",
      currency: "INR",
      geo: "IN",
    });
    expect(result.currency).toBe("INR");
    expect(result.plans.length).toBeGreaterThan(0);
    expect(result.plans[0]?.provider).toBe("razorpay_emi");
    expect(result.provider).toBe("razorpay_emi");
    expect(result.disclaimerRef).toBe("gateway");
  });

  it("omits plans for Singapore geo (FR-169)", async () => {
    const result = await quoteInstallmentPlans({
      amount: "500.00",
      currency: "SGD",
      geo: "SG",
    });
    expect(result.plans).toEqual([]);
    expect(result.provider).toBeNull();
  });

  it("matches catalog quote monthly amount for same offer (FR-174 parity)", async () => {
    const byOffer = await quoteInstallmentPlans({
      offerId: "exam-mock-certification",
      currency: "INR",
      geo: "IN",
    });
    const byAmount = await quoteInstallmentPlans({
      amount: byOffer.amount,
      currency: "INR",
      geo: "IN",
    });
    expect(byAmount.plans[0]?.monthlyAmount).toBe(byOffer.plans[0]?.monthlyAmount);
  });
});
