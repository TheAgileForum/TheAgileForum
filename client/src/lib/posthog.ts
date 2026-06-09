import posthog from "posthog-js";

let initialized = false;

export function initPosthog(): boolean {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

  if (!key || typeof window === "undefined") {
    return false;
  }

  if (initialized) {
    return true;
  }

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  });

  initialized = true;
  return true;
}

export function capturePosthogEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (!import.meta.env.VITE_POSTHOG_KEY || typeof window === "undefined") {
    return;
  }

  if (!initialized) {
    initPosthog();
  }

  posthog.capture(name, {
    ...props,
    app_env: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
    release: import.meta.env.VITE_OBSERVABILITY_RELEASE ?? "local-dev",
    service: "mybmadproj-client",
  });
}

export function identifyPosthogUser(
  distinctId: string,
  traits?: Record<string, string | number | boolean>,
): void {
  if (!import.meta.env.VITE_POSTHOG_KEY || typeof window === "undefined") {
    return;
  }

  if (!initialized) {
    initPosthog();
  }

  posthog.identify(distinctId, traits);
}
