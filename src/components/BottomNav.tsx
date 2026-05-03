import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, User, Search, BookMarked } from 'lucide-react';

export type Tab = 'library' | 'lists' | 'find' | 'profile';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabConfig: { id: Tab; labelKey: string; icon: React.ElementType }[] = [
  { id: 'library', labelKey: 'nav.library', icon: BookOpen },
  { id: 'lists', labelKey: 'nav.lists', icon: BookMarked },
  { id: 'find', labelKey: 'nav.discover', icon: Search },
  { id: 'profile', labelKey: 'nav.profile', icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [requestCount, setRequestCount] = useState(0);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    const loadCount = async () => {
      const { count } = await supabase
        .from('loan_requests' as any)
        .select('id', { count: 'exact', head: true })
        .eq('owner_user_id', userId)
        .eq('status', 'pending');
      setRequestCount(count || 0);
    };
    loadCount();
    const channel = supabase
      .channel('loan_requests_badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loan_requests', filter: `owner_user_id=eq.${userId}` },
        () => loadCount()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabConfig.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            data-tutorial-nav={id}
            onClick={() => onChange(id)}
            className={`relative flex flex-col items-center gap-0.5 py-2 px-3 transition-colors ${
              active === id ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={active === id ? 2 : 1.5} />
            {id === 'lists' && requestCount > 0 && (
              <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-medium flex items-center justify-center">
                {requestCount}
              </span>
            )}
            <span className="text-[10px] font-sans">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
