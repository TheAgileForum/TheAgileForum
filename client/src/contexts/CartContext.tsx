/* eslint-disable react-refresh/only-export-components -- module exports context hook */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { MenuItem } from "../demo/mockData";

export type CartLine = {
  item: MenuItem;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (item: MenuItem, qty?: number) => void;
  setQty: (itemId: string, qty: number) => void;
  removeLine: (itemId: string) => void;
  clear: () => void;
  totalCents: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addItem = useCallback((item: MenuItem, qty = 1) => {
    if (!item.available) return;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.item.id === item.id);
      if (i === -1) return [...prev, { item, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
  }, []);

  const setQty = useCallback((itemId: string, qty: number) => {
    if (qty < 1) {
      setLines((prev) => prev.filter((l) => l.item.id !== itemId));
      return;
    }
    setLines((prev) => prev.map((l) => (l.item.id === itemId ? { ...l, qty } : l)));
  }, []);

  const removeLine = useCallback((itemId: string) => {
    setLines((prev) => prev.filter((l) => l.item.id !== itemId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { totalCents, itemCount } = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const l of lines) {
      total += l.item.priceCents * l.qty;
      count += l.qty;
    }
    return { totalCents: total, itemCount: count };
  }, [lines]);

  const value = useMemo(
    () => ({ lines, addItem, setQty, removeLine, clear, totalCents, itemCount }),
    [lines, addItem, setQty, removeLine, clear, totalCents, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
