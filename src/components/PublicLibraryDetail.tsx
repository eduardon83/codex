import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, BookOpen, CheckSquare, Square, Heart, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppToast } from '@/components/ToastNotification';

interface PublicBook {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  genre: string | null;
  publisher: string | null;
  publish_date: string | null;
  page_count: number | null;
  language: string | null;
  format: string | null;
}

interface PublicLibraryDetailProps {
  libraryId: string;
  libraryName: string;
  ownerUserId: string;
  ownerUsername: string | null;
  onBack: () => void;
}

export default function PublicLibraryDetail({ libraryId, libraryName, ownerUserId, ownerUsername, onBack }: PublicLibraryDetailProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useAppToast();
  const [books, setBooks] = useState<PublicBook[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [libraryId]);

  const loadBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, author, cover_url, isbn, genre, publisher, publish_date, page_count, language, format')
      .eq('library_id', libraryId)
      .eq('is_wishlist', false)
      .order('title');
    setBooks((data as PublicBook[]) || []);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(books.map(b => b.id)));

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const getSelectedBooks = () => books.filter(b => selectedIds.has(b.id));

  const placeOnWishlist = async () => {
    if (selectedIds.size === 0 || !user) return;
    setLoading(true);

    // Get user's first library for wishlist items
    const { data: lib } = await supabase.from('libraries').select('id').eq('user_id', user.id).limit(1).single();
    if (!lib) { setLoading(false); return; }

    const selected = getSelectedBooks();
    for (const book of selected) {
      await supabase.from('books').insert({
        library_id: lib.id,
        user_id: user.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        cover_url: book.cover_url,
        genre: book.genre,
        publisher: book.publisher,
        publish_date: book.publish_date,
        page_count: book.page_count,
        language: book.language,
        format: book.format,
        is_wishlist: true,
      });
    }

    showToast(t('publicLibrary.addedToWishlist', { count: selected.length }));
    exitSelectMode();
    setLoading(false);
  };

  const requestLoan = async () => {
    if (selectedIds.size === 0 || !user) return;
    setLoading(true);

    const selected = getSelectedBooks();
    for (const book of selected) {
      await supabase.from('loan_requests' as any).insert({
        requester_user_id: user.id,
        owner_user_id: ownerUserId,
        book_id: book.id,
        book_title: book.title,
        book_author: book.author,
        book_cover_url: book.cover_url,
        book_isbn: book.isbn,
      });
    }

    showToast(t('publicLibrary.loanRequested', { count: selected.length }));
    exitSelectMode();
    setLoading(false);
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-xl text-foreground truncate">{libraryName}</h2>
          {ownerUsername && <p className="text-xs text-muted-foreground">@{ownerUsername}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{books.length} {t('library.books')}</span>
          {books.length > 0 && !selectMode && (
            <button
              onClick={() => setSelectMode(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border rounded"
            >
              {t('library.select')}
            </button>
          )}
          {selectMode && (
            <button onClick={selectAll} className="text-xs text-accent hover:text-foreground transition-colors">
              {t('library.selectAll')}
            </button>
          )}
        </div>
      </div>

      {/* Book list */}
      {books.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-muted-foreground text-sm">{t('library.emptyTitle')}</p>
        </div>
      ) : (
        <div className="space-y-0">
          {books.map(book => (
            <button
              key={book.id}
              onClick={() => { if (selectMode) { toggleSelect(book.id); } else { setSelectMode(true); toggleSelect(book.id); } }}
              className={`w-full flex items-center gap-3 py-3 border-b border-border text-left hover:bg-secondary/30 transition-colors ${
                selectMode && selectedIds.has(book.id) ? 'bg-accent/10' : ''
              }`}
            >
              {selectMode && (
                selectedIds.has(book.id)
                  ? <CheckSquare size={18} className="text-accent shrink-0" />
                  : <Square size={18} className="text-muted-foreground shrink-0" />
              )}
              {book.cover_url ? (
                <img src={book.cover_url} alt="" className="w-10 h-14 object-cover rounded-sm" />
              ) : (
                <div className="w-10 h-14 bg-secondary rounded-sm flex items-center justify-center">
                  <BookOpen size={16} className="text-muted-foreground" strokeWidth={1} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground truncate">{book.author || t('library.unknownAuthor')}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selection toolbar */}
      {selectMode && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-4">
          <div className="max-w-lg mx-auto flex gap-2 p-3 rounded-xl bg-background/85 backdrop-blur-lg border border-border shadow-lg">
            <Button variant="outline" className="flex-1" onClick={exitSelectMode}>
              {t('library.cancelSelect')}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  disabled={selectedIds.size === 0 || loading}
                  onClick={placeOnWishlist}
                >
                  <Heart size={14} />
                  {t('publicLibrary.toWishlist')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('publicLibrary.toWishlistHint')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="flex-1 gap-1.5"
                  disabled={selectedIds.size === 0 || loading}
                  onClick={requestLoan}
                >
                  <HandCoins size={14} />
                  {t('publicLibrary.requestLoan')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('publicLibrary.requestLoanHint')}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
