import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { isNative } from '@/lib/platform';

export const NATIVE_CALLBACK_URL = 'pt.kendirstudios.codex://auth/callback';

const isNativeApp = () => isNative();

/**
 * Redirect target for Supabase auth flows (email confirm, password reset, OAuth).
 * On native (Capacitor) we must use the app's custom URL scheme so Android
 * reopens the app instead of leaving the user in the browser.
 */
export const getAuthRedirectOrigin = () => {
  if (isNativeApp()) return NATIVE_CALLBACK_URL;
  return window.location.origin;
};

export const signInWithGoogle = async () => {
  if (!isNativeApp()) {
    return lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
  }

  // On native: go directly through Supabase OAuth (no Lovable broker),
  // open the consent page in the system browser, and let the deep-link
  // listener in App.tsx exchange the code/tokens for a session.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: NATIVE_CALLBACK_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) return { error };

  if (data?.url) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: data.url });
      return { redirected: true };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  return { error: new Error('No OAuth URL returned by Supabase') };
};

/**
 * Handle a deep-link callback URL of the form
 *   pt.kendirstudios.codex://auth/callback#access_token=...&refresh_token=...
 * or with ?code=... for PKCE.
 * Returns true if a session was established.
 */
export const handleAuthCallbackUrl = async (url: string): Promise<boolean> => {
  try {
    const parsed = new URL(url);
    // Tokens in the fragment (#access_token=...&refresh_token=...)
    const hash = parsed.hash?.startsWith('#') ? parsed.hash.slice(1) : parsed.hash || '';
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return !error;
    }

    // PKCE / magic-link code in the query string (?code=...)
    const code = parsed.searchParams.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return !error;
    }
  } catch {
    // ignore — not a parseable URL
  }
  return false;
};
