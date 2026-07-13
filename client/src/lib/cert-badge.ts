/** Shared SAFe certification badge images (client/public/assets/cert-badges/). */
export const CERT_BADGE_ASSETS = {
  agilist: "/assets/cert-badges/safe-agilist.png",
  ssm: "/assets/cert-badges/safe-ssm.png",
  popm: "/assets/cert-badges/safe-popm.png",
} as const;

export type CertBadgeKey = keyof typeof CERT_BADGE_ASSETS;

const HERO_GRADIENTS: Record<CertBadgeKey, string> = {
  agilist: "linear-gradient(135deg, #1e3a8a 0%, #0f766e 55%, #0d9488 100%)",
  ssm: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #312e81 100%)",
  popm: "linear-gradient(135deg, #0f766e 0%, #047857 50%, #065f46 100%)",
};

const DEFAULT_HERO =
  "linear-gradient(135deg, #1e3a8a 0%, #0f766e 55%, #0d9488 100%)";

/** Map offering code / tags to a shared badge asset. */
export function resolveCertBadge(offering: {
  code: string;
  roleTags?: string[];
  certificationName?: string;
}): { key: CertBadgeKey; src: string; heroGradient: string } {
  const code = offering.code.toLowerCase();
  const cert = (offering.certificationName ?? "").toLowerCase();
  const tags = (offering.roleTags ?? []).join(" ").toLowerCase();
  const haystack = `${code} ${cert} ${tags}`;

  if (
    haystack.includes("popm") ||
    haystack.includes("product owner") ||
    haystack.includes("product-owner") ||
    haystack.includes("product_manager")
  ) {
    return { key: "popm", src: CERT_BADGE_ASSETS.popm, heroGradient: HERO_GRADIENTS.popm };
  }
  if (
    haystack.includes("scrum master") ||
    haystack.includes("scrum-master") ||
    haystack.includes("ssm") ||
    (haystack.includes("scrum") && haystack.includes("safe"))
  ) {
    return { key: "ssm", src: CERT_BADGE_ASSETS.ssm, heroGradient: HERO_GRADIENTS.ssm };
  }
  if (
    haystack.includes("leading-safe") ||
    haystack.includes("leading safe") ||
    haystack.includes("agilist")
  ) {
    return { key: "agilist", src: CERT_BADGE_ASSETS.agilist, heroGradient: HERO_GRADIENTS.agilist };
  }

  return { key: "agilist", src: CERT_BADGE_ASSETS.agilist, heroGradient: DEFAULT_HERO };
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
