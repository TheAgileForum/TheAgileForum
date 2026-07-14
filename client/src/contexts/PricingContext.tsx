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
  hasExplicitSessionCurrencyOverride,
  hasPersistedSessionCurrency,
  markExplicitSessionCurrencyOverride,
  setSessionCurrency,
  type SessionCurrency,
} from "../lib/session-currency";

type PricingContextValue = {
  currency: SessionCurrency;
  geo: string;
  source: "geo" | "user";
  /** True after initial geo/currency resolve (or immediately when session currency is persisted). */
  ready: boolean;
  loading: boolean;
  setCurrency: (currency: SessionCurrency) => Promise<void>;
  quoteOfferings: (offerIds: string[]) => Promise<PriceQuote[]>;
  refresh: () => Promise<void>;
};

const PricingContext = createContext<PricingContextValue | null>(null);

const CURRENCY_CHANGE_EVENT = "af-session-currency-change";

function readInitialCurrencyContext(): CurrencyContextResponse {
  const currency = getSessionCurrency();
  return {
    currency,
    geoDetected: geoFromSessionCurrency(currency),
    source: hasExplicitSessionCurrencyOverride() ? "user" : "geo",
  };
}

function sameCurrencyContext(
  a: CurrencyContextResponse | null,
  b: CurrencyContextResponse,
): boolean {
  return (
    a?.currency === b.currency &&
    a?.geoDetected === b.geoDetected &&
    a?.source === b.source
  );
}

function syncSessionStorage(currency: SessionCurrency) {
  if (getSessionCurrency() === currency) return;
  setSessionCurrency(currency);
  window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: currency }));
}

export function PricingProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<CurrencyContextResponse | null>(readInitialCurrencyContext);
  const [ready, setReady] = useState(() => hasPersistedSessionCurrency());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      if (hasExplicitSessionCurrencyOverride()) {
        const stored = getSessionCurrency();
        const res = await getCurrencyContext({
          geo: geoFromSessionCurrency(stored),
          currencyOverride: stored,
        });
        setContext((prev) => (sameCurrencyContext(prev, res) ? prev : res));
        syncSessionStorage(res.currency as SessionCurrency);
        return;
      }

      const res = await getCurrencyContext();
      setContext((prev) => (sameCurrencyContext(prev, res) ? prev : res));
      if (res.source === "geo") {
        syncSessionStorage(res.currency as SessionCurrency);
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setCurrency = useCallback(async (currency: SessionCurrency) => {
    setLoading(true);
    try {
      markExplicitSessionCurrencyOverride();
      syncSessionStorage(currency);
      const geo = geoFromSessionCurrency(currency);
      const res = await postSessionCurrency(currency, geo);
      setContext(res);
    } finally {
      setLoading(false);
    }
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
      ready,
      loading,
      setCurrency,
      quoteOfferings,
      refresh,
    }),
    [context, ready, loading, setCurrency, quoteOfferings, refresh],
  );

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error("usePricing must be used within PricingProvider");
  return ctx;
}

export { CURRENCY_CHANGE_EVENT };
