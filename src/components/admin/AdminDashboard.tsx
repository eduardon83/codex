import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, Library, Handshake, Heart, TrendingUp } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';
import { tGenre } from '@/lib/displayMappings';

interface Stats {
  total_users: number;
  total_books: number;
  total_libraries: number;
  active_loans: number;
  wishlist_entries: number;
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  users_trend_30d: { date: string; count: number }[];
  top_books: { isbn: string; title: string; author: string; add_count: number }[];
  top_genres: { genre: string; count: number }[];
}

function Sparkline({ data }: { data: { count: number }[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const h = 32;
  const w = 120;
  const points = data.map((d, i) =>
    `${(i / (data.length - 1)) * w},${h - (d.count / max) * (h - 4) - 2}`
  ).join(' ');

  return (
    <svg width={w} height={h} className="text-primary">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
    </svg>
  );
}

const metricCards = [
  { key: 'total_users', label: 'Total Users', icon: Users },
  { key: 'total_books', label: 'Total Books', icon: BookOpen },
  { key: 'total_libraries', label: 'Libraries', icon: Library },
  { key: 'active_loans', label: 'Active Loans', icon: Handshake },
  { key: 'wishlist_entries', label: 'Wishlist', icon: Heart },
] as const;

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data, error } = await supabase.rpc('admin_get_stats');
    if (!error && data) {
      setStats(data as unknown as Stats);
    }
    setLoading(false);
  };

  if (loading) {
    return <p className="text-muted-foreground text-sm font-['Josefin_Sans']">Loading dashboard…</p>;
  }

  if (!stats) {
    return <p className="text-destructive text-sm">Failed to load statistics.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground text-sm font-['Josefin_Sans'] mt-1">Live platform statistics</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans'] text-muted-foreground">{label}</span>
              </div>
              <p className="font-['Cormorant_Garamond'] text-3xl font-semibold text-foreground">
                {stats[key].toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New users + trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans'] text-muted-foreground">New Users</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-['Josefin_Sans'] text-muted-foreground">Today</p>
                <p className="font-['Cormorant_Garamond'] text-2xl font-semibold">{stats.new_users_today}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-['Josefin_Sans'] text-muted-foreground">This Week</p>
                <p className="font-['Cormorant_Garamond'] text-2xl font-semibold">{stats.new_users_week}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-['Josefin_Sans'] text-muted-foreground">This Month</p>
                <p className="font-['Cormorant_Garamond'] text-2xl font-semibold">{stats.new_users_month}</p>
              </div>
            </div>
            <div className="mt-4">
              <Sparkline data={stats.users_trend_30d} />
              <p className="text-[10px] text-muted-foreground font-['Josefin_Sans'] mt-1">Last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans'] text-muted-foreground">Top Genres</span>
            <div className="mt-3 space-y-2">
              {stats.top_genres.map((g) => (
                <div key={g.genre} className="flex items-center justify-between">
                  <span className="text-sm font-['Josefin_Sans'] text-foreground">{tGenre(g.genre, t)}</span>
                  <span className="text-xs text-muted-foreground font-mono">{g.count}</span>
                </div>
              ))}
              {stats.top_genres.length === 0 && (
                <p className="text-sm text-muted-foreground">No genre data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top books */}
      <Card>
        <CardContent className="p-5">
          <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans'] text-muted-foreground">Most Added Books (Top 10)</span>
          <div className="mt-3 space-y-2">
            {stats.top_books.map((b, i) => (
              <div key={b.isbn} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono w-5">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-['Josefin_Sans'] text-foreground truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.author}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{b.add_count}×</span>
              </div>
            ))}
            {stats.top_books.length === 0 && (
              <p className="text-sm text-muted-foreground">No book data yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
