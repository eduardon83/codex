import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchBookByISBN, saveToBookCache, searchBooksByQuery, type BookResult } from '@/lib/isbn';
import { reuploadExternalImage, uploadFileToStorage } from '@/lib/storage';
import { useAppToast } from '@/components/ToastNotification';
import { useCelebration } from '@/components/CelebrationOverlay';
import OwlLoader from '@/components/OwlLoader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Camera, X, Upload, CalendarIcon, Info, Lock, BookOpen, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import GenreMultiSelect, { parseGenres, serializeGenres } from '@/components/GenreMultiSelect';
import HelpButton from '@/components/tutorial/HelpButton';
import BarcodeScanner from '@/components/BarcodeScanner';
import { tFormat } from '@/lib/displayMappings';

interface AddBookScreenProps {
  isWishlist?: boolean;
  onDone: () => void;
}

export default function AddBookScreen({ isWishlist = false, onDone }: AddBookScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useAppToast();
  const { celebrate } = useCelebration();
  const [mode, setMode] = useState<'isbn' | 'manual'>('isbn');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BookResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isbnLocked, setIsbnLocked] = useState(false);
  const [isbnError, setIsbnError] = useState('');
  const [showIsbnHelp, setShowIsbnHelp] = useState(false);
  const isbnFieldRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [libraryId, setLibraryId] = useState('');
  const [libraries, setLibraries] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [bookSource, setBookSource] = useState<string | null>(null);
  const [isManualFill, setIsManualFill] = useState(false);
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', publisher: '', publish_date: '',
    format: 'Softcover', cover_url: '', series_name: '', volume_number: '',
    language: '', page_count: '', genre: '', notes: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Borrowed book state
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [borrowedFrom, setBorrowedFrom] = useState('');
  const [returnByDate, setReturnByDate] = useState<Date | undefined>(undefined);
  const [borrowNotify, setBorrowNotify] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('libraries').select('id, name').eq('user_id', user.id).then(({ data }) => {
        if (data && data.length > 0) {
          setLibraries(data);
          setLibraryId(data[0].id);
        }
      });
    }
  }, [user]);

  const isIsbnLike = (s: string) => {
    const clean = s.replace(/[-\s]/g, '');
    return /^\d{9,13}$/.test(clean);
  };

  const fillFormFromIsbn = async (rawIsbn: string) => {
    setLoading(true);
    setError('');
    setBookSource(null);
    setIsManualFill(false);
    setIsbnError('');
    const result = await fetchBookByISBN(rawIsbn.trim());
    if (result) {
      setForm({
        ...form,
        title: result.title,
        author: result.author,
        isbn: result.isbn,
        publisher: result.publisher,
        publish_date: result.publish_date,
        cover_url: result.cover_url,
        language: result.language,
        page_count: result.page_count?.toString() || '',
        genre: result.genre,
      });
      setGenres(parseGenres(result.genre));
      setBookSource(result.source || null);
      setIsbnLocked(true);
      setMode('manual');
    } else {
      setForm({
        ...form,
        isbn: rawIsbn.trim(),
        title: '', author: '', publisher: '', publish_date: '',
        cover_url: '', language: '', page_count: '', genre: '',
      });
      setIsManualFill(true);
      setBookSource(null);
      setIsbnLocked(false);
      setMode('manual');
    }
    setLoading(false);
  };

  const handleSearchSubmit = async () => {
    const q = query.trim();
    if (!q) return;
    if (isIsbnLike(q)) {
      await fillFormFromIsbn(q);
    } else {
      // trigger immediate search
      setSearching(true);
      setShowResults(true);
      const results = await searchBooksByQuery(q);
      setSearchResults(results.slice(0, 8));
      setSearching(false);
    }
  };

  const selectSearchResult = (book: BookResult) => {
    setForm({
      ...form,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher || '',
      publish_date: book.year || '',
      cover_url: book.cover_url || '',
      language: book.language || '',
      page_count: '',
      genre: '',
    });
    setBookSource(book.source === 'community' ? 'community' : null);
    setIsbnLocked(true);
    setIsManualFill(false);
    setIsbnError('');
    setShowResults(false);
    setMode('manual');
  };

  // Debounced search-as-you-type
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || isIsbnLike(q)) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    const handle = setTimeout(async () => {
      const results = await searchBooksByQuery(q);
      setSearchResults(results.slice(0, 8));
      setSearching(false);
    }, 600);
    return () => clearTimeout(handle);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showResults) return;
    const onClick = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showResults]);

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      update('cover_url', URL.createObjectURL(file));
    }
  };

  const save = async () => {
    if (!form.title.trim() || !libraryId) return;
    setLoading(true);

    const { data: inserted, error: err } = await supabase.from('books').insert({
      library_id: libraryId,
      user_id: user!.id,
      title: form.title.trim(),
      author: form.author || null,
      isbn: form.isbn || null,
      publisher: form.publisher || null,
      publish_date: form.publish_date || null,
      format: form.format,
      cover_url: null,
      series_name: form.series_name || null,
      volume_number: form.volume_number ? parseInt(form.volume_number) : null,
      language: form.language || null,
      page_count: form.page_count ? parseInt(form.page_count) : null,
      genre: serializeGenres(genres),
      tags,
      notes: form.notes || null,
      is_wishlist: isWishlist,
      is_borrowed: isBorrowed,
      borrowed_from: isBorrowed ? (borrowedFrom.trim() || null) : null,
      return_by_date: isBorrowed && returnByDate ? returnByDate.toISOString() : null,
      borrow_notifications_enabled: isBorrowed && borrowNotify && !!returnByDate,
    }).select('id').single();

    if (err || !inserted) {
      setError(err?.message || 'Failed to save');
      setLoading(false);
      return;
    }

    let finalCoverUrl: string | null = null;
    const storagePath = `${user!.id}/${inserted.id}.jpg`;

    if (coverFile) {
      finalCoverUrl = await uploadFileToStorage('book-covers', storagePath, coverFile);
    } else if (form.cover_url) {
      finalCoverUrl = await reuploadExternalImage(form.cover_url, 'book-covers', storagePath);
    }

    if (finalCoverUrl) {
      await supabase.from('books').update({ cover_url: finalCoverUrl }).eq('id', inserted.id);
    }

    // Save to community cache if this was a manual fill with ISBN
    if (isManualFill && form.isbn.trim() && form.title.trim()) {
      await saveToBookCache(form.isbn.trim(), {
        title: form.title.trim(),
        author: form.author || undefined,
        publisher: form.publisher || undefined,
        year: form.publish_date || undefined,
        language: form.language || undefined,
        pages: form.page_count ? parseInt(form.page_count) : null,
        cover_url: finalCoverUrl || undefined,
        genre: serializeGenres(genres) || undefined,
        format: form.format || undefined,
      }, user!.id);
    }

    showToast('Book added to your library.');
    celebrate('book');
    onDone();
    setLoading(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const formatOptions = [
    { value: 'Softcover', label: tFormat('Softcover', t) },
    { value: 'Hardcover', label: tFormat('Hardcover', t) },
    { value: 'Ebook', label: tFormat('Ebook', t) },
    { value: 'Other', label: tFormat('Other', t) },
  ];

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-foreground">
          {isWishlist ? t('addBook.addToWishlist') : t('addBook.title')}
        </h2>
        <HelpButton screen="addBook" />
      </div>

      {mode === 'isbn' && (
        <div data-tutorial="add-isbn-vs-manual" className="space-y-4 mb-6">
          <div className="flex gap-2">
            <button
              className="flex-1 py-3 border border-border rounded text-sm text-muted-foreground flex items-center justify-center gap-2 hover:border-foreground hover:text-foreground transition-colors"
              onClick={() => setScannerOpen(true)}
            >
              <Camera size={16} /> {t('addBook.scanIsbn')}
            </button>
          </div>

          <div ref={searchBoxRef} className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t('addBook.enterIsbn')}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="bg-background border-border text-sm pl-9 pr-9"
                  onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <OwlLoader size={14} inline />
                  </div>
                )}
              </div>
              <Button onClick={handleSearchSubmit} disabled={loading} variant="outline">
                {loading ? <OwlLoader size={16} inline /> : t('addBook.lookUp')}
              </Button>
            </div>
            <p className="mt-1.5 text-muted-foreground" style={{ fontSize: '11px' }}>
              {searching ? t('add_book.searching') : t('add_book.search_hint')}
            </p>

            {showResults && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-popover border border-border rounded-md shadow-lg max-h-[420px] overflow-y-auto">
                {searching && searchResults.length === 0 && (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    {t('add_book.searching')}
                  </div>
                )}
                {!searching && searchResults.length === 0 && query.trim().length >= 3 && (
                  <div className="px-3 py-4 text-sm text-muted-foreground">
                    {t('add_book.no_results', { query: query.trim() })}
                  </div>
                )}
                {searchResults.map((b) => (
                  <button
                    key={`${b.isbn}-${b.source}`}
                    onClick={() => selectSearchResult(b)}
                    className="w-full text-left px-3 py-2 hover:bg-accent/30 border-b border-border/50 last:border-0 flex gap-3 items-start relative"
                  >
                    <div className="shrink-0 w-10 h-14 rounded bg-muted overflow-hidden flex items-center justify-center">
                      {b.cover_url ? (
                        <img src={b.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="truncate text-foreground" style={{ fontFamily: '"Josefin Sans", sans-serif', fontSize: '13px' }}>
                        {b.title}
                      </div>
                      <div className="truncate text-muted-foreground" style={{ fontSize: '11px' }}>
                        {b.author || '—'}
                      </div>
                      <div className="truncate text-muted-foreground flex items-center gap-1.5" style={{ fontSize: '10px' }}>
                        <span>{[b.year, b.publisher].filter(Boolean).join(' · ') || ''}</span>
                        {b.source === 'community' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-accent/20 text-accent" style={{ fontSize: '9px' }}>
                            🇵🇹 {t('add_book.community_cache_badge')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="absolute right-2 bottom-1.5 text-muted-foreground" style={{ fontSize: '9px' }}>
                      ISBN {b.isbn}
                    </span>
                  </button>
                ))}
                {searchResults.length > 0 && (
                  <button
                    onClick={() => { setShowResults(false); setMode('manual'); setIsManualFill(true); }}
                    className="w-full text-left px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/20 border-t border-border"
                  >
                    {t('add_book.manual_isbn_link')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Borrowed toggle in ISBN mode */}
          {!isWishlist && (
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-muted-foreground">{t('addBook.isBorrowed')}</label>
              <Switch checked={isBorrowed} onCheckedChange={setIsBorrowed} />
            </div>
          )}

          <button
            onClick={() => setMode('manual')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('addBook.manualEntry')}
          </button>
        </div>
      )}


      {mode === 'manual' && (
        <div className="space-y-4" data-tutorial="add-fields">
          {/* Community source badge */}
          {bookSource === 'community' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-xs text-muted-foreground">
              <Info size={14} className="text-accent shrink-0" />
              {t('addBook.communitySource')}
            </div>
          )}

          {/* Manual fill banner */}
          {isManualFill && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-xs text-muted-foreground">
              <Info size={14} className="text-accent shrink-0" />
              {t('addBook.manualFillBanner')}
            </div>
          )}

          {form.cover_url && (
            <div className="flex justify-center mb-4">
              <img src={form.cover_url} alt="" className="h-40 object-cover rounded" />
            </div>
          )}

          <Input placeholder={t('addBook.titleField')} value={form.title} onChange={e => update('title', e.target.value)} className="bg-background border-border text-sm" />
          <Input placeholder={t('addBook.author')} value={form.author} onChange={e => update('author', e.target.value)} className="bg-background border-border text-sm" />
          <div className="space-y-1">
            {isbnLocked ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-foreground text-xs">
                <Lock size={12} className="text-muted-foreground" />
                <span>ISBN: {form.isbn}</span>
              </div>
            ) : (
              <Input
                ref={isbnFieldRef}
                placeholder={`${t('addBook.isbn')} *`}
                value={form.isbn}
                onChange={e => { update('isbn', e.target.value); if (e.target.value.trim()) setIsbnError(''); }}
                aria-required="true"
                aria-invalid={!!isbnError}
                className={cn("bg-background border-border text-sm", isbnError && "border-destructive")}
              />
            )}
            {isbnError && (
              <p className="text-destructive" style={{ fontSize: '12px' }}>{isbnError}</p>
            )}
            {!isbnLocked && (
              <>
                <button
                  type="button"
                  onClick={() => setShowIsbnHelp(v => !v)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontSize: '11px' }}
                >
                  <ChevronDown size={12} className={cn("transition-transform", showIsbnHelp && "rotate-180")} />
                  {t('add_book.isbn_help_link', 'Não sabes o ISBN?')}
                </button>
                {showIsbnHelp && (
                  <p className="text-muted-foreground bg-muted/50 rounded p-2" style={{ fontSize: '11px' }}>
                    {t('add_book.isbn_help')}
                  </p>
                )}
              </>
            )}
          </div>
          <Input placeholder={t('addBook.publisher')} value={form.publisher} onChange={e => update('publisher', e.target.value)} className="bg-background border-border text-sm" />
          <Input placeholder={t('addBook.publishDate')} value={form.publish_date} onChange={e => update('publish_date', e.target.value)} className="bg-background border-border text-sm" />

          <select
            value={form.format}
            onChange={e => update('format', e.target.value)}
            className="w-full h-10 px-3 text-sm border border-border rounded bg-background text-foreground"
          >
            {formatOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
          <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()} className="w-full text-sm">
            <Upload size={14} className="mr-2" /> {t('addBook.uploadCover')}
          </Button>
          <div className="flex gap-2">
            <Input placeholder={t('addBook.seriesName')} value={form.series_name} onChange={e => update('series_name', e.target.value)} className="bg-background border-border text-sm flex-1" />
            <Input placeholder={t('addBook.volumeNumber')} value={form.volume_number} onChange={e => update('volume_number', e.target.value)} className="bg-background border-border text-sm w-20" type="number" />
          </div>
          <div className="flex gap-2">
            <Input placeholder={t('addBook.language')} value={form.language} onChange={e => update('language', e.target.value)} className="bg-background border-border text-sm flex-1" />
            <Input placeholder={t('addBook.pages')} value={form.page_count} onChange={e => update('page_count', e.target.value)} className="bg-background border-border text-sm w-20" type="number" />
          </div>
          <GenreMultiSelect selected={genres} onChange={setGenres} />

          {/* Tags */}
          <div data-tutorial="add-tags">
            <div className="flex gap-2 mb-2">
              <Input
                placeholder={t('addBook.addTag')}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="bg-background border-border text-sm"
                disabled={tags.length >= 5}
              />
              <Button variant="outline" onClick={addTag} disabled={tags.length >= 5} size="sm">{t('addBook.add')}</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">
                  {tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Borrowed book toggle */}
          {!isWishlist && (
            <div className="space-y-3 border border-border rounded p-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">{t('addBook.isBorrowed')}</label>
                <Switch checked={isBorrowed} onCheckedChange={setIsBorrowed} />
              </div>
              {isBorrowed && (
                <>
                  <Input
                    placeholder={t('addBook.borrowedFrom')}
                    value={borrowedFrom}
                    onChange={e => setBorrowedFrom(e.target.value)}
                    className="bg-background border-border text-sm"
                  />
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t('addBook.returnBy')}</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-sm",
                            !returnByDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon size={14} className="mr-2" />
                          {returnByDate ? format(returnByDate, "PPP") : t('addBook.returnByPlaceholder')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnByDate}
                          onSelect={setReturnByDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {returnByDate && (
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground">{t('addBook.borrowNotify')}</label>
                      <Switch checked={borrowNotify} onCheckedChange={setBorrowNotify} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!isWishlist && (
            <Textarea placeholder={t('addBook.notes')} value={form.notes} onChange={e => update('notes', e.target.value)} className="bg-background border-border text-sm resize-none" rows={3} />
          )}

          {libraries.length > 1 && (
            <select
              value={libraryId}
              onChange={e => setLibraryId(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-border rounded bg-background text-foreground"
            >
              {libraries.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button data-tutorial="add-save" onClick={save} disabled={loading || !form.title.trim()} className="w-full h-11">
            {loading ? t('addBook.saving') : isWishlist ? t('addBook.addToWishlistBtn') : t('addBook.saveToLibrary')}
          </Button>

          {mode === 'manual' && (
            <button onClick={() => setMode('isbn')} className="text-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors">
              {t('addBook.backToIsbn')}
            </button>
          )}
        </div>
      )}

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={(code) => {
          setScannerOpen(false);
          setQuery(code);
          setTimeout(() => { fillFormFromIsbn(code); }, 50);
        }}
      />
    </div>
  );
}
