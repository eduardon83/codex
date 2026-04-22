import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AVATARS, AvatarId } from '@/lib/avatars';

interface AvatarPickerDialogProps {
  open: boolean;
  value?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (avatarId: AvatarId) => void;
}

export default function AvatarPickerDialog({ open, value, onOpenChange, onConfirm }: AvatarPickerDialogProps) {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState<AvatarId>((value as AvatarId) || AVATARS[0].id);
  const [expanded, setExpanded] = useState<string | null>(null);
  const useEnglishNames = i18n.language?.startsWith('en');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto bg-background border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">{t('avatars.choose')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {AVATARS.map((avatar) => {
            const isSelected = selected === avatar.id;
            const isExpanded = expanded === avatar.id;
            return (
              <div key={avatar.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelected(avatar.id)}
                  className={`relative w-full rounded-md border bg-card p-2 text-card-foreground transition-colors ${
                    isSelected ? 'border-gold' : 'border-border hover:border-foreground'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-gold text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <img src={avatar.file} alt={avatar.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
                  <span className="mt-2 block pr-5 text-center text-xs text-foreground">
                    {useEnglishNames ? avatar.nameEn : avatar.name}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : avatar.id)}
                  className="mx-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  aria-label={t('avatars.info')}
                >
                  <Info className="h-3 w-3" /> {t('avatars.info')}
                </button>
                {isExpanded && (
                  <p className="rounded-md border border-border bg-secondary/40 p-2 text-[11px] leading-snug text-muted-foreground">
                    {avatar.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <Button onClick={() => onConfirm(selected)} className="w-full">
          {t('avatars.confirm')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}