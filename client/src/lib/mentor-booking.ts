/** Topmate booking link for mentor / discovery calls (specific service slot). */
export const MENTOR_BOOKING_URL =
  "https://topmate.io/coach_dhirender_verma/877632?utm_source=public_profile&utm_campaign=coach_dhirender_verma";

export function openMentorBooking(): void {
  window.open(MENTOR_BOOKING_URL, "_blank", "noopener,noreferrer");
}
