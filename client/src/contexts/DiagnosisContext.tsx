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
  startSession: (campaignId?: string) => Promise<string>;
  setRunId: (runId: string | null) => void;
  reset: () => void;
};

const DiagnosisContext = createContext<DiagnosisContextValue | null>(null);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(() => getStoredSessionId());
  const [runId, setRunId] = useState<string | null>(null);
  const [resumeStep, setResumeStep] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(() => Boolean(getStoredSessionId()));

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
    const res = await createDiagnosisSession({ campaignId });
    storeSessionId(res.diagnosisSessionId);
    setSessionId(res.diagnosisSessionId);
    setRunId(null);
    setResumeStep("step_1");
    return res.diagnosisSessionId;
  }, []);

  const reset = useCallback(() => {
    clearStoredSessionId();
    setSessionId(null);
    setRunId(null);
    setResumeStep(null);
  }, []);

  const value = useMemo(
    () => ({
      sessionId,
      runId,
      resumeStep,
      resumeLoading,
      startSession,
      setRunId,
      reset,
    }),
    [sessionId, runId, resumeStep, resumeLoading, startSession, reset],
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
