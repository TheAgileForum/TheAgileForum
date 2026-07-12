/* eslint-disable react-refresh/only-export-components -- module exports context hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredSessionId,
  createDiagnosisSession,
  getJourneyState,
  getStoredSessionId,
  storeSessionId,
} from "../lib/forum-api";

type DiagnosisContextValue = {
  sessionId: string | null;
  runId: string | null;
  resumeStep: string | null;
  /** True only while restoring a stored session on load — do not block new diagnosis CTAs. */
  resumeLoading: boolean;
  /** True while POST /diagnosis/session is in flight. */
  sessionStarting: boolean;
  startSession: (campaignId?: string) => Promise<string>;
  /** Fire-and-forget session create so step-1 form can render before the API returns. */
  prefetchSession: (campaignId?: string) => void;
  setRunId: (runId: string | null) => void;
  reset: () => void;
};

const DiagnosisContext = createContext<DiagnosisContextValue | null>(null);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(() => getStoredSessionId());
  const [runId, setRunId] = useState<string | null>(null);
  const [resumeStep, setResumeStep] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(() => Boolean(getStoredSessionId()));
  const [sessionStarting, setSessionStarting] = useState(false);
  const sessionPromiseRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    const stored = getStoredSessionId();
    if (!stored) return;

    const timeoutMs = 15_000;
    const journeyPromise = getJourneyState(stored);
    const timeoutPromise = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("JOURNEY_STATE_TIMEOUT")), timeoutMs);
    });

    void Promise.race([journeyPromise, timeoutPromise])
      .then((state) => {
        setSessionId(stored);
        setResumeStep(state.currentStep);
        const payload = state.resumePayload;
        if (payload && typeof payload.analysisRunId === "string") {
          setRunId(payload.analysisRunId);
        }
      })
      .catch(() => {
        clearStoredSessionId();
        setSessionId(null);
        setResumeStep(null);
        setRunId(null);
      })
      .finally(() => setResumeLoading(false));
  }, []);

  const startSession = useCallback(async (campaignId?: string) => {
    const existing = getStoredSessionId();
    if (existing) {
      setSessionId(existing);
      setResumeStep("step_1");
      return existing;
    }
    if (sessionPromiseRef.current) {
      return sessionPromiseRef.current;
    }

    setSessionStarting(true);
    const promise = (async () => {
      const res = await createDiagnosisSession({ campaignId });
      storeSessionId(res.diagnosisSessionId);
      setSessionId(res.diagnosisSessionId);
      setRunId(null);
      setResumeStep("step_1");
      return res.diagnosisSessionId;
    })();

    sessionPromiseRef.current = promise;

    try {
      return await promise;
    } finally {
      setSessionStarting(false);
      sessionPromiseRef.current = null;
    }
  }, []);

  const prefetchSession = useCallback(
    (campaignId = "home-prefetch") => {
      if (getStoredSessionId() || sessionPromiseRef.current) return;
      void startSession(campaignId).catch(() => undefined);
    },
    [startSession],
  );

  const reset = useCallback(() => {
    clearStoredSessionId();
    setSessionId(null);
    setRunId(null);
    setResumeStep(null);
    sessionPromiseRef.current = null;
  }, []);

  const value = useMemo(
    () => ({
      sessionId,
      runId,
      resumeStep,
      resumeLoading,
      sessionStarting,
      startSession,
      prefetchSession,
      setRunId,
      reset,
    }),
    [
      sessionId,
      runId,
      resumeStep,
      resumeLoading,
      sessionStarting,
      startSession,
      prefetchSession,
      reset,
    ],
  );

  return (
    <DiagnosisContext.Provider value={value}>{children}</DiagnosisContext.Provider>
  );
}

export function useDiagnosis() {
  const ctx = useContext(DiagnosisContext);
  if (!ctx) throw new Error("useDiagnosis must be used within DiagnosisProvider");
  return ctx;
}
