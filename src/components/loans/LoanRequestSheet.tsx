import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface LoanRequestBook {
  book_id: string;
  owner_user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
}

interface Props {
  book: LoanRequestBook | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSent?: () => void;
}

const DURATIONS = [
  { days: 7, labelKey: 'loans.duration.week1', fallback: '1 semana' },
  { days: 14, labelKey: 'loans.duration.week2', fallback: '2 semanas' },
  { days: 21, labelKey: 'loans.duration.week3', fallback: '3 semanas' },
  { days: 30, labelKey: 'loans.duration.month1', fallback: '1 mês' },
];

const schema = z.object({
  email: z.string().trim().email().max(255),
  duration: z.number().int().positive().max(365),
});

export default function LoanRequestSheet({ book, open, onOpenChange, onSent }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState(14);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user?.email) setEmail(user.email);
  }, [open, user?.email]);

  if (!book) return null;

  const submit = async () => {
    if (!user) return;
    const parsed = schema.safeParse({ email: email.trim(), duration });
    if (!parsed.success) {
      toast.error(t('loans.invalidEmail', 'Email inválido.'));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('loan_requests' as any).insert({
      requester_user_id: user.id,
      owner_user_id: book.owner_user_id,
      book_id: book.book_id,
      book_title: book.title,
      book_author: book.author,
      book_cover_url: book.cover_url,
      book_isbn: book.isbn,
      requester_email: parsed.data.email,
      requested_duration_days: parsed.data.duration,
      status: 'pending',
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t('loans.sent', 'Pedido enviado.'));
    onOpenChange(false);
    onSent?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-['Cormorant_Garamond'] text-2xl">
            {t('loans.requestTitle', 'Solicitar empréstimo')}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-5 space-y-5">
          <div className="flex gap-3">
            {book.cover_url ? (
              <img src={book.cover_url} alt="" style={{ width: 52, height: 72 }} className="object-cover rounded-sm shrink-0" />
            ) : (
              <div style={{ width: 52, height: 72 }} className="bg-secondary rounded-sm flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-['Cormorant_Garamond'] text-lg leading-tight text-foreground">{book.title}</p>
              {book.author && <p className="text-xs text-muted-foreground mt-1">{book.author}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-[Josefin_Sans]">
              {t('loans.contactEmail', 'O teu email de contacto')}
            </label>
            <Input
              type="email"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-[Josefin_Sans]">
              {t('loans.desiredDuration', 'Duração pretendida')}
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.days}
                  type="button"
                  onClick={() => setDuration(d.days)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    duration === d.days
                      ? 'border-foreground bg-secondary text-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {t(d.labelKey, d.fallback)}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed font-[Josefin_Sans]">
            {t('loans.contactNote', 'O proprietário do livro será notificado e entrará em contacto contigo por email para combinar a entrega.')}
          </p>

          <Button className="w-full" disabled={saving} onClick={submit}>
            {saving ? t('common.saving', 'A enviar…') : t('loans.send', 'Enviar pedido')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
