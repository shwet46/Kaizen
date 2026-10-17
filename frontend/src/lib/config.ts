/**
 * Helper to retrieve environment variables supporting both:
 * 1. Runtime injection via window.__ENV__ (Cloud Run / Docker / Nginx)
 * 2. Build-time Vite import.meta.env (Local dev / Render / Static build)
 */
export function getEnv(key: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    const runtime = (window as any).__ENV__?.[key];
    if (runtime && typeof runtime === 'string' && runtime.trim() && !runtime.startsWith('${')) {
      return runtime.trim();
    }
  }

  const buildTime = (import.meta.env as Record<string, string | undefined>)[key];
  if (buildTime && typeof buildTime === 'string' && buildTime.trim()) {
    return buildTime.trim();
  }

  return fallback;
}
