/** Shared catalog card hero images (cert badges + service visuals). */
export const CERT_BADGE_ASSETS = {
  agilist: "/assets/cert-badges/safe-agilist.png",
  ssm: "/assets/cert-badges/safe-ssm.png",
  popm: "/assets/cert-badges/safe-popm.png",
  csm: "/assets/cert-badges/csm.svg",
  psmI: "/assets/cert-badges/psm-i.svg",
  psmIi: "/assets/cert-badges/psm-ii.svg",
  rte: "/assets/cert-badges/safe-rte.svg",
  mockInterview: "/assets/offers/mock-interview-series.png",
  powerResume: "/assets/offers/power-resume-cover.png",
} as const;

export type CertBadgeKey = keyof typeof CERT_BADGE_ASSETS;

/** How the asset should render in the catalog card hero. */
export type CardHeroVariant = "badge" | "cover";

const HERO_GRADIENTS: Record<CertBadgeKey, string> = {
  agilist: "linear-gradient(135deg, #1e3a8a 0%, #0f766e 55%, #0d9488 100%)",
  ssm: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #312e81 100%)",
  popm: "linear-gradient(135deg, #0f766e 0%, #047857 50%, #065f46 100%)",
  csm: "linear-gradient(135deg, #0b3d5c 0%, #0f766e 55%, #14b8a6 100%)",
  psmI: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0f766e 100%)",
  psmIi: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #0f766e 100%)",
  rte: "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #0f766e 100%)",
  mockInterview: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #0f766e 100%)",
  powerResume: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #0f766e 100%)",
};

const DEFAULT_HERO =
  "linear-gradient(135deg, #1e3a8a 0%, #0f766e 55%, #0d9488 100%)";

export type ResolvedCardHero = {
  key: CertBadgeKey;
  src: string;
  heroGradient: string;
  variant: CardHeroVariant;
};

function badgeResult(
  key: Exclude<CertBadgeKey, "mockInterview" | "powerResume">,
): ResolvedCardHero {
  return {
    key,
    src: CERT_BADGE_ASSETS[key],
    heroGradient: HERO_GRADIENTS[key],
    variant: "badge",
  };
}

function coverResult(key: "mockInterview" | "powerResume"): ResolvedCardHero {
  return {
    key,
    src: CERT_BADGE_ASSETS[key],
    heroGradient: HERO_GRADIENTS[key],
    variant: "cover",
  };
}

/** Map offering code / tags to a shared card hero asset. */
export function resolveCertBadge(offering: {
  code: string;
  roleTags?: string[];
  certificationName?: string;
}): ResolvedCardHero {
  const code = offering.code.toLowerCase();
  const cert = (offering.certificationName ?? "").toLowerCase();
  const tags = (offering.roleTags ?? []).join(" ").toLowerCase();
  const haystack = `${code} ${cert} ${tags}`;

  // Services first — role tags like scrum_master must not steal SAFe badges.
  if (
    code.includes("mock-interview") ||
    haystack.includes("mock interview") ||
    haystack.includes("mock-interview")
  ) {
    return coverResult("mockInterview");
  }

  if (
    code.includes("power-resume") ||
    code.includes("linkedin-upgrade") ||
    haystack.includes("power resume") ||
    haystack.includes("cover letter")
  ) {
    return coverResult("powerResume");
  }

  // CSM / PSM before generic "scrum master" → SSM (SAFe) badge.
  // PSM II before PSM I — "psm-ii" contains the substring "psm-i".
  if (
    code.includes("csm") ||
    haystack.includes("certified scrummaster") ||
    haystack.includes("certified scrum master") ||
    (haystack.includes("csm") && !haystack.includes("safe"))
  ) {
    return badgeResult("csm");
  }

  if (
    code.includes("psm-ii") ||
    code.includes("psmii") ||
    haystack.includes("psm ii") ||
    haystack.includes("psm-ii") ||
    haystack.includes("professional scrum master™ ii") ||
    haystack.includes("professional scrum master ii")
  ) {
    return badgeResult("psmIi");
  }

  if (
    code.includes("psm-i") ||
    code.includes("psmi") ||
    haystack.includes("psm i") ||
    haystack.includes("psm-i") ||
    haystack.includes("professional scrum master™ i") ||
    haystack.includes("professional scrum master i")
  ) {
    return badgeResult("psmI");
  }

  if (
    code.includes("rte") ||
    haystack.includes("release train engineer") ||
    haystack.includes("safe-rte")
  ) {
    return badgeResult("rte");
  }

  if (
    haystack.includes("popm") ||
    haystack.includes("product owner") ||
    haystack.includes("product-owner") ||
    haystack.includes("product_manager")
  ) {
    return badgeResult("popm");
  }
  if (
    haystack.includes("scrum master") ||
    haystack.includes("scrum-master") ||
    haystack.includes("ssm") ||
    (haystack.includes("scrum") && haystack.includes("safe"))
  ) {
    return badgeResult("ssm");
  }
  if (
    haystack.includes("leading-safe") ||
    haystack.includes("leading safe") ||
    haystack.includes("agilist")
  ) {
    return badgeResult("agilist");
  }

  return {
    key: "agilist",
    src: CERT_BADGE_ASSETS.agilist,
    heroGradient: DEFAULT_HERO,
    variant: "badge",
  };
}

