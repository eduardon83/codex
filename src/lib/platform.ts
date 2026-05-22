// Robust native (Capacitor) platform detection.
// Works in release builds where the bridge may inject Capacitor slightly
// after the first JS tick, and falls back to UA sniffing for the Capacitor
// WebView when the bridge global is not yet ready.

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  platform?: string;
};

export const isNative = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (cap) {
    try {
      if (typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) return true;
      const platform =
        (typeof cap.getPlatform === 'function' ? cap.getPlatform() : cap.platform) || 'web';
      if (platform && platform !== 'web') return true;
    } catch {
      // ignore and fall through to UA check
    }
  }
  // Fallback: Capacitor WebView identifies itself in the UA string.
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  return /CapacitorWebView|Capacitor\//i.test(ua);
};
