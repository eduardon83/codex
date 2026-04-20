import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { syncBookAvailability, getBookAvailability } from '@/lib/bookAvailability';
import { toast } from 'sonner';

interface Props {
  book: {
    id: string;
    user_id: string;
    title: string;
    author: string | null;
    isbn: string | null;
    cover_url: string | null;
  };
}

const DURATIONS = [7, 14, 21, 30];

export default function BookLendingToggle({ book }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [duration, setDuration] = useState(14);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getBookAvailability(book.id).then((row) => {
      if (row) { setEnabled(row.is_available); setDuration(row.loan_duration_days); }
      setLoaded(true);
    });
  }, [book.id]);

  const toggle = async (next: boolean) => {
    setEnabled(next);
    const { error } = await syncBookAvailability(book, { isAvailable: next, loanDurationDays: duration });
    if (error) { setEnabled(!next); toast.error(error); return; }
    toast.success(next ? 'Disponível para empréstimo' : 'Removido da partilha');
  };

  const changeDuration = async (d: number) => {
    setDuration(d);
    if (!enabled) return;
    await syncBookAvailability(book, { isAvailable: true, loanDurationDays: d });
  };

  if (!loaded) return null;

  return (
    <div className="space-y-3 border border-border rounded-md p-3 bg-card">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-muted-foreground">Disponível para empréstimo na tua escola e distrito</label>
        <Switch checked={enabled} onCheckedChange={toggle} />
      </div>
      {enabled && (
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Duração máxima:</p>
          <div className="flex gap-1.5">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => changeDuration(d)}
                className={`text-xs px-3 py-1 border rounded-full transition-colors ${
                  duration === d
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {d} dias
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
