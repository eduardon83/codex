import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AppRole =
  | 'admin'
  | 'global_admin'
  | 'moderator'
  | 'teacher'
  | 'school_admin'
  | 'entity'
  | 'bookstore'
  | 'author'
  | 'influencer'
  | 'user';

const PRO_ROLES: AppRole[] = ['bookstore', 'author', 'influencer', 'entity'];

export function useUserRoles() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id);
      if (cancelled) return;
      setRoles(((data as any[]) || []).map((r) => r.role as AppRole));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyProRole = roles.some((r) => PRO_ROLES.includes(r));

  return { roles, loading, hasRole, hasAnyProRole };
}
