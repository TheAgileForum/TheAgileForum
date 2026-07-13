import { describe, expect, it } from "vitest";
import {
  SAFE_ORG_REIMBURSEMENT_GST_RATE,
  computeSafeOrgReimbursementPricing,
} from "./safe-org-reimbursement-pricing.js";

describe("safe org reimbursement pricing", () => {
  it("applies 23% GST to subtotal", () => {
    const pricing = computeSafeOrgReimbursementPricing("33999.00");
    expect(SAFE_ORG_REIMBURSEMENT_GST_RATE).toBe(0.23);
    expect(pricing.subtotal).toBe("33999.00");
    expect(pricing.taxAmount).toBe("7819.77");
    expect(pricing.total).toBe("41818.77");
  });

  it("rounds tax and total to two decimal places", () => {
    const pricing = computeSafeOrgReimbursementPricing("100.00");
    expect(pricing.taxAmount).toBe("23.00");
    expect(pricing.total).toBe("123.00");
  });
});
