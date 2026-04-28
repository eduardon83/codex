import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import i18n from '@/i18n';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  location: string | null;
  bio: string | null;
  avatar_url?: string | null;
  profile_completed: boolean;
  language: string;
  suspended: boolean;
  account_status?: string;
  date_of_birth?: string | null;
  parent_email?: string | null;
  terms_accepted_at?: string | null;
  terms_version?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: userId } as never, { onConflict: 'user_id' });

    return !error;
  };

  const fetchProfile = async (userId: string) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      setProfile(null);
      return;
    }

    if (!data) {
      const created = await ensureProfile(userId);
      if (!created) {
        setProfile(null);
        return;
      }

      const profileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      data = profileResult.data;
      error = profileResult.error;
    }

    if (error) {
      setProfile(null);
      return;
    }

    if (data) {
      const p = data as Profile;
      if (p.language) {
        i18n.changeLanguage(p.language);
      }
      setProfile(p);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    let active = true;

    let lastUserId: string | null = null;

    const syncAuthState = (nextSession: Session | null, opts: { force?: boolean } = {}) => {
      if (!active) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        lastUserId = null;
        setProfile(null);
        setLoading(false);
        return;
      }

      // Only show loading + refetch profile when the user actually changed
      // (initial load or sign-in/out). Benign events like TOKEN_REFRESHED or
      // window-focus revalidations would otherwise unmount in-flight screens
      // (e.g. ProfileSetup) and reset their local state.
      if (!opts.force && lastUserId === nextSession.user.id) {
        return;
      }
      lastUserId = nextSession.user.id;

      setLoading(true);
      void fetchProfile(nextSession.user.id).finally(() => {
        if (active) setLoading(false);
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        // Only treat sign-in/out (and the initial signed-in event) as a user
        // change. Token refreshes and metadata updates should not trigger a
        // full reload of the profile/loading state.
        const force = event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION';
        syncAuthState(nextSession, { force: false });
        if (force && nextSession?.user && lastUserId !== nextSession.user.id) {
          // handled inside syncAuthState by the lastUserId check
        }
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session: initialSession } }) => {
        syncAuthState(initialSession);
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const currentLang = () => {
    const supported = ['pt', 'en', 'es', 'fr'];
    const l = (i18n.language || 'pt').slice(0, 2).toLowerCase();
    return supported.includes(l) ? l : 'pt';
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { language: currentLang() },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, resetPassword, updatePassword, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
