import { Decimal } from "@prisma/client/runtime/library";

/** GST rate applied to SAFe org-reimbursement checkout subtotals (23%). */
export const SAFE_ORG_REIMBURSEMENT_GST_RATE = 0.23;

export type SafeOrgReimbursementPricing = {
  subtotal: string;
  taxAmount: string;
  total: string;
  taxRate: number;
};

function toMoney(value: Decimal): string {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
}

export function computeSafeOrgReimbursementPricing(
  subtotal: string | Decimal,
): SafeOrgReimbursementPricing {
  const base =
    subtotal instanceof Decimal ? subtotal : new Decimal(subtotal || "0");
  const taxAmount = base.mul(SAFE_ORG_REIMBURSEMENT_GST_RATE).toDecimalPlaces(
    2,
    Decimal.ROUND_HALF_UP,
  );
  const total = base.plus(taxAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    subtotal: toMoney(base),
    taxAmount: toMoney(taxAmount),
    total: toMoney(total),
    taxRate: SAFE_ORG_REIMBURSEMENT_GST_RATE,
  };
}
