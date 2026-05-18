import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { tGenre } from '@/lib/displayMappings';
import { formatHumanDuration } from '@/lib/readingSessions';
import { useTranslation as useT } from 'react-i18next';

interface Stats {
  totalBooks: number;
  onLoan: number;
  borrowed: number;
  booksRead: number;
  currentlyReading: number;
  toRead: number;
  totalLibraries: number;
  wishlistCount: number;
  avgRating: number | null;
  topGenre: string | null;
  loansAsLender: number;
  loansAsBorrower: number;
  onTimePercent: number | null;
}

export default function ProfileStats() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  const load = async () => {
    if (!user) return;
    const uid = user.id;

    const [
      booksRes,
      wishlistRes,
      loansRes,
      borrowedRes,
      librariesRes,
      historyRes,
      lenderLoansRes,
      borrowerLoansRes,
      borrowerReturnedRes,
    ] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_wishlist', false),
      supabase.from('books').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_wishlist', true),
      supabase.from('loans').select('id', { count: 'exact', head: true }).eq('lender_id', uid).eq('is_active', true),
      supabase.from('books').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_borrowed', true),
      supabase.from('libraries').select('id', { count: 'exact', head: true }).eq('user_id', uid),
      supabase.from('reading_history').select('status, rating, book_genre').eq('user_id', uid),
      supabase.from('loan_requests' as any).select('id', { count: 'exact', head: true }).eq('owner_user_id', uid).in('status', ['accepted', 'in_progress', 'overdue', 'returned']),
      supabase.from('loan_requests' as any).select('id', { count: 'exact', head: true }).eq('requester_user_id', uid).in('status', ['accepted', 'in_progress', 'overdue', 'returned']),
      supabase.from('loan_requests' as any).select('due_date, returned_at').eq('requester_user_id', uid).eq('status', 'returned'),
    ]);

    const returnedRows = ((borrowerReturnedRes as any).data as any[]) || [];
    const completed = returnedRows.length;
    const onTime = returnedRows.filter(r =>
      r.due_date && r.returned_at && new Date(r.returned_at).getTime() <= new Date(r.due_date).getTime()
    ).length;
    const onTimePercent = completed >= 3 ? Math.round((onTime / completed) * 100) : null;

    const historyData = (historyRes.data as any[]) || [];
    const booksRead = historyData.filter(h => h.status === 'Read').length;
    const currentlyReading = historyData.filter(h => h.status === 'Currently Reading').length;
    const toRead = historyData.filter(h => h.status === 'Unread' || h.status === 'unread').length;

    const ratings = historyData.filter(h => h.rating != null).map(h => h.rating as number);
    const avgRating = ratings.length >= 3 ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;

    // Top genre
    const genreCounts: Record<string, number> = {};
    historyData.forEach(h => {
      if (h.book_genre) {
        h.book_genre.split(',').forEach((g: string) => {
          const genre = g.trim();
          if (genre) genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    setStats({
      totalBooks: booksRes.count || 0,
      onLoan: loansRes.count || 0,
      borrowed: borrowedRes.count || 0,
      booksRead,
      currentlyReading,
      toRead,
      totalLibraries: librariesRes.count || 0,
      wishlistCount: wishlistRes.count || 0,
      avgRating,
      topGenre,
      loansAsLender: (lenderLoansRes as any).count || 0,
      loansAsBorrower: (borrowerLoansRes as any).count || 0,
      onTimePercent,
    });
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!stats) return null;

  const metrics: { label: string; value: string | number }[] = [
    { label: t('profileStats.totalBooks'), value: stats.totalBooks },
    { label: t('profileStats.onLoan'), value: stats.onLoan },
    { label: t('profileStats.borrowed'), value: stats.borrowed },
    { label: t('profileStats.booksRead'), value: stats.booksRead },
    { label: t('profileStats.currentlyReading'), value: stats.currentlyReading },
    { label: t('profileStats.toRead'), value: stats.toRead },
    { label: t('profileStats.totalLibraries'), value: stats.totalLibraries },
    { label: t('profileStats.wishlist'), value: stats.wishlistCount },
    { label: t('profileStats.loansAsLender', 'Livros emprestados'), value: stats.loansAsLender },
    { label: t('profileStats.loansAsBorrower', 'Livros pedidos emprestados'), value: stats.loansAsBorrower },
  ];
  if (stats.onTimePercent !== null) {
    metrics.push({ label: t('profileStats.onTimeReturns', 'Devoluções a tempo'), value: `${stats.onTimePercent}%` });
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-muted-foreground mb-3">{t('profileStats.title')}</p>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="border border-border rounded-md p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-sans">{m.label}</p>
            <p className="text-[28px] font-serif text-foreground leading-tight">{m.value}</p>
          </div>
        ))}

        {stats.avgRating !== null && (
          <div className="border border-border rounded-md p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-sans">{t('profileStats.avgRating')}</p>
            <p className="text-[28px] font-serif text-foreground leading-tight">{stats.avgRating}</p>
          </div>
        )}

        {stats.topGenre && (
          <div className="border border-border rounded-md p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-sans">{t('profileStats.topGenre')}</p>
            <Badge variant="secondary" className="mt-2 bg-accent/20 text-accent-foreground text-xs">{tGenre(stats.topGenre, t)}</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
