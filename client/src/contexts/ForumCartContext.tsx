/* eslint-disable react-refresh/only-export-components -- module exports context hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CURRENCY_CHANGE_EVENT, usePricing } from "../contexts/PricingContext";
import { useAuth } from "./AuthContext";
import {
  addGuestCartItem,
  addToCart,
  getCart,
  getGuestCart,
  mergeGuestCart,
  removeCartItem,
  removeGuestCartItem,
  updateCartItemQuantity,
  updateGuestCartItemQuantity,
  type CartSummary,
  type PricingRequest,
} from "../lib/forum-api";
import { trackEvent } from "../lib/analytics";

type ForumCartContextValue = {
  cart: CartSummary | null;
  itemCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (offeringCode: string, scheduleRef?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
};

const ForumCartContext = createContext<ForumCartContextValue | null>(null);

function countItems(cart: CartSummary | null): number {
  if (!cart) return 0;
  if (typeof cart.lineCount === "number") return cart.lineCount;
  return cart.items.reduce((sum, line) => sum + line.quantity, 0);
}

export function ForumCartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currency, geo } = usePricing();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const pricing = useMemo(
    (): PricingRequest => ({ geo, currency }),
    [geo, currency],
  );

  const refresh = useCallback(async () => {
    try {
      const next = user ? await getCart(pricing) : await getGuestCart(pricing);
      setCart(next);
    } catch {
      setCart(null);
    }
  }, [user, pricing]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    void refresh().finally(() => setLoading(false));
  }, [authLoading, refresh, user]);

  useEffect(() => {
    const onCurrencyChange = () => void refresh();
    window.addEventListener(CURRENCY_CHANGE_EVENT, onCurrencyChange);
    return () => window.removeEventListener(CURRENCY_CHANGE_EVENT, onCurrencyChange);
  }, [refresh]);

  useEffect(() => {
    if (authLoading || loading) return;
    trackEvent("global_cart_viewed", {
      count: countItems(cart),
      guest: user ? 0 : 1,
    });
  }, [authLoading, loading, user, cart]);

  useEffect(() => {
    if (!user || authLoading) return;
    void mergeGuestCart(pricing)
      .then((res) => setCart(res.cart))
      .catch(() => void refresh());
  }, [user, authLoading, refresh, pricing]);

  const addItem = useCallback(
    async (offeringCode: string, scheduleRef?: string) => {
      const res = user
        ? await addToCart(offeringCode, scheduleRef, pricing)
        : await addGuestCartItem(offeringCode, scheduleRef, pricing);
      setCart(res.cart);
    },
    [user, pricing],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const res = user
        ? await removeCartItem(itemId, pricing)
        : await removeGuestCartItem(itemId, pricing);
      setCart(res.cart);
    },
    [user, pricing],
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const res = user
        ? await updateCartItemQuantity(itemId, quantity, pricing)
        : await updateGuestCartItemQuantity(itemId, quantity, pricing);
      setCart(res.cart);
    },
    [user, pricing],
  );

  const value = useMemo(
    () => ({
      cart,
      itemCount: countItems(cart),
      loading,
      refresh,
      addItem,
      removeItem,
      setQuantity,
    }),
    [cart, loading, refresh, addItem, removeItem, setQuantity],
  );

  return <ForumCartContext.Provider value={value}>{children}</ForumCartContext.Provider>;
}

export function useForumCart() {
  const ctx = useContext(ForumCartContext);
  if (!ctx) throw new Error("useForumCart must be used within ForumCartProvider");
  return ctx;
}
