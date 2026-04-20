import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, AlertCircle, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveLoanRow {
  id: string;
  status: string;
  book_id: string;
  book_title: string;
  book_cover_url: string | null;
  due_date: string | null;
  borrower_confirmed_return: boolean;
  lender_confirmed_return: boolean;
  owner_user_id: string;
  requester_user_id: string;
}

const ACTIVE_STATUSES = ['accepted', 'in_progress', 'overdue'];

export default function ActiveLoansSection() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<ActiveLoanRow[]>([]);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('loan_requests' as any)
      .select('id, status, book_id, book_title, book_cover_url, due_date, borrower_confirmed_return, lender_confirmed_return, owner_user_id, requester_user_id')
      .or(`owner_user_id.eq.${user.id},requester_user_id.eq.${user.id}`)
      .in('status', ACTIVE_STATUSES)
      .order('due_date', { ascending: true });
    setLoans(((data || []) as unknown) as ActiveLoanRow[]);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`loan_requests_active_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_requests' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const markReturned = async (loan: ActiveLoanRow) => {
    if (!user) return;
    setActing(loan.id);
    const isLender = loan.owner_user_id === user.id;
    const updates: Record<string, any> = isLender
      ? { lender_confirmed_return: true }
      : { borrower_confirmed_return: true };

    const otherConfirmed = isLender ? loan.borrower_confirmed_return : loan.lender_confirmed_return;
    if (otherConfirmed) {
      updates.status = 'returned';
      updates.returned_at = new Date().toISOString();
    }

    const { error } = await supabase.from('loan_requests' as any).update(updates).eq('id', loan.id);
    setActing(null);
    if (error) return toast.error(error.message);

    if (otherConfirmed) {
      // Close active loan + free up availability
      await supabase.from('loans').update({
        is_active: false,
        return_date: new Date().toISOString(),
      }).eq('book_id', loan.book_id).eq('lender_id', loan.owner_user_id).eq('is_active', true);

      await supabase.from('book_availability' as any)
        .update({ is_available: true })
        .eq('book_id', loan.book_id);

      toast.success('Devolução confirmada.');
    } else {
      toast.success('Marcado como devolvido. À espera da outra parte.');
    }
    load();
  };

  if (loans.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={14} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Empréstimos activos</p>
      </div>
      <div className="space-y-3">
        {loans.map((l) => {
          const isLender = l.owner_user_id === user?.id;
          const youConfirmed = isLender ? l.lender_confirmed_return : l.borrower_confirmed_return;
          const overdue = l.status === 'overdue';
          return (
            <div key={l.id} className={`flex gap-3 p-3 border rounded-md ${overdue ? 'border-destructive bg-destructive/5' : 'border-border bg-card'}`}>
              {l.book_cover_url ? (
                <img src={l.book_cover_url} alt={l.book_title} className="w-12 h-16 object-cover rounded shrink-0" />
              ) : (
                <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">{l.book_title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isLender ? 'Emprestado por ti' : 'Pedido por ti'}
                  {l.due_date && ` · até ${new Date(l.due_date).toLocaleDateString('pt-PT')}`}
                </p>
                {overdue && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle size={10} /> Em atraso · vê o calendário
                  </p>
                )}
                <Button
                  size="sm"
                  variant={youConfirmed ? 'secondary' : 'outline'}
                  className="h-7 text-xs mt-1"
                  disabled={acting === l.id || youConfirmed}
                  onClick={() => markReturned(l)}
                >
                  {youConfirmed ? 'À espera da outra parte' : 'Marcar como devolvido'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
