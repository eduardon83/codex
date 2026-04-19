import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchBookByISBN } from '@/lib/isbn';
import { reuploadExternalImage } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Plus, FileSpreadsheet, FileText, AlertTriangle, BookOpen, Pencil, Trash2,
  ChevronDown, ChevronUp, Search, Filter, Loader2, X, Check
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ReadingList {
  id: string;
  name: string;
  created_at: string;
}

interface ReadingListBook {
  id: string;
  reading_list_id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publish_date: string | null;
  cover_url: string | null;
  genre: string | null;
  page_count: number | null;
  language: string | null;
  has_warning: boolean;
}

type SortMode = 'az' | 'za' | 'newest' | 'oldest';

export default function ReadingListsTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');
  const [books, setBooks] = useState<ReadingListBook[]>([]);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState('');
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('az');
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const xlsxRef = useRef<HTMLInputElement>(null);

  // Get user's first library for adding books
  const [libraryId, setLibraryId] = useState('');

  useEffect(() => {
    if (user) {
      loadLists();
      supabase.from('libraries').select('id').eq('user_id', user.id).limit(1).single().then(({ data }) => {
        if (data) setLibraryId(data.id);
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeListId) loadBooks();
  }, [activeListId]);

  const loadLists = async () => {
    const { data } = await supabase
      .from('reading_lists')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) {
      setLists(data);
      if (data.length > 0 && !activeListId) setActiveListId(data[0].id);
    }
  };

  const loadBooks = async () => {
    const { data } = await supabase
      .from('reading_list_books')
      .select('*')
      .eq('reading_list_id', activeListId)
      .order('created_at');
    setBooks((data as ReadingListBook[]) || []);
  };

  const createList = async () => {
    if (!newListName.trim()) return;
    const { data } = await supabase
      .from('reading_lists')
      .insert({ user_id: user!.id, name: newListName.trim() })
      .select()
      .single();
    setNewListName('');
    setShowNewList(false);
    if (data) {
      await loadLists();
      setActiveListId(data.id);
    }
  };

  const renameList = async () => {
    if (!editingListId || !editListName.trim()) return;
    await supabase.from('reading_lists').update({ name: editListName.trim() }).eq('id', editingListId);
    setEditingListId(null);
    loadLists();
  };

  const deleteList = async () => {
    if (!deleteListId) return;
    await supabase.from('reading_lists').delete().eq('id', deleteListId);
    setDeleteListId(null);
    if (activeListId === deleteListId) setActiveListId('');
    loadLists();
  };

  // ISBN extraction from any string
  const extractISBNs = (text: string): string[] => {
    const matches = text.match(/\b(\d{13}|\d{10})\b/g);
    return matches || [];
  };

  const processFile = async (rows: string[][]) => {
    if (!activeListId || rows.length === 0) return;
    setImporting(true);

    // Find columns that might contain ISBNs
    const booksToInsert: Partial<ReadingListBook>[] = [];

    for (const row of rows) {
      const rowText = row.join(' ');
      const isbns = extractISBNs(rowText);

      if (isbns.length > 0) {
        for (const isbn of isbns) {
          const bookData = await fetchBookByISBN(isbn);
          if (bookData) {
            booksToInsert.push({
              reading_list_id: activeListId,
              title: bookData.title,
              author: bookData.author || null,
              isbn,
              publisher: bookData.publisher || null,
              publish_date: bookData.publish_date || null,
              cover_url: bookData.cover_url || null,
              genre: bookData.genre || null,
              page_count: bookData.page_count || null,
              language: bookData.language || null,
              has_warning: false,
            });
          } else {
            // Could not fetch — add with warning
            const title = row.find(c => c && !/^\d{10,13}$/.test(c.trim())) || isbn;
            booksToInsert.push({
              reading_list_id: activeListId,
              title: title.trim(),
              isbn,
              has_warning: true,
            });
          }
        }
      } else {
        // No ISBN found in row, add with whatever data available
        const nonEmpty = row.filter(c => c && c.trim());
        if (nonEmpty.length > 0) {
          booksToInsert.push({
            reading_list_id: activeListId,
            title: nonEmpty[0]?.trim() || 'Unknown',
            author: nonEmpty[1]?.trim() || null,
            has_warning: true,
          });
        }
      }
    }

    if (booksToInsert.length > 0) {
      const { data: inserted } = await supabase.from('reading_list_books').insert(booksToInsert as any).select('id, cover_url');
      // Re-upload external cover images to storage
      if (inserted) {
        for (const row of inserted) {
          if (row.cover_url && !row.cover_url.includes('supabase.co')) {
            const storagePath = `reading-list/${row.id}.jpg`;
            const newUrl = await reuploadExternalImage(row.cover_url, 'book-covers', storagePath);
            if (newUrl) {
              await supabase.from('reading_list_books').update({ cover_url: newUrl }).eq('id', row.id);
            }
          }
        }
      }
      toast.success(t('readingLists.importSuccess', { count: booksToInsert.length }));
    }

    setImporting(false);
    loadBooks();
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = text.split('\n').slice(1).map(line => line.split(',').map(c => c.replace(/"/g, '').trim())).filter(r => r.some(c => c));
    await processFile(rows);
    e.target.value = '';
  };

  const handleXLSX = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const rows = data.slice(1).filter(r => r.some(c => c));
    await processFile(rows);
    e.target.value = '';
  };

  const addToWishlist = async (book: ReadingListBook) => {
    if (!libraryId) return;
    await supabase.from('books').insert({
      library_id: libraryId,
      user_id: user!.id,
      title: book.title,
      author: book.author || null,
      isbn: book.isbn || null,
      cover_url: book.cover_url || null,
      publisher: book.publisher || null,
      publish_date: book.publish_date || null,
      genre: book.genre || null,
      page_count: book.page_count || null,
      language: book.language || null,
      is_wishlist: true,
    });
    setExpandedBookId(null);
    toast.success(t('readingLists.addedToWishlist'));
  };

  const addToLibrary = async (book: ReadingListBook) => {
    if (!libraryId) return;
    await supabase.from('books').insert({
      library_id: libraryId,
      user_id: user!.id,
      title: book.title,
      author: book.author || null,
      isbn: book.isbn || null,
      cover_url: book.cover_url || null,
      publisher: book.publisher || null,
      publish_date: book.publish_date || null,
      genre: book.genre || null,
      page_count: book.page_count || null,
      language: book.language || null,
      is_wishlist: false,
    });
    setExpandedBookId(null);
    toast.success(t('readingLists.addedToLibrary'));
  };

  // Filter & sort
  const uniqueAuthors = [...new Set(books.map(b => b.author).filter(Boolean))] as string[];
  const uniqueGenres = [...new Set(books.map(b => b.genre).filter(Boolean))] as string[];

  let filtered = books.filter(b => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !(b.author?.toLowerCase().includes(q))) return false;
    }
    if (filterAuthor && b.author !== filterAuthor) return false;
    if (filterGenre && b.genre !== filterGenre) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    switch (sortMode) {
      case 'az': return a.title.localeCompare(b.title);
      case 'za': return b.title.localeCompare(a.title);
      case 'newest': return (b.publish_date || '').localeCompare(a.publish_date || '');
      case 'oldest': return (a.publish_date || '').localeCompare(b.publish_date || '');
      default: return 0;
    }
  });

  const activeList = lists.find(l => l.id === activeListId);

  // Empty state — no lists at all
  if (lists.length === 0 && !showNewList) {
    return (
      <div className="text-center py-16">
        <BookOpen size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
        <p className="text-muted-foreground text-sm">{t('readingLists.emptyTitle')}</p>
        <p className="text-muted-foreground text-xs mt-1">{t('readingLists.emptySubtitle')}</p>
        <button
          onClick={() => setShowNewList(true)}
          className="mt-4 text-sm text-accent hover:text-foreground transition-colors"
        >
          {t('readingLists.newList')} →
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* List selector + new list */}
      <div className="flex items-center gap-2 mb-4">
        {lists.length > 0 && (
          <Select value={activeListId} onValueChange={setActiveListId}>
            <SelectTrigger className="flex-1 bg-background border-border text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lists.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowNewList(true)}
              className="h-9 px-3 border border-dashed border-border text-muted-foreground rounded hover:border-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
            >
              <Plus size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('readingLists.newList')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Active list header */}
      {activeList && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-foreground">{activeList.name}</h3>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => { setEditingListId(activeList.id); setEditListName(activeList.name); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('readingLists.rename')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDeleteListId(activeList.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('readingLists.delete')}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Import buttons */}
      {activeListId && (
        <div className="flex gap-2 mb-4">
          <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <input ref={xlsxRef} type="file" accept=".xls,.xlsx" className="hidden" onChange={handleXLSX} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => csvRef.current?.click()}
            disabled={importing}
            className="text-xs"
          >
            {importing ? <Loader2 size={14} className="animate-spin mr-1" /> : <FileText size={14} className="mr-1" />}
            {t('readingLists.importCSV')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => xlsxRef.current?.click()}
            disabled={importing}
            className="text-xs"
          >
            {importing ? <Loader2 size={14} className="animate-spin mr-1" /> : <FileSpreadsheet size={14} className="mr-1" />}
            {t('readingLists.importXLSX')}
          </Button>
        </div>
      )}

      {/* Filter bar toggle */}
      {books.length > 0 && (
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <Filter size={12} />
          {t('readingLists.filterSort')}
          {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      )}

      {/* Filter bar */}
      {showFilters && (
        <div className="space-y-2 mb-4 p-3 border border-border rounded">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('readingLists.searchPlaceholder')}
              className="pl-8 h-9 text-sm bg-background border-border"
            />
          </div>
          <div className="flex gap-2">
            {uniqueAuthors.length > 0 && (
              <Select value={filterAuthor || '_all'} onValueChange={v => setFilterAuthor(v === '_all' ? '' : v)}>
                <SelectTrigger className="flex-1 h-8 text-xs bg-background border-border">
                  <SelectValue placeholder={t('readingLists.author')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">{t('readingLists.allAuthors')}</SelectItem>
                  {uniqueAuthors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {uniqueGenres.length > 0 && (
              <Select value={filterGenre || '_all'} onValueChange={v => setFilterGenre(v === '_all' ? '' : v)}>
                <SelectTrigger className="flex-1 h-8 text-xs bg-background border-border">
                  <SelectValue placeholder={t('readingLists.genre')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">{t('readingLists.allGenres')}</SelectItem>
                  {uniqueGenres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <Select value={sortMode} onValueChange={v => setSortMode(v as SortMode)}>
            <SelectTrigger className="h-8 text-xs bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">A → Z</SelectItem>
              <SelectItem value="za">Z → A</SelectItem>
              <SelectItem value="newest">{t('readingLists.newest')}</SelectItem>
              <SelectItem value="oldest">{t('readingLists.oldest')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Book list */}
      {activeListId && books.length === 0 && !importing && (
        <div className="text-center py-12">
          <BookOpen size={28} className="mx-auto text-muted-foreground mb-2" strokeWidth={1} />
          <p className="text-muted-foreground text-sm">{t('readingLists.emptyList')}</p>
          <p className="text-muted-foreground text-xs mt-1">{t('readingLists.importHint')}</p>
        </div>
      )}

      {filtered.map(book => (
        <div key={book.id} className="flex items-center gap-3 py-3 border-b border-border">
          {book.cover_url ? (
            <img src={book.cover_url} alt="" className="w-10 h-14 object-cover rounded-sm" />
          ) : (
            <div className="w-10 h-14 bg-secondary rounded-sm flex items-center justify-center">
              <BookOpen size={16} className="text-muted-foreground" strokeWidth={1} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              {book.has_warning && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle size={12} className="text-gold flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>{t('readingLists.noIsbnData')}</TooltipContent>
                </Tooltip>
              )}
              <p className="text-sm text-foreground truncate">{book.title}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {[book.author, book.publish_date?.slice(0, 4)].filter(Boolean).join(' · ')}
            </p>
          </div>

          {expandedBookId === book.id ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => addToWishlist(book)}
                className="text-[10px] px-2 py-1 border border-border rounded hover:bg-secondary transition-colors text-foreground"
              >
                {t('readingLists.toWishlist')}
              </button>
              <button
                onClick={() => addToLibrary(book)}
                className="text-[10px] px-2 py-1 border border-border rounded hover:bg-secondary transition-colors text-foreground"
              >
                {t('readingLists.toLibrary')}
              </button>
              <button onClick={() => setExpandedBookId(null)} className="text-muted-foreground ml-1">
                <X size={12} />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setExpandedBookId(book.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <Plus size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('readingLists.addBook')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      ))}

      {/* New list dialog */}
      <Dialog open={showNewList} onOpenChange={setShowNewList}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">{t('readingLists.newList')}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t('readingLists.listName')}
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            className="bg-background border-border"
            onKeyDown={e => e.key === 'Enter' && createList()}
            autoFocus
          />
          <Button onClick={createList} className="w-full">{t('library.create')}</Button>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!editingListId} onOpenChange={() => setEditingListId(null)}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">{t('readingLists.rename')}</DialogTitle>
          </DialogHeader>
          <Input
            value={editListName}
            onChange={e => setEditListName(e.target.value)}
            className="bg-background border-border"
            onKeyDown={e => e.key === 'Enter' && renameList()}
            autoFocus
          />
          <Button onClick={renameList} className="w-full">{t('library.save')}</Button>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteListId} onOpenChange={() => setDeleteListId(null)}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">{t('readingLists.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('readingLists.deleteConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('profile.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteList}>{t('readingLists.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
