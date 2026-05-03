import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Star, BookOpen, Pencil, X, Camera, Upload, Trash2, MoreVertical } from 'lucide-react';
import { uploadFileToStorage } from '@/lib/storage';
import GenreMultiSelect, { parseGenres, serializeGenres } from '@/components/GenreMultiSelect';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/i18n';
import { useAppToast } from '@/components/ToastNotification';
import { useCelebration } from '@/components/CelebrationOverlay';
import MoveToLibrarySheet from '@/components/MoveToLibrarySheet';

import { tFormat, tGenre, tStatus } from '@/lib/displayMappings';

interface BookDetailProps {
  bookId: string;
  onBack: () => void;
}

interface Book {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publish_date: string | null;
  format: string | null;
  cover_url: string | null;
  series_name: string | null;
  volume_number: number | null;
  language: string | null;
  page_count: number | null;
  genre: string | null;
  tags: string[] | null;
  notes: string | null;
  reading_status: string;
  rating: number | null;
  created_at: string;
}


export default function BookDetail({ bookId, onBack }: BookDetailProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useAppToast();
  const { celebrate } = useCelebration();
  const [book, setBook] = useState<Book | null>(null);
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editGenres, setEditGenres] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [deletingBook, setDeletingBook] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [allLibraries, setAllLibraries] = useState<{ id: string; name: string }[]>([]);
  const [bookLibraryId, setBookLibraryId] = useState<string>('');
  const [showMoveSheet, setShowMoveSheet] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('folium-book-detail', { detail: { open: true, bookId } }));
    loadBook();
    if (user) {
      supabase.from('libraries').select('id, name').eq('user_id', user.id).then(({ data }) => {
        if (data) setAllLibraries(data);
      });
    }
    return () => {
      window.dispatchEvent(new CustomEvent('folium-book-detail', { detail: { open: false, bookId } }));
    };
  }, [bookId]);

  const loadBook = async () => {
    const { data } = await supabase.from('books').select('*').eq('id', bookId).single();
    if (data) {
      setBook(data as Book);
      setNotes(data.notes || '');
      setBookLibraryId(data.library_id);
    }
  };


  const updateStatus = async (status: string) => {
    await supabase.from('books').update({
      reading_status: status,
      ...(status !== 'Read' ? { rating: null } : {})
    }).eq('id', bookId);
    showToast('Changes saved.');
    loadBook();
  };

  const updateRating = async (rating: number) => {
    await supabase.from('books').update({ rating }).eq('id', bookId);
    loadBook();
  };

  const saveNotes = async () => {
    await supabase.from('books').update({ notes }).eq('id', bookId);
  };


  const deleteBook = async () => {
    if (!book) return;
    setDeletingBook(true);

    if (book.isbn) {
      await supabase.from('reading_list_books').delete().eq('isbn', book.isbn);
    }
    await supabase.from('user_favourites').delete().eq('source_book_id', bookId);
    await supabase.from('books').delete().eq('id', bookId);

    setDeletingBook(false);
    setShowDeleteConfirm(false);
    showToast(t('bookDetail.bookDeleted'));
    onBack();
  };

  const startEditing = () => {
    if (!book) return;
    setEditForm({
      title: book.title,
      author: book.author || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publish_date: book.publish_date || '',
      format: book.format || 'Softcover',
      series_name: book.series_name || '',
      volume_number: book.volume_number?.toString() || '',
      language: book.language || '',
      page_count: book.page_count?.toString() || '',
      genre: book.genre || '',
    });
    setEditTags(book.tags || []);
    setEditTagInput('');
    setEditGenres(parseGenres(book.genre));
    setEditing(true);
  };

  const saveEdits = async () => {
    setSaving(true);
    await supabase.from('books').update({
      title: editForm.title.trim(),
      author: editForm.author || null,
      isbn: editForm.isbn || null,
      publisher: editForm.publisher || null,
      publish_date: editForm.publish_date || null,
      format: editForm.format,
      series_name: editForm.series_name || null,
      volume_number: editForm.volume_number ? parseInt(editForm.volume_number) : null,
      language: editForm.language || null,
      page_count: editForm.page_count ? parseInt(editForm.page_count) : null,
      genre: serializeGenres(editGenres),
      tags: editTags,
    }).eq('id', bookId);
    setSaving(false);
    setEditing(false);
    showToast('Changes saved.');
    loadBook();
  };

  const addEditTag = () => {
    if (editTagInput.trim() && editTags.length < 5 && !editTags.includes(editTagInput.trim())) {
      setEditTags([...editTags, editTagInput.trim()]);
      setEditTagInput('');
    }
  };

  const uploadCover = async (file: File) => {
    if (!user || !book) return;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${bookId}.${ext}`;
    const publicUrl = await uploadFileToStorage('book-covers', path, file);
    if (!publicUrl) {
      showToast('Upload failed');
      return;
    }
    await supabase.from('books').update({ cover_url: publicUrl }).eq('id', bookId);
    setShowCoverMenu(false);
    loadBook();
  };

  const removeCover = async () => {
    await supabase.from('books').update({ cover_url: null }).eq('id', bookId);
    setShowCoverMenu(false);
    loadBook();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadCover(file);
  };

  const moveBook = async (targetLibraryId: string, targetLibraryName: string) => {
    await supabase.from('books').update({ library_id: targetLibraryId }).eq('id', bookId);
    setShowMoveSheet(false);
    setBookLibraryId(targetLibraryId);
    showToast(t('library.bookMovedTo', { name: targetLibraryName }));
  };

  if (!book) return null;

  const statuses = ['Unread', 'Currently Reading', 'Read'];
  const formatOptions = [
    { value: 'Softcover', label: tFormat('Softcover', t) },
    { value: 'Hardcover', label: tFormat('Hardcover', t) },
    { value: 'Ebook', label: tFormat('Ebook', t) },
    { value: 'Other', label: tFormat('Other', t) },
  ];

  const metaRows = [
    [t('bookDetail.publisher'), book.publisher],
    [t('bookDetail.published'), book.publish_date],
    [t('bookDetail.added'), formatDate(book.created_at)],
    [t('bookDetail.format'), book.format ? tFormat(book.format, t) : null],
    [t('bookDetail.series'), book.series_name ? `${book.series_name}${book.volume_number ? ` #${book.volume_number}` : ''}` : null],
    [t('bookDetail.language'), book.language],
    [t('bookDetail.pages'), book.page_count?.toString()],
  ].filter(([, val]) => val);

  const updateField = (field: string, value: string) => setEditForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> {t('bookDetail.back')}
        </button>
        {!editing && (
          <div className="flex items-center gap-2">
            <button onClick={startEditing} className="text-muted-foreground hover:text-foreground transition-colors">
              <Pencil size={16} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border">
                <DropdownMenuItem onClick={() => setShowMoveSheet(true)}>
                  {t('library.moveToLibrary')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Cover */}
      <div className="flex justify-center mb-6 relative">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
        <button onClick={() => setShowCoverMenu(true)} className="relative group">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="h-56 object-cover rounded group-hover:opacity-80 transition-opacity" />
          ) : (
            <div className="w-36 h-56 bg-secondary rounded flex items-center justify-center group-hover:bg-secondary/70 transition-colors">
              <BookOpen size={32} className="text-muted-foreground" strokeWidth={1} />
            </div>
          )}
        </button>
      </div>

      {/* Cover menu popover */}
      <Dialog open={showCoverMenu} onOpenChange={setShowCoverMenu}>
        <DialogContent className="bg-background border-border max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-serif text-base">{t('bookDetail.coverMenu')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <button
              onClick={() => { setShowCoverMenu(false); fileInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 py-2.5 px-3 text-sm text-foreground hover:bg-secondary/50 rounded transition-colors"
            >
              <Upload size={16} className="text-muted-foreground" /> {t('bookDetail.browseFile')}
            </button>
            <button
              onClick={() => { setShowCoverMenu(false); cameraInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 py-2.5 px-3 text-sm text-foreground hover:bg-secondary/50 rounded transition-colors"
            >
              <Camera size={16} className="text-muted-foreground" /> {t('bookDetail.takePhoto')}
            </button>
            {book.cover_url && (
              <button
                onClick={removeCover}
                className="w-full flex items-center gap-3 py-2.5 px-3 text-sm text-destructive hover:bg-secondary/50 rounded transition-colors"
              >
                <Trash2 size={16} /> {t('bookDetail.removeCover')}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editing ? (
        /* ─── EDIT MODE ─── */
        <div className="space-y-4">
          <Input placeholder={t('addBook.titleField')} value={editForm.title} onChange={e => updateField('title', e.target.value)} className="bg-background border-border text-sm" />
          <Input placeholder={t('addBook.author')} value={editForm.author} onChange={e => updateField('author', e.target.value)} className="bg-background border-border text-sm" />
          <Input placeholder={t('bookDetail.isbn')} value={editForm.isbn} onChange={e => updateField('isbn', e.target.value)} className="bg-background border-border text-sm" />
          <Input placeholder={t('bookDetail.publisher')} value={editForm.publisher} onChange={e => updateField('publisher', e.target.value)} className="bg-background border-border text-sm" />
          <Input placeholder={t('bookDetail.published')} value={editForm.publish_date} onChange={e => updateField('publish_date', e.target.value)} className="bg-background border-border text-sm" />
          <select
            value={editForm.format}
            onChange={e => updateField('format', e.target.value)}
            className="w-full h-10 px-3 text-sm border border-border rounded bg-background text-foreground"
          >
            {formatOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <Input placeholder={t('bookDetail.seriesName')} value={editForm.series_name} onChange={e => updateField('series_name', e.target.value)} className="bg-background border-border text-sm flex-1" />
            <Input placeholder={t('bookDetail.volumeNumber')} value={editForm.volume_number} onChange={e => updateField('volume_number', e.target.value)} className="bg-background border-border text-sm w-20" type="number" />
          </div>
          <div className="flex gap-2">
            <Input placeholder={t('bookDetail.language')} value={editForm.language} onChange={e => updateField('language', e.target.value)} className="bg-background border-border text-sm flex-1" />
            <Input placeholder={t('bookDetail.pages')} value={editForm.page_count} onChange={e => updateField('page_count', e.target.value)} className="bg-background border-border text-sm w-20" type="number" />
          </div>
          <GenreMultiSelect selected={editGenres} onChange={setEditGenres} />

          {/* Tags editor */}
          <div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder={t('bookDetail.addTag')}
                value={editTagInput}
                onChange={e => setEditTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditTag(); } }}
                className="bg-background border-border text-sm"
                disabled={editTags.length >= 5}
              />
              <Button variant="outline" onClick={addEditTag} disabled={editTags.length >= 5} size="sm">{t('addBook.add')}</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {editTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">
                  {tag}
                  <button onClick={() => setEditTags(editTags.filter(t2 => t2 !== tag))}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">{t('bookDetail.cancelEdit')}</Button>
            <Button onClick={saveEdits} disabled={saving || !editForm.title.trim()} className="flex-1">
              {saving ? t('bookDetail.saving') : t('bookDetail.saveChanges')}
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 text-sm text-destructive/80 hover:text-destructive transition-colors"
            >
              <Trash2 size={15} />
              {t('bookDetail.deleteBook')}
            </button>
          </div>
        </div>
      ) : (
        /* ─── VIEW MODE ─── */
        <>
          <h1 className="font-serif text-2xl text-foreground text-center mb-1">{book.title}</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">{book.author || t('bookDetail.unknownAuthor')}</p>

          <div className="flex border border-border rounded overflow-hidden mb-6">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`flex-1 py-2 text-xs transition-colors ${
                  book.reading_status === s
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tStatus(s, t)}
              </button>
            ))}
          </div>

          {book.reading_status === 'Read' && (
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => updateRating(n)}>
                  <Star
                    size={24}
                    className={n <= (book.rating || 0) ? 'text-gold fill-gold' : 'text-border'}
                    strokeWidth={1}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mb-6">
            {metaRows.map(([label, value]) => (
              <div key={label as string} className="flex justify-between py-2.5 border-b border-border text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground">{value}</span>
              </div>
            ))}
          </div>

          {/* Genres */}
          {(() => {
            const genres = parseGenres(book.genre);
            return genres.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {genres.map(g => (
                  <span key={g} className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">{tGenre(g, t)}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-4">{t('bookDetail.noGenre')}</p>
            );
          })()}

          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {book.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm text-muted-foreground mb-2">{t('bookDetail.myNotes')}</h3>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder={t('bookDetail.notesPlaceholder')}
              className="bg-background border-border text-sm resize-none"
              rows={4}
            />
          </div>

        </>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('bookDetail.deleteBookTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('bookDetail.deleteBookDesc')}
              {activeLoan && <span className="mt-2 block">{t('bookDetail.deleteBookActiveLoan')}</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBook}>{t('profile.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingBook}
              onClick={(event) => {
                event.preventDefault();
                deleteBook();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('bookDetail.confirmDeleteBook')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MoveToLibrarySheet
        open={showMoveSheet}
        onOpenChange={setShowMoveSheet}
        libraries={allLibraries}
        currentLibraryId={bookLibraryId}
        onSelect={moveBook}
      />
    </div>
  );
}
