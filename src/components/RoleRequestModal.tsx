import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Store, PenLine, Megaphone, Loader2 } from 'lucide-react';

type ProRole = 'bookstore' | 'author' | 'influencer';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS: { value: ProRole; icon: typeof Store; titleKey: string; descKey: string }[] = [
  { value: 'bookstore', icon: Store, titleKey: 'roleRequest.bookstore.title', descKey: 'roleRequest.bookstore.desc' },
  { value: 'author', icon: PenLine, titleKey: 'roleRequest.author.title', descKey: 'roleRequest.author.desc' },
  { value: 'influencer', icon: Megaphone, titleKey: 'roleRequest.influencer.title', descKey: 'roleRequest.influencer.desc' },
];

export default function RoleRequestModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selected, setSelected] = useState<ProRole | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<{ requested_role: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    setSelected(null);
    setMessage('');
    supabase
      .from('role_requests' as any)
      .select('requested_role, status')
      .eq('requester_user_id', user.id)
      .in('status', ['pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setExisting((data as any) ?? null);
        setLoading(false);
      });
  }, [open, user]);

  const submit = async () => {
    if (!user || !selected) return;
    if (message.trim().length < 10) {
      toast.error(t('roleRequest.errors.tooShort'));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('role_requests' as any).insert({
      requester_user_id: user.id,
      requested_role: selected,
      message: message.trim(),
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t('roleRequest.success'));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Cormorant_Garamond'] text-2xl">{t('roleRequest.title')}</DialogTitle>
          <DialogDescription>{t('roleRequest.subtitle')}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : existing ? (
          <div className="py-4 space-y-2">
            <Badge variant="secondary">{t(`roleRequest.${existing.requested_role}.title`)}</Badge>
            <p className="text-sm text-muted-foreground">{t('roleRequest.pendingNotice')}</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-2">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelected(opt.value)}
                    className={`text-left flex items-start gap-3 p-3 border rounded-md transition-colors ${active ? 'border-foreground bg-muted/40' : 'border-border hover:border-foreground/60'}`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t(opt.titleKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(opt.descKey)}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role-msg" className="text-xs uppercase tracking-wider text-muted-foreground">{t('roleRequest.messageLabel')}</Label>
              <Textarea
                id="role-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder={t('roleRequest.messagePlaceholder')}
                rows={4}
              />
              <p className="text-[11px] text-muted-foreground text-right">{message.length}/1000</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel', 'Cancelar')}</Button>
          {!existing && (
            <Button onClick={submit} disabled={!selected || submitting || message.trim().length < 10}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('roleRequest.submit')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
