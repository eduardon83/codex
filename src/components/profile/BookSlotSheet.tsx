import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BookOpen, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SlotBook {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  rating?: number | null;
  notes?: string | null;
}

interface Props {
  book: SlotBook | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRemove?: () => void;
}

export default function BookSlotSheet({ book, open, onOpenChange, onRemove }: Props) {
  const { t } = useTranslation();
  if (!book) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-background border-border">
        <SheetHeader>
          <SheetTitle className="font-serif text-left">{book.title}</SheetTitle>
        </SheetHeader>
        <div className="flex gap-4 mt-4">
          {book.cover_url ? (
            <img src={book.cover_url} alt="" className="w-20 h-28 object-cover rounded-sm flex-shrink-0" />
          ) : (
            <div className="w-20 h-28 bg-secondary rounded-sm flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} className="text-muted-foreground" strokeWidth={1} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{book.author || t('library.unknownAuthor')}</p>
            {typeof book.rating === 'number' && book.rating > 0 && (
              <div className="flex items-center gap-0.5 mt-2">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={14} className={n <= (book.rating || 0) ? 'fill-gold text-gold' : 'text-muted-foreground'} strokeWidth={1} />
                ))}
              </div>
            )}
            {book.notes && (
              <p className="text-xs text-foreground mt-3 whitespace-pre-wrap">{book.notes}</p>
            )}
          </div>
        </div>
        {onRemove && (
          <Button
            variant="outline"
            onClick={() => { onRemove(); onOpenChange(false); }}
            className="w-full mt-6 flex items-center gap-2"
          >
            <X size={14} /> {t('profile.removeFromSection', 'Remover')}
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}
