import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, ChevronRight, BookOpen, Pencil, Check, Search, SlidersHorizontal, X, AlertTriangle, CheckSquare, Square, CalendarDays, Trash2, MoreVertical } from 'lucide-react';
import CalendarScreen from '@/components/CalendarScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppToast } from '@/components/ToastNotification';
import { useCelebration } from '@/components/CelebrationOverlay';
import { GENRE_OPTIONS, parseGenres } from '@/components/GenreMultiSelect';
import MoveToLibrarySheet from '@/components/MoveToLibrarySheet';
import AddToPlanSheet, { PlanBookPayload } from '@/components/AddToPlanSheet';
import HelpButton from '@/components/tutorial/HelpButton';
import LibraryCardExpiryBanner from '@/components/LibraryCardExpiryBanner';
import { tFormat, tGenre, tStatus } from '@/lib/displayMappings';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Library {
  id: string;
  name: string;
  is_public: boolean;
  share_code: string | null;
}

interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  is_wishlist: boolean;
  reading_status: string;
  genre: string | null;
  format: string | null;
  created_at: string;
  publish_date: string | null;
  is_borrowed: boolean;
  return_by_date: string | null;
  borrow_notifications_enabled: boolean;
}

interface Loan {
  id: string;
  borrower_name: string | null;
  is_active: boolean;
  book_id: string;
  loan_due_date: string | null;
  loan_notifications_enabled: boolean;
  books: { title: string; author: string | null; cover_url: string | null } | null;
}

interface LibraryScreenProps {
  onBookSelect: (bookId: string) => void;
  onAddBook: () => void;
  onWishlist: () => void;
  onGoToProfile?: () => void;
}

const FORMAT_OPTIONS = ['Softcover', 'Hardcover', 'Ebook', 'Other'];
const STATUS_OPTIONS = ['Unread', 'Currently Reading', 'Read'];
type SortOption = 'title_az' | 'title_za' | 'author_az' | 'date_newest' | 'date_oldest' | 'year_published';

