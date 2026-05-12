import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Check, X, Bell, CalendarPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MIN_KEY = 'codex_loan_banner_minimized';

export interface LoanRow {
  id: string;
  status: string;
  requester_user_id: string;
  owner_user_id: string;
  book_id: string;
  book_title: string;
  requested_duration_days: number | null;
  requester_email: string | null;
  due_date: string | null;
  responded_at: string | null;
  requester_seen_response: boolean;
  requester_username?: string | null;
  owner_username?: string | null;
}

interface UsernameMap { [userId: string]: string }

export function emitLoanRefresh() {
  window.dispatchEvent(new CustomEvent('codex-loan-refresh'));
}

export function emitBannerToggle(minimized: boolean) {
  localStorage.setItem(MIN_KEY, minimized ? '1' : '0');
  window.dispatchEvent(new CustomEvent('codex-loan-banner-toggle', { detail: { minimized } }));
}

export function useLoanNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<LoanRow[]>([]);
  const [usernames, setUsernames] = useState<UsernameMap>({});

  const load = async () => {
    if (!user) { setItems([]); return; }
    // pending requests as owner + responded-but-unseen requests as requester + accepted active loans as owner
    const { data: ownerPending } = await supabase
      .from('loan_requests' as any)
      .select('*')
      .eq('owner_user_id', user.id)
      .eq('status', 'pending');
    const { data: requesterUnseen } = await supabase
      .from('loan_requests' as any)
      .select('*')
      .eq('requester_user_id', user.id)
      .in('status', ['accepted', 'rejected'])
      .eq('requester_seen_response', false);
    const all = [...((ownerPending as any) || []), ...((requesterUnseen as any) || [])] as LoanRow[];
    setItems(all);

    const ids = Array.from(new Set(all.flatMap((r) => [r.requester_user_id, r.owner_user_id])));
    if (ids.length) {
      const { data: profs } = await supabase
        .from('public_profiles')
        .select('user_id, username, first_name')
        .in('user_id', ids);
      const map: UsernameMap = {};
      (profs as any[] || []).forEach((p) => { map[p.user_id] = p.username || p.first_name || 'utilizador'; });
      setUsernames(map);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('codex-loan-refresh', handler);
    if (!user) return () => window.removeEventListener('codex-loan-refresh', handler);
    const channel = supabase
      .channel(`loan_notifications_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_requests', filter: `owner_user_id=eq.${user.id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_requests', filter: `requester_user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => {
      window.removeEventListener('codex-loan-refresh', handler);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { items, usernames, reload: load };
}

export function LoanBellBadge() {
  const { items } = useLoanNotifications();
  const [minimized, setMinimized] = useState<boolean>(() => localStorage.getItem(MIN_KEY) === '1');

  useEffect(() => {
    const handler = (e: Event) => setMinimized(!!(e as CustomEvent).detail?.minimized);
    window.addEventListener('codex-loan-banner-toggle', handler);
    return () => window.removeEventListener('codex-loan-banner-toggle', handler);
  }, []);

  if (items.length === 0 || !minimized) return null;

  return (
    <button
      onClick={() => emitBannerToggle(false)}
      aria-label="Ver notificações de empréstimo"
      className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
    >
      <Bell size={18} />
      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-medium flex items-center justify-center">
        {items.length}
      </span>
    </button>
  );
}

export default function LoanNotifications() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, usernames, reload } = useLoanNotifications();
  const [minimized, setMinimized] = useState<boolean>(() => localStorage.getItem(MIN_KEY) === '1');
  const [dueDates, setDueDates] = useState<Record<string, string>>({});
  const [acceptedExpanded, setAcceptedExpanded] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => setMinimized(!!(e as CustomEvent).detail?.minimized);
    window.addEventListener('codex-loan-banner-toggle', handler);
    return () => window.removeEventListener('codex-loan-banner-toggle', handler);
  }, []);

  if (!user || items.length === 0 || minimized) return null;

  const handleAccept = async (row: LoanRow) => {
    const { error } = await supabase
      .from('loan_requests' as any)
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', row.id);
    if (error) return toast.error(error.message);
    await supabase
      .from('book_availability' as any)
      .update({ is_available: false })
      .eq('book_id', row.book_id)
      .eq('owner_user_id', user.id);
    setAcceptedExpanded(row.id);
    reload();
  };

  const handleReject = async (row: LoanRow) => {
    const { error } = await supabase
      .from('loan_requests' as any)
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', row.id);
    if (error) return toast.error(error.message);
    toast.success(t('loans.rejected', 'Pedido rejeitado.'));
    reload();
  };

  const saveDueDate = async (row: LoanRow) => {
    const date = dueDates[row.id];
    if (!date) {
      // mark seen / dismiss without date
      await supabase
        .from('loan_requests' as any)
        .update({ requester_seen_response: true })
        .eq('id', row.id);
      setAcceptedExpanded(null);
      reload();
      return;
    }
    const iso = new Date(date + 'T12:00:00').toISOString();
    await supabase
      .from('loan_requests' as any)
      .update({ due_date: iso, requester_seen_response: true })
      .eq('id', row.id);
    toast.success(t('loans.calendarSaved', 'Data registada no calendário.'));
    setAcceptedExpanded(null);
    reload();
  };

  const dismissResponse = async (row: LoanRow) => {
    await supabase
      .from('loan_requests' as any)
      .update({ requester_seen_response: true })
      .eq('id', row.id);
    reload();
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-[Josefin_Sans]">
          {t('loans.notifications', 'Empréstimos')}
        </p>
        <button
          onClick={() => emitBannerToggle(true)}
          aria-label={t('loans.minimize', 'Minimizar')}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>

      {items.map((row) => {
        const isOwnerPending = row.owner_user_id === user.id && row.status === 'pending';
        const isRequesterResponse = row.requester_user_id === user.id;
        const username = isOwnerPending
          ? usernames[row.requester_user_id] || 'utilizador'
          : usernames[row.owner_user_id] || 'utilizador';

        return (
          <div key={row.id} className="border border-border rounded-md bg-card p-3">
            {isOwnerPending && (
              <>
                <p className="text-sm text-foreground leading-snug">
                  {t('loans.ownerBanner', 'Tens um pedido de empréstimo para')}{' '}
                  <span className="font-['Cormorant_Garamond'] italic">{row.book_title}</span>.{' '}
                  <span className="text-muted-foreground">
                    @{username} {t('loans.wantsItFor', 'quer o livro por')}{' '}
                    {row.requested_duration_days || '-'} {t('loans.days', 'dias')}.
                  </span>
                </p>
                {row.requester_email && (
                  <p className="mt-1 text-xs text-muted-foreground break-all">
                    {t('loans.contact', 'Contacto')}: {row.requester_email}
                  </p>
                )}
                {acceptedExpanded === row.id ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {t('loans.afterAcceptOwner', 'Empréstimo aceite. Quando acordares a devolução com')} @{username},{' '}
                      {t('loans.registerDate', 'regista a data para o teu calendário.')}
                    </p>
                    <Input
                      type="date"
                      value={dueDates[row.id] || ''}
                      onChange={(e) => setDueDates({ ...dueDates, [row.id]: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => { setAcceptedExpanded(null); reload(); }}>
                        {t('common.skip', 'Ignorar')}
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => saveDueDate(row)}>
                        <CalendarPlus size={14} className="mr-1" />
                        {t('loans.registerCalendar', 'Registar no calendário')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReject(row)}>
                      {t('loans.reject', 'Rejeitar')}
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleAccept(row)}>
                      <Check size={14} className="mr-1" />
                      {t('loans.accept', 'Aceitar')}
                    </Button>
                  </div>
                )}
              </>
            )}

            {isRequesterResponse && (
              <>
                <p className="text-sm text-foreground leading-snug">
                  {t('loans.requesterBanner', 'O teu pedido de empréstimo de')}{' '}
                  <span className="font-['Cormorant_Garamond'] italic">{row.book_title}</span>{' '}
                  {t('loans.was', 'foi')}{' '}
                  <span className={row.status === 'accepted' ? 'text-emerald-700' : 'text-destructive'}>
                    {row.status === 'accepted' ? t('loans.accepted', 'aceite') : t('loans.rejectedLabel', 'rejeitado')}
                  </span>.
                </p>
                {row.status === 'accepted' ? (
                  acceptedExpanded === row.id ? (
                    <div className="mt-3 space-y-2">
                      <Input
                        type="date"
                        value={dueDates[row.id] || ''}
                        onChange={(e) => setDueDates({ ...dueDates, [row.id]: e.target.value })}
                      />
                      <Button size="sm" className="w-full" onClick={() => saveDueDate(row)}>
                        <CalendarPlus size={14} className="mr-1" />
                        {t('loans.registerCalendar', 'Registar no calendário')}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => dismissResponse(row)}>
                        {t('common.ok', 'Ok')}
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => setAcceptedExpanded(row.id)}>
                        <CalendarPlus size={14} className="mr-1" />
                        {t('loans.registerReturn', 'Registar data de devolução')}
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => dismissResponse(row)}>
                      {t('common.ok', 'Ok')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
