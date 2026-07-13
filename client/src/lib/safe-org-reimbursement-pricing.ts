/** GST rate applied to SAFe org-reimbursement checkout subtotals (23%). */
export const SAFE_ORG_REIMBURSEMENT_GST_RATE = 0.23;

export type SafeOrgReimbursementPricing = {
  subtotal: string;
  taxAmount: string;
  total: string;
  taxRate: number;
};

function roundMoney(value: number): string {
  return value.toFixed(2);
}

export function computeSafeOrgReimbursementPricing(
  subtotal: string | number,
): SafeOrgReimbursementPricing {
  const base = typeof subtotal === "number" ? subtotal : Number(subtotal || "0");
  const taxAmount = Math.round(base * SAFE_ORG_REIMBURSEMENT_GST_RATE * 100) / 100;
  const total = Math.round((base + taxAmount) * 100) / 100;

  return {
    subtotal: roundMoney(base),
    taxAmount: roundMoney(taxAmount),
    total: roundMoney(total),
    taxRate: SAFE_ORG_REIMBURSEMENT_GST_RATE,
  };
}
