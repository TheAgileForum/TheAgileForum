declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

export function initClarity(projectId: string | undefined) {
  if (!projectId || typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  if (window.clarity) {
    return true;
  }

  const clarityFn = ((...args: unknown[]) => {
    clarityFn.q = clarityFn.q ?? [];
    clarityFn.q.push(args);
  }) as ((...args: unknown[]) => void) & { q?: unknown[][] };
  window.clarity = clarityFn;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);

  return true;
}
