import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, X } from 'lucide-react';

interface CardRow {
  id: string;
  library_name: string | null;
  name: string | null;
  expiry_date: string | null;
}

interface Props {
  onGoToProfile?: () => void;
}

const SESSION_DISMISS_KEY = 'lib_card_banner_dismissed';

function daysUntil(date: string): number {
  const d = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - today.getTime()) / 86400000);
}

export default function LibraryCardExpiryBanner({ onGoToProfile }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cards, setCards] = useState<CardRow[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_DISMISS_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('library_cards' as any)
        .select('id, library_name, name, expiry_date')
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null);
      setCards((data as any) || []);
    })();
  }, [user]);

  const alerts = useMemo(() => {
    return cards
      .map((c) => {
        if (!c.expiry_date) return null;
        const d = daysUntil(c.expiry_date);
        if (d < 0) return { card: c, type: 'expired' as const };
        if (d <= 30) return { card: c, type: 'soon' as const };
        return null;
      })
      .filter((x): x is { card: CardRow; type: 'expired' | 'soon' } => !!x && !dismissed.has(x.card.id));
  }, [cards, dismissed]);

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    try { sessionStorage.setItem(SESSION_DISMISS_KEY, JSON.stringify([...next])); } catch {}
  };

  const goToCard = () => {
    onGoToProfile?.();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('scroll-to-library-cards'));
    }, 150);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map(({ card, type }) => {
        const name = card.library_name || card.name || '';
        const isExpired = type === 'expired';
        return (
          <div
            key={card.id}
            className={`flex items-center gap-2 px-3 py-2.5 rounded text-sm ${
              isExpired
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span className="flex-1">
              {isExpired
                ? t('libraryCard.bannerExpired', { name })
                : t('libraryCard.bannerExpiringSoon', { name })}
            </span>
            {onGoToProfile && (
              <button onClick={goToCard} className="underline hover:opacity-70 text-xs">
                {t('libraryCard.bannerView')}
              </button>
            )}
            <button onClick={() => dismiss(card.id)} className="hover:opacity-70" aria-label="dismiss">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