/** Static social-proof defaults until catalog exposes enrollment metrics. */
export function catalogSocialProof(offering: { code: string }): {
  enrolledLabel: string;
  rating: string;
  avatars: Array<{ initials: string; bg: string }>;
} {
  const code = offering.code.toLowerCase();
  if (code.includes("leading-safe") || code.includes("agilist")) {
    return {
      enrolledLabel: "3K+ Enrolled",
      rating: "4.9/5",
      avatars: [
        { initials: "RK", bg: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
        { initials: "PS", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
        { initials: "AM", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  if (code.includes("csm")) {
    return {
      enrolledLabel: "2K+ Enrolled",
      rating: "4.9/5",
      avatars: [
        { initials: "RG", bg: "linear-gradient(135deg, #0f766e, #14b8a6)" },
        { initials: "SK", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
        { initials: "AP", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  if (
    (code.includes("psm-i") || code.includes("psmi")) &&
    !(code.includes("psm-ii") || code.includes("psmii"))
  ) {
    return {
      enrolledLabel: "1.8K+ Enrolled",
      rating: "4.9/5",
      avatars: [
        { initials: "NV", bg: "linear-gradient(135deg, #0284c7, #0ea5e9)" },
        { initials: "MK", bg: "linear-gradient(135deg, #0f766e, #14b8a6)" },
        { initials: "JS", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  if (code.includes("psm-ii") || code.includes("psmii")) {
    return {
      enrolledLabel: "1.1K+ Enrolled",
      rating: "4.9/5",
      avatars: [
        { initials: "DV", bg: "linear-gradient(135deg, #0c4a6e, #0e7490)" },
        { initials: "NK", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
        { initials: "SR", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  if (code.includes("rte")) {
    return {
      enrolledLabel: "900+ Enrolled",
      rating: "4.9/5",
      avatars: [
        { initials: "DV", bg: "linear-gradient(135deg, #1e3a8a, #312e81)" },
        { initials: "NK", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
        { initials: "ML", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  if (code.includes("mock-interview")) {
    return {
      enrolledLabel: "1.5K+ Enrolled",
      rating: "4.9/5",
      avatars: [
        { initials: "AR", bg: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
        { initials: "NK", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
        { initials: "VS", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  if (code.includes("power-resume") || code.includes("linkedin-upgrade")) {
    return {
      enrolledLabel: "1.2K+ Enrolled",
      rating: "4.9/5",
      avatars: [
        { initials: "PR", bg: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
        { initials: "SK", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
        { initials: "ML", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  if (code.includes("scrum-master") || code.includes("ssm")) {
    return {
      enrolledLabel: "1.2K+ Enrolled",
      rating: "4.8/5",
      avatars: [
        { initials: "SK", bg: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
        { initials: "NV", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
        { initials: "DT", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  if (code.includes("popm") || code.includes("product-owner")) {
    return {
      enrolledLabel: "890+ Enrolled",
      rating: "4.9/5",
      avatars: [
        { initials: "MJ", bg: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
        { initials: "AL", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
        { initials: "RP", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      ],
    };
  }
  return {
    enrolledLabel: "500+ Enrolled",
    rating: "4.8/5",
    avatars: [
      { initials: "AF", bg: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
      { initials: "JM", bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
      { initials: "TK", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
    ],
  };
}

export function isPopularOffering(code: string): boolean {
  return code.toLowerCase().includes("leading-safe");
}
