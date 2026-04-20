import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToStorage } from '@/lib/storage';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';

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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setLibraryName(card?.library_name || card?.name || '');
      setLocation(card?.location || '');
      setCardNumber(card?.card_number || '');
      setMemberSince(card?.member_since || '');
      setHasExpiry(!!card?.expiry_date);
      setExpiryDate(card?.expiry_date || '');
      setPhotoUrl(card?.photo_url || null);
      setPhotoFile(null);
    }
  }, [open, card]);

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
  };

  const save = async () => {
    if (!user || !libraryName.trim()) return;
    setSaving(true);

    // Insert/update first to get an id, then upload photo (if any) and patch.
    const basePayload: any = {
      user_id: user.id,
      name: libraryName.trim(), // keep legacy required field
      library_name: libraryName.trim(),
      location: location.trim() || null,
      card_number: cardNumber.trim() || null,
      member_since: memberSince || null,
      expiry_date: hasExpiry && expiryDate ? expiryDate : null,
      // If user explicitly removed an existing photo, clear it.
      photo_url: photoUrl === null && !photoFile ? null : (card?.photo_url ?? null),
    };

    let recordId = card?.id;
    if (recordId) {
      await (supabase.from('library_cards' as any).update(basePayload).eq('id', recordId));
    } else {
      const { data: inserted } = await (supabase
        .from('library_cards' as any)
        .insert(basePayload)
        .select('id')
        .single());
      recordId = (inserted as any)?.id;
    }

    if (photoFile && recordId) {
      const ext = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/${recordId}.${ext}`;
      const url = await uploadFileToStorage('library-card-photos', path, photoFile);
      if (url) {
        await (supabase.from('library_cards' as any).update({ photo_url: url }).eq('id', recordId));
      }
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
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoFile}
            />
            {photoUrl ? (
              <div className="relative inline-block">
                <img
                  src={photoUrl}
                  alt=""
                  className="max-h-40 rounded border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-muted"
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => photoInputRef.current?.click()}
                className="w-full text-sm"
              >
                <Upload size={14} className="mr-2" />
                {t('libraryCard.fields.uploadPhoto', 'Upload photo')}
              </Button>
            )}
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
