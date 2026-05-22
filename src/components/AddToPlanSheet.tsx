import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface PlanBookPayload {
  book_id?: string | null;
  isbn?: string | null;
  title: string;
  author?: string | null;
  cover_url?: string | null;
}

interface AddToPlanSheetProps {
  book: PlanBookPayload | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoActivePlan?: () => void;
}

interface ReadingPlan {
  id: string;
  name: string;
  started_at: string | null;
  ends_at: string | null;
}

const PLAN_LOCALE_MAP: Record<string, string> = { pt: 'pt-PT', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };

export function buildPlanMonths(start?: string | null, end?: string | null, lang: string = 'pt') {
  const monthFormatter = new Intl.DateTimeFormat(PLAN_LOCALE_MAP[lang] || lang || 'pt-PT', { month: 'long', year: 'numeric' });
  const base = start ? new Date(`${start}T00:00:00`) : new Date();
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const last = end ? new Date(`${end}T00:00:00`) : new Date(first.getFullYear(), first.getMonth() + 11, 1);
  const months: { value: string; label: string }[] = [];
  const cursor = new Date(first);
  while (cursor <= last && months.length < 36) {
    const value = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    months.push({ value, label: monthFormatter.format(cursor) });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export default function AddToPlanSheet({ book, open, onOpenChange, onNoActivePlan }: AddToPlanSheetProps) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [savingMonth, setSavingMonth] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from('reading_plans' as any)
      .select('id, name, started_at, ends_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('is_template', false)
      .maybeSingle()
      .then(({ data }) => {
        const activePlan = (data as unknown as ReadingPlan | null) || null;
        setPlan(activePlan);
        if (!activePlan) {
          onOpenChange(false);
          onNoActivePlan?.();
        }
      });
  }, [open, user, onOpenChange, onNoActivePlan]);

  const months = useMemo(() => buildPlanMonths(plan?.started_at, plan?.ends_at, i18n.language), [plan, i18n.language]);

  const addToMonth = async (month: string, label: string) => {
    if (!user || !plan || !book) return;
    setSavingMonth(month);
    const { data: maxRows } = await supabase
      .from('reading_plan_items' as any)
      .select('priority')
      .eq('plan_id', plan.id)
      .eq('target_month', month)
      .order('priority', { ascending: false })
      .limit(1);
    const priority = ((maxRows?.[0] as any)?.priority ?? -1) + 1;
    const { error } = await supabase.from('reading_plan_items' as any).insert({
      plan_id: plan.id,
      book_id: book.book_id || null,
      isbn: book.isbn || null,
      title: book.title,
      author: book.author || null,
      cover_url: book.cover_url || null,
      target_month: month,
      priority,
      status: 'planned',
    });
    setSavingMonth(null);
    if (error) return toast.error(error.message);
    toast.success(`Adicionado ao plano de ${label}.`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[75vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">Adicionar ao plano</SheetTitle>
        </SheetHeader>
        {plan && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarPlus size={16} />
              <span className="truncate">{plan.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {months.map((month) => (
                <Button key={month.value} variant="outline" className="justify-start text-xs h-11" disabled={savingMonth === month.value} onClick={() => addToMonth(month.value, month.label)}>
                  {savingMonth === month.value ? <Check size={14} className="mr-2" /> : null}
                  {month.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
