export type CommerceJourneyOrigin = "catalog" | "guided_path" | "diagnosis" | "dashboard" | "unknown";

const KEY = "af_commerce_journey_origin";

export function setCommerceJourneyOrigin(origin: CommerceJourneyOrigin) {
  sessionStorage.setItem(KEY, origin);
}

export function getCommerceJourneyOrigin(): CommerceJourneyOrigin {
  const v = sessionStorage.getItem(KEY);
  if (v === "catalog" || v === "guided_path" || v === "diagnosis" || v === "dashboard") {
    return v;
  }
  return "unknown";
}
