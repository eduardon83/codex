import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Plus } from 'lucide-react';
import BookPickerDialog, { PickableBook } from './BookPickerDialog';
import BookSlotSheet, { SlotBook } from './BookSlotSheet';

const MAX_SLOTS = 3;
const STORAGE_KEY = 'currently_reading_slots_v1';

interface Slot {
  bookId: string;
}

interface BookData {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  rating: number | null;
  notes: string | null;
  reading_status: string;
}

export default function CurrentlyReadingSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [books, setBooks] = useState<Map<string, BookData>>(new Map());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sheetBook, setSheetBook] = useState<SlotBook | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  // Load slot config from localStorage (per user)
  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
    setSlots(raw ? JSON.parse(raw) : []);
  }, [user]);

  // Hydrate book data + auto-prune anything no longer "Currently Reading"
  useEffect(() => {
    if (!user) return;
    if (slots.length === 0) { setBooks(new Map()); return; }
    const ids = slots.map(s => s.bookId);
    supabase
      .from('books')
      .select('id, title, author, cover_url, rating, notes, reading_status')
      .in('id', ids)
      .then(({ data }) => {
        const arr = (data as BookData[]) || [];
        const map = new Map(arr.map(b => [b.id, b]));
        setBooks(map);
        // Auto-remove slots that no longer match (deleted or status changed)
        const valid = slots.filter(s => {
          const b = map.get(s.bookId);
          return b && b.reading_status === 'Currently Reading';
        });
        if (valid.length !== slots.length) saveSlots(valid);
      });
  }, [slots, user]);

  const saveSlots = (next: Slot[]) => {
    if (!user) return;
    setSlots(next);
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(next));
  };

  const addSlot = (book: PickableBook) => {
    if (slots.find(s => s.bookId === book.id)) return;
    saveSlots([...slots, { bookId: book.id }]);
  };

  const removeSlot = (bookId: string) => {
    saveSlots(slots.filter(s => s.bookId !== bookId));
  };

  const openSlot = (bookId: string) => {
    const b = books.get(bookId);
    if (!b) return;
    setActiveBookId(bookId);
    setSheetBook({ id: b.id, title: b.title, author: b.author, cover_url: b.cover_url, rating: b.rating, notes: b.notes });
  };

  const display = Array.from({ length: MAX_SLOTS }, (_, i) => slots[i] || null);
  const excludeIds = new Set(slots.map(s => s.bookId));

  return (
    <div className="mt-6">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: '"Josefin Sans", sans-serif' }}>
        {t('profile.currentlyReading', 'A Ler Agora')}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {display.map((slot, i) => {
          const book = slot ? books.get(slot.bookId) : null;
          return (
            <div key={i} className="flex-shrink-0">
              {slot && book ? (
                <button onClick={() => openSlot(slot.bookId)} className="block group">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-[60px] h-[88px] object-cover rounded group-hover:opacity-80 transition-opacity" />
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
                  aria-label={t('profile.addCurrentlyReading', 'Adicionar a ler agora')}
                >
                  <Plus size={18} strokeWidth={1.5} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <BookPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={addSlot}
        filterStatus="Currently Reading"
        excludeIds={excludeIds}
        title={t('profile.pickCurrentlyReading', 'Escolher livro a ler')}
      />
      <BookSlotSheet
        book={sheetBook}
        open={!!sheetBook}
        onOpenChange={(v) => { if (!v) setSheetBook(null); }}
        onRemove={activeBookId ? () => removeSlot(activeBookId) : undefined}
      />
    </div>
  );
}
