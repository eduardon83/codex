import { createLovableAuth } from '@lovable.dev/cloud-auth-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { isNative } from '@/lib/platform';

const PUBLIC_APP_ORIGIN = 'https://codex.kendirstudios.pt';
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

const getOAuthBrokerUrl = () => {
  if (isNativeApp()) return `${PUBLIC_APP_ORIGIN}/~oauth/initiate`;
  return '/~oauth/initiate';
};

export const signInWithGoogle = async () => {
  if (!isNativeApp()) {
    return lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
  }

  const auth = createLovableAuth({ oauthBrokerUrl: getOAuthBrokerUrl() });
  const result = await auth.signInWithOAuth('google', {
    redirect_uri: NATIVE_CALLBACK_URL,
  });

  if (result.redirected || result.error) return result;

  try {
    await supabase.auth.setSession(result.tokens);
    return result;
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
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
