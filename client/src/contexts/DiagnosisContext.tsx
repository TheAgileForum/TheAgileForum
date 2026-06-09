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
  loading: boolean;
  startSession: (campaignId?: string) => Promise<string>;
  setRunId: (runId: string | null) => void;
  reset: () => void;
};

const DiagnosisContext = createContext<DiagnosisContextValue | null>(null);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(() => getStoredSessionId());
  const [runId, setRunId] = useState<string | null>(null);
  const [resumeStep, setResumeStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getStoredSessionId()));

  useEffect(() => {
    const stored = getStoredSessionId();
    if (!stored) return;
    void getJourneyState(stored)
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
      })
      .finally(() => setLoading(false));
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
      loading,
      startSession,
      setRunId,
      reset,
    }),
    [sessionId, runId, resumeStep, loading, startSession, reset],
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
