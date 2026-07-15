/**
 * Cohort schedule labels are authored with a subset of timezones, e.g.
 *   "Batch 1 · 10:30 AM–12:00 PM IST / 10:00 PM–11:30 PM PST / 9:00–10:30 AM UAE"
 *
 * On the offer page we only want to surface the timing relevant to the country
 * selected in the header currency/geo dropdown:
 *  1. If the label already contains a timezone authored for that country, show
 *     that authored segment (keeps the exact copy the team wrote).
 *  2. Otherwise, convert the always-present IST anchor into the country's
 *     timezone so learners still see a single, local time window (e.g. UK → BST,
 *     Europe → CET) instead of a wall of conversions.
 *  3. If neither is possible, fall back to the full authored label so we never
 *     hide schedule information.
 *
 * The conversion offsets reflect the cohort season (the authored labels use the
 * same convention — e.g. "PST" carries the summer Pacific clock time). They are
 * derived from the IST anchor (Asia/Kolkata, UTC+5:30, no DST), so converting
 * back to the authored zones reproduces the authored clock times exactly.
 */

/** Authored timezone tokens (trailing word of a label segment) grouped by geo. */
const GEO_TIMEZONE_TOKENS: Record<string, string[]> = {
  IN: ["IST"],
  US: ["PST", "PDT", "PT", "EST", "EDT", "ET", "CST", "CDT", "CT", "MST", "MDT", "MT"],
  CA: ["EST", "EDT", "ET", "PST", "PDT", "PT", "CST", "CDT", "CT", "MST", "MDT", "MT"],
  GB: ["BST", "GMT"],
  NL: ["CET", "CEST"],
  AE: ["UAE", "GST"],
};

/** Target timezone (UTC offset in minutes + display abbreviation) per geo. */
const GEO_CONVERSION: Record<string, { offsetMinutes: number; abbrev: string }> = {
  IN: { offsetMinutes: 330, abbrev: "IST" },
  US: { offsetMinutes: -240, abbrev: "EST" },
  CA: { offsetMinutes: -240, abbrev: "EST" },
  GB: { offsetMinutes: 60, abbrev: "BST" },
  NL: { offsetMinutes: 120, abbrev: "CET" },
  AE: { offsetMinutes: 240, abbrev: "UAE" },
  NG: { offsetMinutes: 60, abbrev: "WAT" },
  AU: { offsetMinutes: 600, abbrev: "AEST" },
  ID: { offsetMinutes: 420, abbrev: "WIB" },
  SG: { offsetMinutes: 480, abbrev: "SGT" },
  BR: { offsetMinutes: -180, abbrev: "BRT" },
};

const PREFIX_SEPARATOR = "·";
const SEGMENT_SEPARATOR = "/";
const RANGE_DASH = "–";
/** IST anchor: Asia/Kolkata is UTC+5:30 year-round (no DST). */
const ANCHOR_TOKEN = "IST";
const ANCHOR_OFFSET_MIN = 330;
const MINUTES_PER_DAY = 1440;

/** Extract the trailing timezone token from a label segment, e.g. "…AM IST" → "IST". */
function segmentTimezoneToken(segment: string): string | null {
  const lastWord = segment.trim().split(/\s+/u).pop();
  if (!lastWord) return null;
  const cleaned = lastWord.replace(/[^A-Za-z]/gu, "").toUpperCase();
  return cleaned || null;
}

function mod(value: number, base: number): number {
  return ((value % base) + base) % base;
}

/** Parse "10:30 AM" / "9:00" → minutes since midnight (meridiem optional). */
function parseClock(token: string, fallbackMeridiem: "AM" | "PM" | null): number | null {
  const match = token.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/iu);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  const meridiem = (match[3]?.toUpperCase() as "AM" | "PM" | undefined) ?? fallbackMeridiem;
  if (meridiem) {
    hours %= 12;
    if (meridiem === "PM") hours += 12;
  }
  return hours * 60 + minutes;
}

/** Parse an anchor segment's "start–end" window into IST minutes since midnight. */
function parseAnchorRange(segment: string): { startMin: number; endMin: number } | null {
  const withoutToken = segment.trim().replace(/\s*[A-Za-z]+$/u, "").trim();
  const parts = withoutToken.split(/\s*[–-]\s*/u);
  if (parts.length !== 2) return null;
  const endMeridiem = (parts[1].match(/(AM|PM)/iu)?.[1]?.toUpperCase() as "AM" | "PM" | undefined) ?? null;
  const startMin = parseClock(parts[0], endMeridiem);
  const endMin = parseClock(parts[1], null);
  if (startMin === null || endMin === null) return null;
  return { startMin, endMin };
}

/** Format minutes since midnight as "6:00 AM". */
function formatClock(minutes: number): string {
  const total = mod(minutes, MINUTES_PER_DAY);
  const hours24 = Math.floor(total / 60);
  const mm = total % 60;
  const meridiem = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mm).padStart(2, "0")} ${meridiem}`;
}

/** Convert the IST anchor window into the target timezone's display segment. */
function convertAnchor(
  segments: string[],
  conversion: { offsetMinutes: number; abbrev: string },
): string | null {
  const anchor = segments.find((segment) => segmentTimezoneToken(segment) === ANCHOR_TOKEN);
  if (!anchor) return null;
  const range = parseAnchorRange(anchor);
  if (!range) return null;
  const startLocal = range.startMin - ANCHOR_OFFSET_MIN + conversion.offsetMinutes;
  const endLocal = range.endMin - ANCHOR_OFFSET_MIN + conversion.offsetMinutes;
  return `${formatClock(startLocal)}${RANGE_DASH}${formatClock(endLocal)} ${conversion.abbrev}`;
}

/**
 * Return the schedule label localized to `geo`: the authored timezone segment
 * when present, otherwise the IST anchor converted into the geo's timezone,
 * otherwise the full unmodified label.
 */
export function formatScheduleLabelForGeo(label: string, geo: string | undefined | null): string {
  if (!label) return label;
  const geoKey = geo ? geo.toUpperCase() : "";
  if (!geoKey) return label;

  const dotIndex = label.indexOf(PREFIX_SEPARATOR);
  if (dotIndex === -1) return label;

  const prefix = label.slice(0, dotIndex + PREFIX_SEPARATOR.length).trim();
  const rest = label.slice(dotIndex + PREFIX_SEPARATOR.length);
  const segments = rest
    .split(SEGMENT_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length <= 1) return label;

  const tokens = GEO_TIMEZONE_TOKENS[geoKey];
  if (tokens?.length) {
    const accepted = new Set(tokens);
    const matched = segments.filter((segment) => {
      const token = segmentTimezoneToken(segment);
      return token ? accepted.has(token) : false;
    });
    if (matched.length > 0) {
      return `${prefix} ${matched.join(` ${SEGMENT_SEPARATOR} `)}`;
    }
  }

  const conversion = GEO_CONVERSION[geoKey];
  if (conversion) {
    const converted = convertAnchor(segments, conversion);
    if (converted) return `${prefix} ${converted}`;
  }

  return label;
}
