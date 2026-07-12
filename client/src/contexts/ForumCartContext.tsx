/* eslint-disable react-refresh/only-export-components -- module exports context hook */
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link as RouterLink } from "react-router-dom";
import { CURRENCY_CHANGE_EVENT, usePricing } from "../contexts/PricingContext";
import { ApiRequestError } from "../lib/api";
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

type CartNotice = {
  severity: "success" | "error";
  message: string;
};

type ForumCartContextValue = {
  cart: CartSummary | null;
  itemCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (offeringCode: string, scheduleRef?: string, label?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
};

const ForumCartContext = createContext<ForumCartContextValue | null>(null);

function countItems(cart: CartSummary | null): number {
  if (!cart) return 0;
  if (typeof cart.lineCount === "number") return cart.lineCount;
  return cart.items.reduce((sum, line) => sum + line.quantity, 0);
}

function formatAddedMessage(label?: string): string {
  const trimmed = label?.trim();
  return trimmed ? `${trimmed} added to cart.` : "Added to cart.";
}

export function ForumCartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currency, geo } = usePricing();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAdds, setPendingAdds] = useState(0);
  const [notice, setNotice] = useState<CartNotice | null>(null);

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

  const itemCount = countItems(cart) + pendingAdds;

  useEffect(() => {
    if (authLoading || loading) return;
    trackEvent("global_cart_viewed", {
      count: itemCount,
      guest: user ? 0 : 1,
    });
  }, [authLoading, loading, user, itemCount]);

  useEffect(() => {
    if (!user || authLoading) return;
    void mergeGuestCart(pricing)
      .then((res) => setCart(res.cart))
      .catch(() => void refresh());
  }, [user, authLoading, refresh, pricing]);

  const addItem = useCallback(
    async (offeringCode: string, scheduleRef?: string, label?: string) => {
      setNotice({ severity: "success", message: formatAddedMessage(label) });
      setPendingAdds((count) => count + 1);
      try {
        const res = user
          ? await addToCart(offeringCode, scheduleRef?.trim() || undefined, pricing)
          : await addGuestCartItem(
              offeringCode,
              scheduleRef?.trim() || undefined,
              pricing,
            );
        setCart(res.cart);
      } catch (err) {
        const message =
          err instanceof ApiRequestError
            ? err.message
            : "Could not add to cart. Try again or open the offer page.";
        setNotice({ severity: "error", message });
        throw err;
      } finally {
        setPendingAdds((count) => Math.max(0, count - 1));
      }
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
      itemCount,
      loading,
      refresh,
      addItem,
      removeItem,
      setQuantity,
    }),
    [cart, itemCount, loading, refresh, addItem, removeItem, setQuantity],
  );

  return (
    <ForumCartContext.Provider value={value}>
      {children}
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={5000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice?.severity ?? "success"}
          variant="filled"
          onClose={() => setNotice(null)}
          action={
            notice?.severity === "success" ? (
              <Button
                component={RouterLink}
                to="/cart"
                color="inherit"
                size="small"
                onClick={() => setNotice(null)}
              >
                View cart
              </Button>
            ) : undefined
          }
          sx={{ width: "100%" }}
        >
          {notice?.message}
        </Alert>
      </Snackbar>
    </ForumCartContext.Provider>
  );
}

export function useForumCart() {
  const ctx = useContext(ForumCartContext);
  if (!ctx) throw new Error("useForumCart must be used within ForumCartProvider");
  return ctx;
}
