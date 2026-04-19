import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Camera } from 'lucide-react';

export interface LibraryCardRecord {
  id?: string;
  library_name: string | null;
  name?: string | null; // legacy
  location: string | null;
  card_number: string | null;
  member_since: string | null;
  expiry_date: string | null;
  photo_url: string | null;
  notes?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  card: LibraryCardRecord | null;
  onSaved: () => void;
}

export default function LibraryCardEditor({ open, onClose, card, onSaved }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [libraryName, setLibraryName] = useState('');
  const [location, setLocation] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLibraryName(card?.library_name || card?.name || '');
      setLocation(card?.location || '');
      setCardNumber(card?.card_number || '');
      setMemberSince(card?.member_since || '');
      setHasExpiry(!!card?.expiry_date);
      setExpiryDate(card?.expiry_date || '');
    }
  }, [open, card]);

  const save = async () => {
    if (!user || !libraryName.trim()) return;
    setSaving(true);
    const payload: any = {
      user_id: user.id,
      name: libraryName.trim(), // keep legacy required field
      library_name: libraryName.trim(),
      location: location.trim() || null,
      card_number: cardNumber.trim() || null,
      member_since: memberSince || null,
      expiry_date: hasExpiry && expiryDate ? expiryDate : null,
    };
    if (card?.id) {
      await (supabase.from('library_cards' as any).update(payload).eq('id', card.id));
    } else {
      await (supabase.from('library_cards' as any).insert(payload));
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle style={{ fontFamily: '"Cormorant Garamond", serif' }} className="text-2xl">
            {card?.id ? t('libraryCard.edit') : t('libraryCard.add')}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1 block">
              {t('libraryCard.fields.libraryName')}
            </label>
            <Input value={libraryName} onChange={(e) => setLibraryName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1 block">
              {t('libraryCard.fields.location')}
            </label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1 block">
              {t('libraryCard.fields.cardNumber')}
            </label>
            <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1 block">
              {t('libraryCard.fields.memberSince')}
            </label>
            <Input type="date" value={memberSince} onChange={(e) => setMemberSince(e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('libraryCard.fields.expiryDate')}
              </label>
              <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
            </div>
            {hasExpiry && (
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1 block">
              {t('libraryCard.fields.photo')}
            </label>
            <div className="border border-dashed border-border rounded p-4 flex items-center gap-2 text-muted-foreground text-sm">
              <Camera size={16} />
              <span>{t('libraryCard.fields.photoSoon')}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">{t('profile.cancel')}</Button>
            <Button onClick={save} disabled={saving || !libraryName.trim()} className="flex-1">
              {t('profile.save')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
