/**
 * Cohort schedule labels are authored with every supported timezone, e.g.
 *   "Batch 1 · 10:30 AM–12:00 PM IST / 10:00 PM–11:30 PM PST / 9:00–10:30 AM UAE"
 *
 * On the offer page we only want to surface the timing that matches the
 * country selected in the header currency/geo dropdown, so a learner sees a
 * single time window in their own timezone instead of a wall of conversions.
 */

/** Timezone tokens (the trailing word of each label segment) grouped by geo. */
const GEO_TIMEZONE_TOKENS: Record<string, string[]> = {
  IN: ["IST"],
  US: ["PST", "PDT", "PT", "EST", "EDT", "ET", "CST", "CDT", "CT", "MST", "MDT", "MT"],
  CA: ["EST", "EDT", "ET", "PST", "PDT", "PT", "CST", "CDT", "CT", "MST", "MDT", "MT"],
  GB: ["BST", "GMT"],
  NL: ["CET", "CEST"],
  AE: ["UAE", "GST"],
};

const SEGMENT_SEPARATOR = "/";
const PREFIX_SEPARATOR = "·";

/** Extract the trailing timezone token from a label segment, e.g. "…AM IST" → "IST". */
function segmentTimezoneToken(segment: string): string | null {
  const lastWord = segment.trim().split(/\s+/u).pop();
  if (!lastWord) return null;
  const cleaned = lastWord.replace(/[^A-Za-z]/gu, "").toUpperCase();
  return cleaned || null;
}

/**
 * Return the schedule label filtered to only the timezone segment(s) relevant
 * to `geo`. Falls back to the original label when the geo is unmapped, when the
 * label has no multi-timezone segments, or when no segment matches the geo — so
 * we never hide schedule information.
 */
export function formatScheduleLabelForGeo(label: string, geo: string | undefined | null): string {
  if (!label) return label;
  const tokens = geo ? GEO_TIMEZONE_TOKENS[geo.toUpperCase()] : undefined;
  if (!tokens || tokens.length === 0) return label;

  const dotIndex = label.indexOf(PREFIX_SEPARATOR);
  if (dotIndex === -1) return label;

  const prefix = label.slice(0, dotIndex + PREFIX_SEPARATOR.length).trim();
  const rest = label.slice(dotIndex + PREFIX_SEPARATOR.length);
  const segments = rest
    .split(SEGMENT_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length <= 1) return label;

  const accepted = new Set(tokens.map((token) => token.toUpperCase()));
  const matched = segments.filter((segment) => {
    const token = segmentTimezoneToken(segment);
    return token ? accepted.has(token) : false;
  });
  if (matched.length === 0) return label;

  return `${prefix} ${matched.join(` ${SEGMENT_SEPARATOR} `)}`;
}
