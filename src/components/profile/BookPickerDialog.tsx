import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PickableBook {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  genre: string | null;
  rating: number | null;
  notes: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (book: PickableBook) => void;
  filterStatus?: string; // e.g. 'Currently Reading'
  excludeIds?: Set<string>;
  title: string;
}

export default function BookPickerDialog({ open, onOpenChange, onSelect, filterStatus, excludeIds, title }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [books, setBooks] = useState<PickableBook[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open || !user) return;
    let q = supabase
      .from('books')
      .select('id, title, author, cover_url, isbn, genre, rating, notes')
      .eq('user_id', user.id)
      .eq('is_wishlist', false)
      .order('title');
    if (filterStatus) q = q.eq('reading_status', filterStatus);
    q.then(({ data }) => setBooks((data as PickableBook[]) || []));
  }, [open, user, filterStatus]);

  const filtered = useMemo(() => {
    const ql = query.trim().toLowerCase();
    return books.filter(b => {
      if (excludeIds?.has(b.id)) return false;
      if (!ql) return true;
      return b.title.toLowerCase().includes(ql) || (b.author || '').toLowerCase().includes(ql);
    });
  }, [books, query, excludeIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif">{title}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('library.searchPlaceholder')}
            className="pl-9 bg-background border-border"
          />
        </div>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">{t('library.emptyTitle')}</p>
          ) : (
            <div className="space-y-0">
              {filtered.map(book => (
                <button
                  key={book.id}
                  onClick={() => { onSelect(book); onOpenChange(false); }}
                  className="w-full flex items-center gap-3 py-3 border-b border-border text-left hover:bg-secondary/30 transition-colors"
                >
                  {book.cover_url ? (
                    <img src={book.cover_url} alt="" className="w-10 h-14 object-cover rounded-sm" />
                  ) : (
                    <div className="w-10 h-14 bg-secondary rounded-sm flex items-center justify-center">
                      <BookOpen size={16} className="text-muted-foreground" strokeWidth={1} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{book.author || t('library.unknownAuthor')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
