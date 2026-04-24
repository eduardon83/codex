import { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminMfa from './AdminMfa';

interface Props {
  children: ReactNode;
}

export default function AdminGuard({ children }: Props) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mfaVerified, setMfaVerified] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth?mode=login&redirect=/admin', { replace: true });
      return;
    }

    const check = async () => {
      // Check admin status
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data) {
        navigate('/', { replace: true });
        return;
      }
      setIsAdmin(true);

      // Check MFA status
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === 'aal2') {
        setMfaVerified(true);
      } else {
        setMfaVerified(false);
      }
      setChecking(false);
    };

    check();
  }, [user, loading, navigate]);

  if (loading || checking || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm font-['Josefin_Sans']">Verifying access…</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  if (!mfaVerified) {
    return <AdminMfa onVerified={() => setMfaVerified(true)} />;
  }

  return <>{children}</>;
}
