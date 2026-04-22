import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { fetchPublicReputations } from '@/lib/loanReputation';
import { resolveAvatarSrc } from '@/lib/avatars';

interface PendingRequest {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string | null;
  book_cover_url: string | null;
  message: string | null;
  requester_user_id: string;
  requested_at: string;
}

interface RequesterInfo { username: string | null; first_name: string | null; school_name: string | null; avatar_url: string | null; }

export default function PendingRequestsSection() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [info, setInfo] = useState<Record<string, RequesterInfo>>({});
  const [reputations, setReputations] = useState<Record<string, number>>({});
  const [acting, setActing] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('loan_requests' as any)
      .select('id, book_id, book_title, book_author, book_cover_url, message, requester_user_id, requested_at')
      .eq('owner_user_id', user.id)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });
    const rows = ((data || []) as unknown) as PendingRequest[];
    setRequests(rows);

    const ids = Array.from(new Set(rows.map(r => r.requester_user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, username, first_name, school_id, avatar_url')
        .in('user_id', ids);
      const schoolIds = Array.from(new Set((profs || []).map((p: any) => p.school_id).filter(Boolean)));
      const schoolMap = new Map<string, string>();
      if (schoolIds.length) {
        const { data: schools } = await supabase.from('schools').select('id, name').in('id', schoolIds as string[]);
        (schools || []).forEach((s: any) => schoolMap.set(s.id, s.name));
      }
      const map: Record<string, RequesterInfo> = {};
      (profs || []).forEach((p: any) => {
        map[p.user_id] = {
          username: p.username,
          first_name: p.first_name,
          avatar_url: p.avatar_url,
          school_name: p.school_id ? schoolMap.get(p.school_id) ?? null : null,
        };
      });
      setInfo(map);
      const reps = await fetchPublicReputations(ids);
      setReputations(reps);
    }
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`loan_requests_owner_${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'loan_requests', filter: `owner_user_id=eq.${user.id}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const accept = async (req: PendingRequest) => {
    if (!user) return;
    setActing(req.id);
    // Pull duration from book_availability
    const { data: avail } = await supabase
      .from('book_availability' as any)
      .select('loan_duration_days')
      .eq('book_id', req.book_id)
      .maybeSingle();
    const days = (avail as any)?.loan_duration_days ?? 14;
    const dueDate = new Date(Date.now() + days * 86400000).toISOString();

    const { error: updErr } = await supabase.from('loan_requests' as any).update({
      status: 'accepted',
      responded_at: new Date().toISOString(),
      due_date: dueDate,
    }).eq('id', req.id);

    if (updErr) {
      setActing(null);
      return toast.error(updErr.message);
    }

    // Create loan record
    await supabase.from('loans').insert({
      book_id: req.book_id,
      lender_id: user.id,
      borrower_user_id: req.requester_user_id,
      borrower_name: info[req.requester_user_id]?.username || info[req.requester_user_id]?.first_name || 'utilizador',
      loan_due_date: dueDate,
      loan_notifications_enabled: true,
    });

    // Mark availability as taken
    await supabase.from('book_availability' as any)
      .update({ is_available: false })
      .eq('book_id', req.book_id);

    toast.success(`Aceite. Combinem a entrega na vossa escola ou algures em segurança. Devolução até ${new Date(dueDate).toLocaleDateString('pt-PT')}.`, {
      duration: 7000,
    });
    setActing(null);
    load();
  };

  const reject = async (req: PendingRequest) => {
    setActing(req.id);
    const { error } = await supabase.from('loan_requests' as any).update({
      status: 'rejected',
      responded_at: new Date().toISOString(),
    }).eq('id', req.id);
    setActing(null);
    if (error) return toast.error(error.message);
    toast.success('Pedido recusado.');
    load();
  };

  if (!loaded || requests.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Inbox size={14} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Pedidos pendentes</p>
      </div>
      <div className="space-y-3">
        {requests.map((r) => {
          const meta = info[r.requester_user_id];
          const requesterLabel = meta?.username || meta?.first_name || 'utilizador';
          return (
            <div key={r.id} className="flex gap-3 p-3 border border-border rounded-md bg-card">
              {r.book_cover_url ? (
                <img src={r.book_cover_url} alt={r.book_title} className="w-12 h-16 object-cover rounded shrink-0" />
              ) : (
                <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">{r.book_title}</p>
                <p className="text-[11px] text-muted-foreground">
                  <img src={resolveAvatarSrc(meta?.avatar_url)} alt="" className="mr-1 inline h-4 w-4 rounded-full border border-border object-cover align-middle" />@{requesterLabel}{meta?.school_name ? ` · ${meta.school_name}` : ''}{reputations[r.requester_user_id] !== undefined ? ` · ${reputations[r.requester_user_id]}% devoluções a tempo` : ''}
                </p>
                {r.message && (
                  <p className="text-xs text-foreground italic border-l-2 border-border pl-2">"{r.message}"</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="h-7 text-xs" disabled={acting === r.id} onClick={() => accept(r)}>
                    Aceitar
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" disabled={acting === r.id} onClick={() => reject(r)}>
                    Recusar
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
