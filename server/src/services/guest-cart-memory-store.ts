import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/library";

export type GuestCartItemRecord = {
  id: string;
  offeringCode: string;
  scheduleRef: string | null;
  quantity: number;
  unitPrice: Decimal;
  currency: string;
};

export type GuestCartRecord = {
  id: string;
  sessionToken: string;
  status: "active" | "merged";
  currency: string;
  items: GuestCartItemRecord[];
};

const cartsByToken = new Map<string, GuestCartRecord>();

function scheduleKey(scheduleRef: string | null | undefined): string {
  return scheduleRef?.trim() || "";
}

export function memoryGetActiveGuestCart(
  sessionToken: string,
): GuestCartRecord | null {
  const cart = cartsByToken.get(sessionToken);
  if (!cart || cart.status !== "active") return null;
  return cart;
}

export function memoryGetOrCreateGuestCart(sessionToken: string): GuestCartRecord {
  const existing = memoryGetActiveGuestCart(sessionToken);
  if (existing) return existing;

  const cart: GuestCartRecord = {
    id: randomUUID(),
    sessionToken,
    status: "active",
    currency: "USD",
    items: [],
  };
  cartsByToken.set(sessionToken, cart);
  return cart;
}

export function memoryAddGuestCartItem(
  sessionToken: string,
  input: {
    offeringCode: string;
    scheduleRef: string | null;
    quantity: number;
    unitPrice: Decimal;
    currency: string;
  },
): { cart: GuestCartRecord; item: GuestCartItemRecord } {
  const cart = memoryGetOrCreateGuestCart(sessionToken);
  if (cart.currency !== input.currency) {
    cart.currency = input.currency;
  }

  const existingLine = cart.items.find(
    (item) =>
      item.offeringCode === input.offeringCode &&
      scheduleKey(item.scheduleRef) === scheduleKey(input.scheduleRef),
  );

  if (existingLine) {
    existingLine.quantity += input.quantity;
    existingLine.unitPrice = input.unitPrice;
    existingLine.currency = input.currency;
    return { cart, item: existingLine };
  }

  const item: GuestCartItemRecord = {
    id: randomUUID(),
    offeringCode: input.offeringCode,
    scheduleRef: input.scheduleRef,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    currency: input.currency,
  };
  cart.items.push(item);
  return { cart, item };
}

export function memoryRemoveGuestCartItem(
  sessionToken: string,
  itemId: string,
): boolean {
  const cart = memoryGetOrCreateGuestCart(sessionToken);
  const index = cart.items.findIndex((item) => item.id === itemId);
  if (index < 0) return false;
  cart.items.splice(index, 1);
  return true;
}

export function memoryUpdateGuestCartItemQuantity(
  sessionToken: string,
  itemId: string,
  quantity: number,
): { ok: true; removed: boolean } | { ok: false } {
  const cart = memoryGetOrCreateGuestCart(sessionToken);
  const line = cart.items.find((item) => item.id === itemId);
  if (!line) return { ok: false };

  if (quantity < 1) {
    cart.items = cart.items.filter((item) => item.id !== itemId);
    return { ok: true, removed: true };
  }

  line.quantity = quantity;
  return { ok: true, removed: false };
}

export function memoryMarkGuestCartMerged(sessionToken: string): void {
  const cart = memoryGetActiveGuestCart(sessionToken);
  if (!cart) return;
  cart.status = "merged";
  cart.items = [];
}

/** Test helper — clears all in-memory guest carts. */
export function resetGuestCartMemoryStore(): void {
  cartsByToken.clear();
}
