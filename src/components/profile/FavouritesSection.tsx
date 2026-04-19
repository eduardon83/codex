import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Plus } from 'lucide-react';
import BookPickerDialog, { PickableBook } from './BookPickerDialog';
import BookSlotSheet, { SlotBook } from './BookSlotSheet';

interface Favourite {
  id: string;
  source_book_id: string | null;
  book_title: string;
  book_author: string | null;
  book_cover_url: string | null;
  position: number;
  // Hydrated from books table
  rating?: number | null;
  notes?: string | null;
}

const MAX_SLOTS = 5;

export default function FavouritesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [favs, setFavs] = useState<Favourite[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sheetBook, setSheetBook] = useState<SlotBook | null>(null);
  const [activeFavId, setActiveFavId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_favourites' as any)
      .select('id, source_book_id, book_title, book_author, book_cover_url, position')
      .eq('user_id', user.id)
      .order('position');
    const list = (data as any as Favourite[]) || [];
    // Hydrate ratings/notes from books table if linked
    const ids = list.map(f => f.source_book_id).filter(Boolean) as string[];
    if (ids.length) {
      const { data: bdata } = await supabase
        .from('books')
        .select('id, rating, notes')
        .in('id', ids);
      const map = new Map((bdata || []).map((b: any) => [b.id, b]));
      list.forEach(f => {
        if (f.source_book_id && map.has(f.source_book_id)) {
          const b: any = map.get(f.source_book_id);
          f.rating = b.rating;
          f.notes = b.notes;
        }
      });
    }
    setFavs(list);
  };

  useEffect(() => { load(); }, [user]);

  const addFavourite = async (book: PickableBook) => {
    if (!user) return;
    const nextPos = favs.length;
    await supabase.from('user_favourites' as any).insert({
      user_id: user.id,
      source_book_id: book.id,
      book_isbn: book.isbn,
      book_title: book.title,
      book_author: book.author,
      book_cover_url: book.cover_url,
      book_genre: book.genre,
      position: nextPos,
    } as any);
    load();
  };

  const removeFavourite = async (favId: string) => {
    await supabase.from('user_favourites' as any).delete().eq('id', favId);
    load();
  };

  const openSlot = (fav: Favourite) => {
    setActiveFavId(fav.id);
    setSheetBook({
      id: fav.id,
      title: fav.book_title,
      author: fav.book_author,
      cover_url: fav.book_cover_url,
      rating: fav.rating,
      notes: fav.notes,
    });
  };

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => favs[i] || null);
  const excludeIds = new Set(favs.map(f => f.source_book_id).filter(Boolean) as string[]);

  return (
    <div className="mt-8">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: '"Josefin Sans", sans-serif' }}>
        {t('profile.favouriteBooks', 'Livros Favoritos')}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {slots.map((fav, i) => (
          <div key={i} className="flex-shrink-0">
            {fav ? (
              <button onClick={() => openSlot(fav)} className="block group">
                {fav.book_cover_url ? (
                  <img src={fav.book_cover_url} alt={fav.book_title} className="w-[60px] h-[88px] object-cover rounded group-hover:opacity-80 transition-opacity" />
                ) : (
                  <div className="w-[60px] h-[88px] bg-secondary rounded flex items-center justify-center">
                    <BookOpen size={18} className="text-muted-foreground" strokeWidth={1} />
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => setPickerOpen(true)}
                className="w-[60px] h-[88px] rounded border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                aria-label={t('profile.addFavourite', 'Adicionar favorito')}
              >
                <Plus size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>
        ))}
      </div>

      <BookPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={addFavourite}
        excludeIds={excludeIds}
        title={t('profile.pickFavourite', 'Escolher livro favorito')}
      />
      <BookSlotSheet
        book={sheetBook}
        open={!!sheetBook}
        onOpenChange={(v) => { if (!v) setSheetBook(null); }}
        onRemove={activeFavId ? () => removeFavourite(activeFavId) : undefined}
      />
    </div>
  );
}
