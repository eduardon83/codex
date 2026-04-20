import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface HistoryRow {
  id: string;
  book_title: string;
  book_cover_url: string | null;
  status: string;
  requested_at: string;
  responded_at: string | null;
  due_date: string | null;
  returned_at: string | null;
  owner_user_id: string;
  requester_user_id: string;
}

interface Props { onBack: () => void; }

const FINAL_STATUSES = ['returned', 'rejected', 'overdue'];

function statusLabel(row: HistoryRow): { label: string; tone: 'ok' | 'warn' | 'bad' } {
  if (row.status === 'returned') {
    if (row.due_date && row.returned_at && new Date(row.returned_at) > new Date(row.due_date)) {
      return { label: 'Devolvido em atraso', tone: 'warn' };
    }
    return { label: 'Devolvido', tone: 'ok' };
  }
  if (row.status === 'overdue') return { label: 'Em atraso', tone: 'bad' };
  if (row.status === 'rejected') return { label: 'Recusado', tone: 'warn' };
  return { label: row.status, tone: 'warn' };
}

export default function LoanHistoryScreen({ onBack }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from('loan_requests' as any)
        .select('id, book_title, book_cover_url, status, requested_at, responded_at, due_date, returned_at, owner_user_id, requester_user_id')
        .or(`owner_user_id.eq.${user.id},requester_user_id.eq.${user.id}`)
        .in('status', FINAL_STATUSES)
        .order('requested_at', { ascending: false });
      const list = ((data || []) as unknown) as HistoryRow[];
      setRows(list);

      const otherIds = Array.from(new Set(list.map(r =>
        r.owner_user_id === user.id ? r.requester_user_id : r.owner_user_id
      )));
      if (otherIds.length) {
        const { data: profs } = await supabase
          .from('public_profiles')
          .select('user_id, username, first_name')
          .in('user_id', otherIds);
        const map: Record<string, string> = {};
        (profs || []).forEach((p: any) => {
          map[p.user_id] = p.username || p.first_name || 'utilizador';
        });
        setNames(map);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="px-2"><ArrowLeft size={16} /></Button>
        <h2 className="font-serif text-2xl text-foreground">Histórico de empréstimos</h2>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">A carregar…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">Ainda não tens empréstimos concluídos.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(r => {
            const isLender = r.owner_user_id === user?.id;
            const otherId = isLender ? r.requester_user_id : r.owner_user_id;
            const other = names[otherId] || 'utilizador';
            const s = statusLabel(r);
            const date = r.returned_at || r.responded_at || r.requested_at;
            return (
              <div key={r.id} className="flex gap-3 p-3 border border-border rounded-md bg-card">
                {r.book_cover_url ? (
                  <img src={r.book_cover_url} alt={r.book_title} className="w-12 h-16 object-cover rounded shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center shrink-0">
                    <BookOpen size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{r.book_title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {isLender ? `Emprestado a @${other}` : `Pedido a @${other}`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(date).toLocaleDateString('pt-PT')}
                  </p>
                  <p className={`text-[11px] mt-1 ${
                    s.tone === 'ok' ? 'text-foreground' :
                    s.tone === 'bad' ? 'text-destructive' :
                    'text-muted-foreground'
                  }`}>
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