export default function LibraryScreen({ onBookSelect, onAddBook, onWishlist, onGoToProfile }: LibraryScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useAppToast();
  const { celebrate } = useCelebration();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [activeLibrary, setActiveLibrary] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [loansToOthers, setLoansToOthers] = useState<Loan[]>([]);
  const [loansFromOthers, setLoansFromOthers] = useState<Loan[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLibrary, setDeletingLibrary] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [dismissedBorrowBanner, setDismissedBorrowBanner] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [planBook, setPlanBook] = useState<PlanBookPayload | null>(null);
  const [showPlanSheet, setShowPlanSheet] = useState(false);

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMoveSheet, setShowMoveSheet] = useState(false);
  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterGenres, setFilterGenres] = useState<string[]>([]);
  const [filterFormats, setFilterFormats] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date_newest');

  useEffect(() => {
    if (user) {
      loadLibraries();
      loadLoans();
    }
  }, [user]);

  useEffect(() => {
    const refresh = () => { loadLibraries(); if (activeLibrary) loadBooks(); };
    window.addEventListener('folium-library-refresh', refresh);
    return () => window.removeEventListener('folium-library-refresh', refresh);
  }, [activeLibrary]);

  useEffect(() => {
    if (activeLibrary) loadBooks();
  }, [activeLibrary]);

  const loadLibraries = async () => {
    const { data } = await supabase
      .from('libraries')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at');
    if (data && data.length > 0) {
      setLibraries(data as Library[]);
      if (!activeLibrary) setActiveLibrary(data[0].id);
    } else {
      setLibraries([]);
      setActiveLibrary('');
      setBooks([]);
    }
  };

  const loadBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, author, cover_url, is_wishlist, reading_status, genre, format, created_at, publish_date, is_borrowed, return_by_date, borrow_notifications_enabled')
      .eq('library_id', activeLibrary)
      .eq('is_wishlist', false)
      .order('created_at', { ascending: false });
    setBooks((data as Book[]) || []);
  };

  const loadLoans = async () => {
    const { data: lentOut } = await supabase
      .from('loans')
      .select('id, borrower_name, is_active, book_id, loan_due_date, loan_notifications_enabled, books(title, author, cover_url)')
      .eq('lender_id', user!.id)
      .eq('is_active', true);
    setLoansToOthers((lentOut as unknown as Loan[]) || []);

    const { data: borrowed } = await supabase
      .from('loans')
      .select('id, borrower_name, is_active, book_id, loan_due_date, loan_notifications_enabled, books(title, author, cover_url)')
      .eq('borrower_user_id', user!.id)
      .eq('is_active', true);
    setLoansFromOthers((borrowed as unknown as Loan[]) || []);
  };

  // Loan notification banner logic
  const loanBannerInfo = useMemo(() => {
    if (dismissedBanner) return null;
    const now = Date.now();
    let overdueCount = 0;
    let soonCount = 0;
    for (const loan of loansToOthers) {
      if (!loan.loan_due_date || !loan.loan_notifications_enabled) continue;
      const daysRemaining = Math.ceil((new Date(loan.loan_due_date).getTime() - now) / 86400000);
      if (daysRemaining < 0) overdueCount++;
      else if (daysRemaining < 10) soonCount++;
    }
    if (overdueCount > 0) return { type: 'overdue' as const, count: overdueCount };
    if (soonCount > 0) return { type: 'soon' as const, count: soonCount };
    return null;
  }, [loansToOthers, dismissedBanner]);

  // Borrow notification banner logic
  const borrowBannerInfo = useMemo(() => {
    if (dismissedBorrowBanner) return null;
    const now = Date.now();
    let overdueCount = 0;
    let soonCount = 0;
    for (const b of books) {
      if (!b.is_borrowed || !b.return_by_date || !b.borrow_notifications_enabled) continue;
      const daysRemaining = Math.ceil((new Date(b.return_by_date).getTime() - now) / 86400000);
      if (daysRemaining < 0) overdueCount++;
      else if (daysRemaining < 10) soonCount++;
    }
    if (overdueCount > 0) return { type: 'overdue' as const, count: overdueCount };
    if (soonCount > 0) return { type: 'soon' as const, count: soonCount };
    return null;
  }, [books, dismissedBorrowBanner]);

  // Set of book IDs currently on loan
  const onLoanBookIds = useMemo(() => new Set(loansToOthers.map(l => l.book_id)), [loansToOthers]);

  const createLibrary = async () => {
    if (!newLibraryName.trim()) return;
    await supabase.from('libraries').insert({
      user_id: user!.id,
      name: newLibraryName.trim(),
    });
    setNewLibraryName('');
    setShowCreateDialog(false);
    celebrate('library');
    loadLibraries();
  };

  const startEditName = () => {
    const lib = libraries.find(l => l.id === activeLibrary);
    if (!lib) return;
    setEditName(lib.name);
    setEditingName(true);
  };

  const saveEditName = async () => {
    if (!editName.trim()) return;
    await supabase.from('libraries').update({ name: editName.trim() }).eq('id', activeLibrary);
    setEditingName(false);
    loadLibraries();
  };

  const deleteCurrentLibrary = async () => {
    if (!activeLibrary || libraries.length <= 1) return;
    setDeletingLibrary(true);

    const libraryId = activeLibrary;
    const nextLibrary = libraries.find(l => l.id !== libraryId);

    const { data: libraryBooks } = await supabase
      .from('books')
      .select('id')
      .eq('library_id', libraryId);
    const bookIds = ((libraryBooks as { id: string }[] | null) || []).map(b => b.id);

    if (bookIds.length > 0) {
      await supabase.from('book_availability' as any).delete().in('book_id', bookIds);
    }
    await supabase.from('books').delete().eq('library_id', libraryId);
    await supabase.from('libraries').delete().eq('id', libraryId);

    setDeleteDialogOpen(false);
    setEditingName(false);
    setActiveLibrary(nextLibrary?.id || '');
    setBooks([]);
    setDeletingLibrary(false);
    showToast(t('library.libraryDeleted'));
    loadLibraries();
  };

  const hasActiveFilters = filterGenres.length > 0 || filterFormats.length > 0 || filterStatuses.length > 0 || sortBy !== 'date_newest';

  const openAddToPlan = (book: Book) => {
    setPlanBook({ book_id: book.id, title: book.title, author: book.author, cover_url: book.cover_url });
    setShowPlanSheet(true);
  };

  const goCreatePlan = () => {
    onWishlist();
    window.dispatchEvent(new Event('folium-open-planos'));
  };

  const clearFilters = () => {
    setFilterGenres([]);
    setFilterFormats([]);
    setFilterStatuses([]);
    setSortBy('date_newest');
    setSearchQuery('');
  };

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredBooks.map(b => b.id)));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const moveSelectedBooks = async (targetLibraryId: string, targetLibraryName: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await supabase.from('books').update({ library_id: targetLibraryId }).in('id', ids);
    setShowMoveSheet(false);
    exitSelectMode();
    showToast(t('library.booksMovedTo', { count: ids.length, name: targetLibraryName }));
    loadBooks();
  };

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q))
      );
    }

    if (filterGenres.length > 0) {
      result = result.filter(b => {
        const bookGenres = parseGenres(b.genre);
        return filterGenres.some(g => bookGenres.includes(g));
      });
    }

    if (filterFormats.length > 0) {
      result = result.filter(b => b.format && filterFormats.includes(b.format));
    }

    if (filterStatuses.length > 0) {
      result = result.filter(b => filterStatuses.includes(b.reading_status));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'title_az': return a.title.localeCompare(b.title);
        case 'title_za': return b.title.localeCompare(a.title);
        case 'author_az': return (a.author || '').localeCompare(b.author || '');
        case 'date_newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'year_published': return (b.publish_date || '').localeCompare(a.publish_date || '');
        default: return 0;
      }
    });

    return result;
  }, [books, searchQuery, filterGenres, filterFormats, filterStatuses, sortBy]);

  const currentLib = libraries.find(l => l.id === activeLibrary);
  const canDeleteLibrary = libraries.length > 1;
  const currentLibraryHasActiveLoans = books.some(book => onLoanBookIds.has(book.id));

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'title_az', label: t('library.titleAZ') },
    { value: 'title_za', label: t('library.titleZA') },
    { value: 'author_az', label: t('library.authorAZ') },
    { value: 'date_newest', label: t('library.dateNewest') },
    { value: 'date_oldest', label: t('library.dateOldest') },
    { value: 'year_published', label: t('library.yearPublished') },
  ];

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      {/* Top bar with help */}
      <div className="flex justify-end mb-1 -mt-1">
        <HelpButton screen="library" autoOnFirstVisit />
      </div>
      {/* Library tabs */}
      <div data-tutorial="library-tabs" className="flex items-center gap-2 mb-4 overflow-x-auto">
        {libraries.map(lib => (
          <button
            key={lib.id}
            onClick={() => setActiveLibrary(lib.id)}
            className={`px-3 py-1.5 text-sm whitespace-nowrap border rounded transition-colors ${
              activeLibrary === lib.id
                ? 'border-foreground text-foreground'
                : 'border-border text-muted-foreground'
            }`}
          >
            {lib.name}
          </button>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowCreateDialog(true)}
              aria-label={t('library.addNewLibrary')}
              className="px-3 py-1.5 text-sm border border-dashed border-border text-muted-foreground rounded hover:border-foreground hover:text-foreground transition-colors"
            >
              <Plus size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('library.addNewLibrary')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Library header */}
      {currentLib && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            {editingName ? (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEditName()}
                    className="bg-background border-border text-lg font-serif h-9"
                    autoFocus
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={saveEditName} aria-label={t('library.confirmName')} className="text-foreground hover:opacity-70 transition-opacity">
                        <Check size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{t('library.confirmName')}</TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block mt-2">
                      <button
                        onClick={() => canDeleteLibrary && setDeleteDialogOpen(true)}
                        disabled={!canDeleteLibrary}
                        className="inline-flex items-center gap-1.5 text-xs text-destructive hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40 transition-opacity"
                      >
                        <Trash2 size={13} />
                        {t('library.deleteLibrary')}
                      </button>
                    </span>
                  </TooltipTrigger>
                  {!canDeleteLibrary && <TooltipContent>{t('library.cannotDeleteOnlyLibrary')}</TooltipContent>}
                </Tooltip>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl text-foreground">{currentLib.name}</h1>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={startEditName} aria-label={t('library.editName')} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t('library.editName')}</TooltipContent>
                </Tooltip>
              </div>
            )}
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
                <button
                  onClick={selectAll}
                  className="text-xs text-accent hover:text-foreground transition-colors"
                >
                  {t('library.selectAll')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Library card expiry banner */}
      <LibraryCardExpiryBanner onGoToProfile={onGoToProfile} />

      {/* Loan notification banner */}
      {loanBannerInfo && (
        <div className={`mb-4 flex items-center gap-2 px-3 py-2.5 rounded text-sm ${
          loanBannerInfo.type === 'overdue'
            ? 'bg-destructive/10 text-destructive border border-destructive/20'
            : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20'
        }`}>
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span className="flex-1">
            {loanBannerInfo.type === 'overdue'
              ? (loanBannerInfo.count === 1
                  ? t('library.overdueOne')
                  : t('library.overdueMany', { count: loanBannerInfo.count }))
              : t('library.returningSoon')
            }
          </span>
          <button onClick={() => setDismissedBanner(true)} className="hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Borrow notification banner */}
      {borrowBannerInfo && (
        <div className={`mb-4 flex items-center gap-2 px-3 py-2.5 rounded text-sm ${
          borrowBannerInfo.type === 'overdue'
            ? 'bg-destructive/10 text-destructive border border-destructive/20'
            : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20'
        }`}>
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span className="flex-1">
            {borrowBannerInfo.type === 'overdue'
              ? t('library.borrowOverdue')
              : t('library.borrowReturnSoon')
            }
          </span>
          <button onClick={() => setDismissedBorrowBanner(true)} className="hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      {books.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2">
            <div data-tutorial="library-search" className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('library.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-background border-border text-sm pl-8 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  data-tutorial="library-filter"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label={t('library.filterGenre')}
                  className="relative flex items-center justify-center w-10 h-10 border border-border rounded bg-background text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('library.filterGenre')}</TooltipContent>
            </Tooltip>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-3 p-3 border border-border rounded bg-background space-y-4 animate-fade-in">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{t('library.filterGenre')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {GENRE_OPTIONS.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleArrayItem(filterGenres, g, setFilterGenres)}
                      className={`px-2 py-0.5 rounded text-xs transition-colors ${
                        filterGenres.includes(g)
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tGenre(g, t)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{t('library.filterFormat')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {FORMAT_OPTIONS.map(f => (
                    <button
                      key={f}
                      onClick={() => toggleArrayItem(filterFormats, f, setFilterFormats)}
                      className={`px-2 py-0.5 rounded text-xs transition-colors ${
                        filterFormats.includes(f)
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tFormat(f, t)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{t('library.filterStatus')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleArrayItem(filterStatuses, s, setFilterStatuses)}
                      className={`px-2 py-0.5 rounded text-xs transition-colors ${
                        filterStatuses.includes(s)
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tStatus(s, t)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{t('library.sortBy')}</p>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="w-full h-9 px-3 text-xs border border-border rounded bg-background text-foreground"
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-accent hover:text-foreground transition-colors"
            >
              {t('library.clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Book list */}
      {filteredBooks.length === 0 && books.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-muted-foreground text-sm">{t('library.emptyTitle')}</p>
          <p className="text-muted-foreground text-xs mt-1">{t('library.emptySubtitle')}</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">{t('library.emptyTitle')}</p>
        </div>
      ) : (
        <div className="space-y-0">
          {filteredBooks.map((book, idx) => (
            <button
              key={book.id}
              data-tutorial={idx === 0 ? 'library-book-row' : undefined}
              onClick={() => selectMode ? toggleSelect(book.id) : onBookSelect(book.id)}
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
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-foreground truncate">{book.title}</p>
                  {onLoanBookIds.has(book.id) && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 flex-shrink-0">
                      {t('library.onLoan')}
                    </Badge>
                  )}
                  {book.is_borrowed && (
                    <Badge className="text-[9px] px-1.5 py-0 flex-shrink-0 bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-600/30">
                      {t('library.borrowed')}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{book.author || t('library.unknownAuthor')}</p>
              </div>
              {!selectMode && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span role="button" tabIndex={0} aria-label="Mais opções" onClick={(e) => e.stopPropagation()} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground">
                        <MoreVertical size={16} />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAddToPlan(book); }}>Adicionar ao plano</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* On loan to others */}
      {loansToOthers.length > 0 && (
        <div className="mt-8">
          <h3 className="font-serif text-lg text-foreground mb-3 border-b border-border pb-2">{t('library.onLoanToOthers')}</h3>
          {loansToOthers.map(loan => (
            <div key={loan.id} className="flex items-center gap-3 py-2 text-sm">
              <BookOpen size={14} className="text-muted-foreground" strokeWidth={1} />
              <span className="text-foreground">{loan.books?.title}</span>
              <span className="text-muted-foreground ml-auto text-xs">→ {loan.borrower_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* On loan from others */}
      {loansFromOthers.length > 0 && (
        <div className="mt-6">
          <h3 className="font-serif text-lg text-foreground mb-3 border-b border-border pb-2">{t('library.borrowedFromOthers')}</h3>
          {loansFromOthers.map(loan => (
            <div key={loan.id} className="flex items-center gap-3 py-2 text-sm">
              <BookOpen size={14} className="text-muted-foreground" strokeWidth={1} />
              <span className="text-foreground">{loan.books?.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* FABs or Selection toolbar */}
      {selectMode ? (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-4">
          <div className="max-w-lg mx-auto flex gap-2 p-3 rounded-xl bg-background/85 backdrop-blur-lg border border-border shadow-lg">
            <Button
              variant="outline"
              className="flex-1"
              onClick={exitSelectMode}
            >
              {t('library.cancelSelect')}
            </Button>
            <Button
              className="flex-1"
              disabled={selectedIds.size === 0}
              onClick={() => setShowMoveSheet(true)}
            >
              {t('library.moveSelected')} {selectedIds.size > 0 && `(${selectedIds.size})`}
            </Button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-40">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowCalendar(true)}
                className="w-12 h-12 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity"
              >
                <CalendarDays size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">{t('calendar.title', 'Calendário')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onWishlist}
                className="w-12 h-12 rounded-full bg-gold text-gold-foreground flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity"
              >
                ★
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">{t('library.viewWishlist')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-tutorial="library-add"
                onClick={onAddBook}
                className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">{t('library.addBook')}</TooltipContent>
          </Tooltip>
        </div>
      )}

      {showCalendar && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <CalendarScreen
            onBack={() => setShowCalendar(false)}
            onOpenBook={(id) => { setShowCalendar(false); onBookSelect(id); }}
          />
        </div>
      )}

      {/* Move to library sheet */}
      <AddToPlanSheet
        book={planBook}
        open={showPlanSheet}
        onOpenChange={setShowPlanSheet}
        onNoActivePlan={() => toast('Não tens um plano activo.', { action: { label: 'Criar plano →', onClick: goCreatePlan } })}
      />

      <MoveToLibrarySheet
        open={showMoveSheet}
        onOpenChange={setShowMoveSheet}
        libraries={libraries}
        currentLibraryId={activeLibrary}
        onSelect={moveSelectedBooks}
      />

      {/* Create library dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">{t('library.newLibrary')}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t('library.libraryName')}
            value={newLibraryName}
            onChange={e => setNewLibraryName(e.target.value)}
            className="bg-background border-border"
            onKeyDown={e => e.key === 'Enter' && createLibrary()}
          />
          <Button onClick={createLibrary} className="w-full">{t('library.create')}</Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">{t('library.deleteLibraryTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('library.deleteLibraryBody')}
              {currentLibraryHasActiveLoans && (
                <span className="mt-2 block">{t('library.deleteLibraryActiveLoans')}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLibrary}>{t('library.cancelDeleteLibrary')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingLibrary}
              onClick={(event) => {
                event.preventDefault();
                deleteCurrentLibrary();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('library.confirmDeleteLibrary')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
