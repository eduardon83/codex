import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarEvent {
  date: string; // yyyy-mm-dd
  type: 'loan' | 'borrow' | 'card';
  title: string;
  subtitle?: string;
  bookId?: string;
}

interface Props {
  onBack: () => void;
  onOpenBook?: (bookId: string) => void;
}

const DOT_COLORS = {
  loan: 'bg-amber-500',
  borrow: 'bg-red-500',
  card: 'bg-purple-500',
};

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const DOW_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function CalendarScreen({ onBack, onOpenBook }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const all: CalendarEvent[] = [];
      // Loans I gave (loan_due_date)
      const { data: loans } = await supabase
        .from('loans')
        .select('id, loan_due_date, book_id, borrower_name, books(title)')
        .eq('lender_id', user.id)
        .eq('is_active', true);
      (loans || []).forEach((l: any) => {
        if (l.loan_due_date) {
          all.push({
            date: ymd(new Date(l.loan_due_date)),
            type: 'loan',
            title: l.books?.title || t('library.unknownAuthor'),
            subtitle: l.borrower_name || '',
            bookId: l.book_id,
          });
        }
      });
      // Borrowed books (return_by_date)
      const { data: borrowed } = await supabase
        .from('books')
        .select('id, title, return_by_date, borrowed_from')
        .eq('user_id', user.id)
        .eq('is_borrowed', true)
        .not('return_by_date', 'is', null);
      (borrowed || []).forEach((b: any) => {
        all.push({
          date: ymd(new Date(b.return_by_date)),
          type: 'borrow',
          title: b.title,
          subtitle: b.borrowed_from || '',
          bookId: b.id,
        });
      });
      // Library card expiries
      const { data: cards } = await supabase
        .from('library_cards' as any)
        .select('id, name, library_name, expiry_date')
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null);
      (cards as any || []).forEach((c: any) => {
        all.push({
          date: c.expiry_date,
          type: 'card',
          title: c.library_name || c.name,
        });
      });
      // Codex loan_requests with due_date (both as owner and as borrower)
      const { data: loanReqs } = await supabase
        .from('loan_requests' as any)
        .select('id, due_date, book_id, book_title, owner_user_id, requester_user_id, status')
        .or(`owner_user_id.eq.${user.id},requester_user_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .not('due_date', 'is', null);
      ((loanReqs as any[]) || []).forEach((r) => {
        const isOwner = r.owner_user_id === user.id;
        all.push({
          date: ymd(new Date(r.due_date)),
          type: isOwner ? 'loan' : 'borrow',
          title: r.book_title,
          bookId: r.book_id,
        });
      });
      setEvents(all);
    })();
  }, [user, t]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(e => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    });
    return map;
  }, [events]);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0);
  const startWeekday = monthStart.getDay();
  const totalCells = Math.ceil((startWeekday + monthEnd.getDate()) / 7) * 7;
  const today = ymd(new Date());

  const cells: (Date | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1;
    if (dayNum < 1 || dayNum > monthEnd.getDate()) cells.push(null);
    else cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), dayNum));
  }

  const goPrev = () => { const d = new Date(cursor); d.setMonth(d.getMonth()-1); setCursor(d); setSelectedDate(null); };
  const goNext = () => { const d = new Date(cursor); d.setMonth(d.getMonth()+1); setCursor(d); setSelectedDate(null); };

  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) || []) : [];

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in bg-background">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} aria-label={t('common.back', 'Voltar')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="text-foreground" style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.75rem', color: 'hsl(var(--accent, var(--foreground)))' }}>{t('calendar.title', 'Calendário')}</h1>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={goPrev} aria-label={t('calendar.prevMonth', 'Mês anterior')} className="p-2 text-muted-foreground hover:text-foreground"><ChevronLeft size={18} aria-hidden="true" /></button>
        <p className="font-serif text-lg text-foreground">
          {t(`calendar.month.${MONTH_KEYS[cursor.getMonth()]}`)} {cursor.getFullYear()}
        </p>
        <button onClick={goNext} aria-label={t('calendar.nextMonth', 'Próximo mês')} className="p-2 text-muted-foreground hover:text-foreground"><ChevronRight size={18} aria-hidden="true" /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DOW_KEYS.map(d => (
          <div key={d} className="text-[10px] uppercase tracking-wider text-muted-foreground py-1">
            {t(`calendar.dow.${d}`)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const key = ymd(d);
          const dayEvents = eventsByDate.get(key) || [];
          const isToday = key === today;
          const isSelected = key === selectedDate;
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(key)}
              className={`aspect-square rounded flex flex-col items-center justify-center text-sm transition-colors relative ${
                isSelected ? 'bg-foreground text-background'
                : isToday ? 'border border-foreground text-foreground'
                : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span>{d.getDate()}</span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 absolute bottom-1">
                  {Array.from(new Set(dayEvents.map(e => e.type))).slice(0, 3).map(type => (
                    <span key={type} className={`w-1 h-1 rounded-full ${DOT_COLORS[type as keyof typeof DOT_COLORS]}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-[10px] text-muted-foreground" style={{ fontFamily: '"Josefin Sans", sans-serif' }}>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {t('calendar.legendLoan', 'Empréstimo')}</div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {t('calendar.legendBorrow', 'Devolução')}</div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {t('calendar.legendCard', 'Cartão')}</div>
      </div>

      {/* Selected day events */}
      {selectedDate && (
        <div className="mt-6 border border-border rounded-md p-4 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: '"Josefin Sans", sans-serif' }}>
            {selectedDate}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('calendar.noEvents', 'Sem eventos.')}</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((e, i) => (
                <button
                  key={i}
                  onClick={() => e.bookId && onOpenBook?.(e.bookId)}
                  disabled={!e.bookId}
                  className={`w-full flex items-start gap-3 text-left ${e.bookId ? 'hover:opacity-70' : ''}`}
                >
                  <span className={`mt-1.5 w-2 h-2 rounded-full ${DOT_COLORS[e.type]} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground flex items-center gap-1.5">
                      {e.type === 'card' ? <CreditCard size={12} /> : <BookOpen size={12} />}
                      {e.title}
                    </p>
                    {e.subtitle && <p className="text-xs text-muted-foreground">{e.subtitle}</p>}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      {t(`calendar.type.${e.type}`)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
