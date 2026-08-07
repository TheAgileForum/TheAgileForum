/**
 * Founder rules for Scrum Master pathway secondary (upsell) recommendations.
 *
 * - Never recommend POPM or RTE for SM pathways.
 * - Suggest ONE SAFe cert: SAFe Scrum Master if total YOE < 12;
 *   Leading SAFe (Agilist) if total YOE ≥ 12.
 * - When YOE is unknown, default to the <12 path (SAFe Scrum Master).
 */

export const SM_SAFE_SCRUM_MASTER_CODE = "safe-scrum-master-certification-training";
export const SM_LEADING_SAFE_CODE = "safe-leading-safe";

/** Blocked for SM pathway secondary recommendations (deterministic filter). */
export const SM_PATHWAY_BLOCKED_CODES = new Set([
  "safe-product-owner-product-manager-certification-training",
  "safe-rte-certification-training",
]);

/** YOE threshold: ≥ this → Leading SAFe; below → SAFe Scrum Master. */
export const SM_LEADING_SAFE_MIN_YOE = 12;

export function normalizeRoleKey(targetRole: string): string {
  return targetRole.trim().toLowerCase().replace(/\s+/g, "_");
}

/** True for Scrum Master / Agile PM diagnosis and catalog role keys. */
export function isScrumMasterPathway(targetRole: string): boolean {
  const n = normalizeRoleKey(targetRole);
  return (
    n === "scrum_master" ||
    n.includes("scrum_master") ||
    n.includes("agile_project_manager")
  );
}

/**
 * Parse total years of experience from free-text (intent currentStatus, resume extract).
 * Returns null when no credible total-YOE signal is found.
 */
export function parseYearsOfExperience(
  ...hints: Array<string | null | undefined>
): number | null {
  let best: number | null = null;

  for (const hint of hints) {
    if (!hint?.trim()) continue;
    const found = extractYoeCandidates(hint);
    for (const y of found) {
      if (best === null || y > best) best = y;
    }
  }

  return best;
}

function extractYoeCandidates(text: string): number[] {
  const candidates: number[] = [];
  const patterns: RegExp[] = [
    // "15+ years of IT/industry/professional experience"
    /(\d{1,2})\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:total\s+)?(?:it\s+|industry\s+|overall\s+|professional\s+)?experience\b/gi,
    // "total/overall experience: 14 years"
    /(?:total|overall|professional)\s+(?:it\s+|industry\s+)?experience[:\s]+(\d{1,2})\s*\+?\s*(?:years?|yrs?)\b/gi,
    // "over/more than 12 years of experience"
    /(?:over|more\s+than|above)\s+(\d{1,2})\s*\+?\s*(?:years?|yrs?)(?:\s+(?:of\s+)?experience)?\b/gi,
    // "YOE: 14" / "14 YOE"
    /\byoe[:\s]+(\d{1,2})\b/gi,
    /\b(\d{1,2})\s*\+?\s*yoe\b/gi,
    // "15 years experience" / "12 yrs exp" (no "of")
    /(\d{1,2})\s*\+?\s*(?:years?|yrs?)\s+exp(?:erience)?\b/gi,
    // Fallback: "with 15 years" near experience context in short status strings
    /(?:with|having)\s+(\d{1,2})\s*\+?\s*(?:years?|yrs?)\b/gi,
  ];

  for (const re of patterns) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const n = Number.parseInt(match[1] ?? "", 10);
      if (Number.isFinite(n) && n >= 1 && n <= 50) {
        candidates.push(n);
      }
    }
  }

  return candidates;
}

/**
 * Resolve the single SAFe cert code for an SM pathway.
 * Unknown YOE defaults to SAFe Scrum Master (&lt;12 path).
 */
export function resolveSmSafeOfferingCode(yearsOfExperience: number | null): string {
  if (yearsOfExperience != null && yearsOfExperience >= SM_LEADING_SAFE_MIN_YOE) {
    return SM_LEADING_SAFE_CODE;
  }
  return SM_SAFE_SCRUM_MASTER_CODE;
}
