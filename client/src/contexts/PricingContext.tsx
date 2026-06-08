import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrencyContext,
  postSessionCurrency,
  type CurrencyContextResponse,
  type PriceQuote,
  postPricingQuote,
} from "../lib/forum-api";
import {
  geoFromSessionCurrency,
  getSessionCurrency,
  setSessionCurrency,
  type SessionCurrency,
} from "../lib/session-currency";

type PricingContextValue = {
  currency: SessionCurrency;
  geo: string;
  source: "geo" | "user";
  loading: boolean;
  setCurrency: (currency: SessionCurrency) => Promise<void>;
  quoteOfferings: (offerIds: string[]) => Promise<PriceQuote[]>;
  refresh: () => Promise<void>;
};

const PricingContext = createContext<PricingContextValue | null>(null);

const CURRENCY_CHANGE_EVENT = "af-session-currency-change";

function syncSessionStorage(currency: SessionCurrency) {
  setSessionCurrency(currency);
  window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: currency }));
}

export function PricingProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<CurrencyContextResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = getSessionCurrency();
    const geo = geoFromSessionCurrency(stored);
    const res = await getCurrencyContext(geo, stored);
    setContext(res);
    if (res.currency !== stored && (res.source === "geo" || !sessionStorage.getItem("af_session_currency"))) {
      syncSessionStorage(res.currency as SessionCurrency);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const setCurrency = useCallback(async (currency: SessionCurrency) => {
    const geo = geoFromSessionCurrency(currency);
    syncSessionStorage(currency);
    const res = await postSessionCurrency(currency, geo);
    setContext(res);
  }, []);

  const quoteOfferings = useCallback(
    async (offerIds: string[]) => {
      if (!context) {
        const stored = getSessionCurrency();
        const res = await postPricingQuote({
          offerIds,
          currency: stored,
          geo: geoFromSessionCurrency(stored),
        });
        return res.quotes;
      }
      const res = await postPricingQuote({
        offerIds,
        currency: context.currency,
        geo: context.geoDetected,
      });
      return res.quotes;
    },
    [context],
  );

  const value = useMemo(
    (): PricingContextValue => ({
      currency: (context?.currency ?? getSessionCurrency()) as SessionCurrency,
      geo: context?.geoDetected ?? geoFromSessionCurrency(getSessionCurrency()),
      source: context?.source ?? "geo",
      loading,
      setCurrency,
      quoteOfferings,
      refresh,
    }),
    [context, loading, setCurrency, quoteOfferings, refresh],
  );

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error("usePricing must be used within PricingProvider");
  return ctx;
}

export { CURRENCY_CHANGE_EVENT };
