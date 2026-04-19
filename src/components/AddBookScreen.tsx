import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchBookByISBN, saveToBookCache } from '@/lib/isbn';
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
import { Camera, X, Upload, CalendarIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import GenreMultiSelect, { parseGenres, serializeGenres } from '@/components/GenreMultiSelect';
import HelpButton from '@/components/tutorial/HelpButton';

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
  const [isbn, setIsbn] = useState('');
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

  const lookupISBN = async () => {
    if (!isbn.trim()) return;
    setLoading(true);
    setError('');
    setBookSource(null);
    setIsManualFill(false);
    const result = await fetchBookByISBN(isbn.trim());
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
      setMode('manual');
    } else {
      // Not found anywhere — switch to manual mode with ISBN pre-filled
      setForm({
        ...form,
        isbn: isbn.trim(),
        title: '', author: '', publisher: '', publish_date: '',
        cover_url: '', language: '', page_count: '', genre: '',
      });
      setIsManualFill(true);
      setBookSource(null);
      setMode('manual');
    }
    setLoading(false);
  };

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
    { value: 'Softcover', label: t('addBook.softcover') },
    { value: 'Hardcover', label: t('addBook.hardcover') },
    { value: 'Ebook', label: t('addBook.ebook') },
    { value: 'Other', label: t('addBook.other') },
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
              onClick={() => {}}
            >
              <Camera size={16} /> {t('addBook.scanIsbn')}
            </button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t('addBook.enterIsbn')}
              value={isbn}
              onChange={e => setIsbn(e.target.value)}
              className="bg-background border-border text-sm"
              onKeyDown={e => e.key === 'Enter' && lookupISBN()}
            />
            <Button onClick={lookupISBN} disabled={loading} variant="outline">
              {loading ? <OwlLoader size={16} inline /> : t('addBook.lookUp')}
            </Button>
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
          <Input placeholder={t('addBook.isbn')} value={form.isbn} onChange={e => update('isbn', e.target.value)} className="bg-background border-border text-sm" />
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
    </div>
  );
}
