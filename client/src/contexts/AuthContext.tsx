/* eslint-disable react-refresh/only-export-components -- module exports context hook */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiFetch, ApiRequestError } from "../lib/api.js";
import { apiUrl } from "../lib/api-base.js";



export type AuthUser = {

  id: string;

  email: string;

  displayName: string | null;

  pictureUrl: string | null;

  oauthProfileUrl: string | null;

  role: string;

  tenantId: string | null;

  tenantIds: string[];

  emailVerified: boolean;

  requireEmailVerification?: boolean;

};



type MeResponse = {

  user: AuthUser;

  requireEmailVerification?: boolean;

};



type AuthContextValue = {

  user: AuthUser | null;

  demoMode: boolean;

  loading: boolean;

  loginError: string | null;

  loginErrorCode: string | null;

  clearLoginError: () => void;

  login: (email: string, password: string) => Promise<boolean>;

  register: (email: string, password: string) => Promise<boolean>;

  logout: () => Promise<void>;

  refreshMe: () => Promise<boolean>;

  resendVerificationEmail: () => Promise<{ ok: boolean; message?: string }>;

  enterDemoBrowse: () => void;

  exitDemoBrowse: () => void;

};



const AuthContext = createContext<AuthContextValue | null>(null);



function normalizeUser(raw: MeResponse["user"], requireEmailVerification?: boolean): AuthUser {

  return {

    ...raw,

    displayName: raw.displayName ?? null,

    pictureUrl: raw.pictureUrl ?? null,

    oauthProfileUrl: raw.oauthProfileUrl ?? null,

    emailVerified: raw.emailVerified === true,

    requireEmailVerification: requireEmailVerification ?? raw.requireEmailVerification,

  };

}



export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(null);

  const [demoMode, setDemoMode] = useState(false);

  const [loading, setLoading] = useState(true);

  const [loginError, setLoginError] = useState<string | null>(null);

  const [loginErrorCode, setLoginErrorCode] = useState<string | null>(null);



  const clearLoginError = useCallback(() => {

    setLoginError(null);

    setLoginErrorCode(null);

  }, []);



  const refreshMe = useCallback(async (): Promise<boolean> => {

    try {

      const meJson = await apiFetch<MeResponse>("/api/v1/auth/me", { timeoutMs: 15_000 });

      if (meJson.user) {

        setUser(normalizeUser(meJson.user, meJson.requireEmailVerification));

        setDemoMode(false);

        return true;

      }

      setUser(null);

      return false;

    } catch {

      setUser(null);

      return false;

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    /* eslint-disable react-hooks/set-state-in-effect -- fetch /me once on mount to hydrate cookie session */

    void refreshMe();

    /* eslint-enable react-hooks/set-state-in-effect */

  }, [refreshMe]);



  const login = useCallback(async (email: string, password: string): Promise<boolean> => {

    setLoginError(null);

    setLoginErrorCode(null);

    setDemoMode(false);

    try {

      await apiFetch("/api/v1/auth/login", {

        method: "POST",

        body: JSON.stringify({ email, password }),

        timeoutMs: 20_000,

      });

      await refreshMe();

      return true;

    } catch (err) {

      if (err instanceof ApiRequestError) {

        setLoginErrorCode(err.code);

        setLoginError(err.message);

      } else {

        setLoginErrorCode("NETWORK_ERROR");

        setLoginError(err instanceof Error ? err.message : "Login failed");

      }

      return false;

    }

  }, [refreshMe]);



  const register = useCallback(async (email: string, password: string): Promise<boolean> => {

    setLoginError(null);

    setLoginErrorCode(null);

    setDemoMode(false);

    try {

      await apiFetch("/api/v1/auth/register", {

        method: "POST",

        body: JSON.stringify({

          email,

          password,

          policyVersion: "v1",

          acceptTerms: true,

        }),

        timeoutMs: 30_000,

      });

      await refreshMe();

      return true;

    } catch (err) {

      if (err instanceof ApiRequestError) {

        setLoginErrorCode(err.code);

        setLoginError(err.message);

      } else {

        setLoginErrorCode("NETWORK_ERROR");

        setLoginError(err instanceof Error ? err.message : "Registration failed");

      }

      return false;

    }

  }, [refreshMe]);



  const resendVerificationEmail = useCallback(async () => {

    try {

      await apiFetch("/api/v1/auth/verify-email/resend", {

        method: "POST",

        timeoutMs: 20_000,

      });

      return { ok: true as const };

    } catch (err) {

      if (err instanceof ApiRequestError) {

        return { ok: false as const, message: err.message };

      }

      return {

        ok: false as const,

        message: "Could not send verification email. Try again shortly.",

      };

    }

  }, []);



  const logout = useCallback(async () => {

    await fetch(apiUrl("/api/v1/auth/logout"), { method: "POST", credentials: "include" });

    setUser(null);

    setDemoMode(false);

    clearLoginError();

  }, [clearLoginError]);



  const enterDemoBrowse = useCallback(() => {

    setDemoMode(true);

    setUser(null);

    clearLoginError();

  }, [clearLoginError]);



  const exitDemoBrowse = useCallback(() => {

    setDemoMode(false);

  }, []);



  const value = useMemo(

    () => ({

      user,

      demoMode,

      loading,

      loginError,

      loginErrorCode,

      clearLoginError,

      login,

      register,

      logout,

      refreshMe,

      resendVerificationEmail,

      enterDemoBrowse,

      exitDemoBrowse,

    }),

    [

      user,

      demoMode,

      loading,

      loginError,

      loginErrorCode,

      clearLoginError,

      login,

      register,

      logout,

      refreshMe,

      resendVerificationEmail,

      enterDemoBrowse,

      exitDemoBrowse,

    ],

  );



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}



export function useAuth() {

  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used within AuthProvider");

  return ctx;

}

