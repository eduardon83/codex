import { Capacitor } from '@capacitor/core';
import { createLovableAuth } from '@lovable.dev/cloud-auth-js';
import { supabase } from '@/integrations/supabase/client';

const PUBLIC_APP_ORIGIN = 'https://codex.kendirstudios.pt';

const isNativeApp = () => Capacitor.isNativePlatform();

export const getAuthRedirectOrigin = () => {
  if (isNativeApp()) return PUBLIC_APP_ORIGIN;
  return window.location.origin;
};

const getOAuthBrokerUrl = () => {
  if (isNativeApp()) return `${PUBLIC_APP_ORIGIN}/~oauth/initiate`;
  return '/~oauth/initiate';
};

export const signInWithGoogle = async () => {
  const auth = createLovableAuth({ oauthBrokerUrl: getOAuthBrokerUrl() });
  const result = await auth.signInWithOAuth('google', {
    redirect_uri: getAuthRedirectOrigin(),
  });

  if (result.redirected || result.error) return result;

  try {
    await supabase.auth.setSession(result.tokens);
    return result;
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};
