import type { AuthUser } from "../contexts/AuthContext";

export function userDisplayLabel(user: Pick<AuthUser, "displayName" | "email">): string {
  const name = user.displayName?.trim();
  return name || user.email;
}
