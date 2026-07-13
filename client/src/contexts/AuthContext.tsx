/* eslint-disable react-refresh/only-export-components -- module exports context hook */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

  resendVerificationEmail: () => Promise<boolean>;

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

      const me = await fetch(apiUrl("/api/v1/auth/me"), { credentials: "include" });

      const meJson = (await me.json()) as MeResponse & { error?: unknown };

      if (me.ok && meJson.user) {

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

    const res = await fetch(apiUrl("/api/v1/auth/login"), {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      credentials: "include",

      body: JSON.stringify({ email, password }),

    });

    const data = (await res.json().catch(() => ({}))) as {

      error?: { code?: string; message?: string };

    };

    if (!res.ok) {

      const code = typeof data?.error?.code === "string" ? data.error.code : "ERROR";

      const msg = typeof data?.error?.message === "string" ? data.error.message : "Login failed";

      setLoginErrorCode(code);

      setLoginError(msg);

      return false;

    }

    await refreshMe();

    return true;

  }, [refreshMe]);



  const register = useCallback(async (email: string, password: string): Promise<boolean> => {

    setLoginError(null);

    setLoginErrorCode(null);

    setDemoMode(false);

    const res = await fetch(apiUrl("/api/v1/auth/register"), {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      credentials: "include",

      body: JSON.stringify({

        email,

        password,

        policyVersion: "v1",

        acceptTerms: true,

      }),

    });

    const data = (await res.json().catch(() => ({}))) as {

      error?: { code?: string; message?: string };

    };

    if (!res.ok) {

      const code = typeof data?.error?.code === "string" ? data.error.code : "ERROR";

      const msg = typeof data?.error?.message === "string" ? data.error.message : "Registration failed";

      setLoginErrorCode(code);

      setLoginError(msg);

      return false;

    }

    await refreshMe();

    return true;

  }, [refreshMe]);



  const resendVerificationEmail = useCallback(async () => {

    const res = await fetch(apiUrl("/api/v1/auth/verify-email/resend"), {

      method: "POST",

      credentials: "include",

    });

    return res.ok || res.status === 202;

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

