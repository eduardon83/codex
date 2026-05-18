import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, Search, Hourglass, Timer as TimerIcon, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { SelectedBookForSession, SessionMode } from '@/lib/readingSessions';

interface BookRow {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (config: {
    book: SelectedBookForSession;
    mode: SessionMode;
    targetSeconds?: number;
    keepScreenOn: boolean;
  }) => void;
}

type Step = 'choose' | 'custom' | 'timing';

const PRESETS: { label: string; minutes: number }[] = [
  { label: '15 min', minutes: 15 },
  { label: '20 min', minutes: 20 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '1h30', minutes: 90 },
  { label: '2h', minutes: 120 },
];

export default function SessionSetupSheet({ open, onOpenChange, onStart }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('choose');
  const [books, setBooks] = useState<BookRow[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SelectedBookForSession | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [mode, setMode] = useState<SessionMode>('chronometer');
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [keepScreenOn, setKeepScreenOn] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [showLibrarySearch, setShowLibrarySearch] = useState(false);

  useEffect(() => {
    if (!open) {
      // reset shortly after close
      const t = setTimeout(() => {
        setStep('choose');
        setSelected(null);
        setCustomTitle('');
        setCustomAuthor('');
        setMode('chronometer');
        setTimerMinutes(30);
        setCustomMinutes('');
        setShowLibrarySearch(false);
        setQuery('');
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!showLibrarySearch || !user) return;
    setLoadingBooks(true);
    supabase
      .from('books')
      .select('id, title, author, cover_url')
      .eq('user_id', user.id)
      .eq('is_wishlist', false)
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setBooks((data as BookRow[]) || []);
        setLoadingBooks(false);
      });
  }, [showLibrarySearch, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(b =>
      b.title.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q)
    );
  }, [books, query]);

  const selectFromLibrary = (b: BookRow) => {
    setSelected({ book_id: b.id, title: b.title, author: b.author, cover_url: b.cover_url });
    setShowLibrarySearch(false);
    setStep('timing');
  };

  const submitCustom = () => {
    const title = customTitle.trim();
    if (!title) return;
    setSelected({ title, author: customAuthor.trim() || null });
    setStep('timing');
  };

  const handleStart = () => {
    if (!selected) return;
    const targetSeconds =
      mode === 'timer'
        ? Math.max(60, Math.min(480, Number(customMinutes) || timerMinutes)) * 60
        : undefined;
    onStart({ book: selected, mode, targetSeconds, keepScreenOn });
  };

  const headerLabel =
    step === 'choose' ? t('reading_mode.choose_what', 'O que vais ler?') :
    step === 'custom' ? t('reading_mode.other_book', 'Outro livro') :
    t('reading_mode.timing_title', 'Como queres ler?');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[88vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            {step !== 'choose' && (
              <button
                onClick={() => setStep(step === 'timing' ? (selected?.book_id ? 'choose' : 'custom') : 'choose')}
                aria-label="Voltar"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <SheetTitle className="font-serif text-xl text-left">{headerLabel}</SheetTitle>
          </div>
        </SheetHeader>

        {/* STEP 1 */}
        {step === 'choose' && !showLibrarySearch && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowLibrarySearch(true)}
              className="border border-border rounded-md p-5 text-left hover:border-foreground transition-colors flex flex-col items-start gap-3 min-h-[140px]"
            >
              <BookOpen size={24} className="text-accent" />
              <span className="font-serif text-base text-foreground">
                {t('reading_mode.from_library', 'Da minha biblioteca')}
              </span>
            </button>
            <button
              onClick={() => setStep('custom')}
              className="border border-border rounded-md p-5 text-left hover:border-foreground transition-colors flex flex-col items-start gap-3 min-h-[140px]"
            >
              <Plus size={24} className="text-accent" />
              <span className="font-serif text-base text-foreground">
                {t('reading_mode.other_book', 'Outro livro')}
              </span>
            </button>
          </div>
        )}

        {/* STEP 1 — library search */}
        {step === 'choose' && showLibrarySearch && (
          <div className="mt-5 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('library.searchPlaceholder', 'Pesquisar por título ou autor…')}
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
            <div className="max-h-[55vh] overflow-y-auto -mx-1 px-1">
              {loadingBooks && <p className="text-sm text-muted-foreground py-6 text-center">…</p>}
              {!loadingBooks && filtered.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {t('reading_mode.no_books', 'Sem livros para mostrar.')}
                </p>
              )}
              <ul className="divide-y divide-border">
                {filtered.map(b => (
                  <li key={b.id}>
                    <button
                      onClick={() => selectFromLibrary(b)}
                      className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-muted/50 px-1 rounded"
                    >
                      {b.cover_url ? (
                        <img src={b.cover_url} alt="" className="w-9 h-12 object-cover rounded-sm" />
                      ) : (
                        <div className="w-9 h-12 bg-muted rounded-sm" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{b.title}</p>
                        {b.author && <p className="text-xs text-muted-foreground truncate">{b.author}</p>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* STEP 2 — custom book */}
        {step === 'custom' && (
          <div className="mt-5 space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('reading_mode.title_field', 'Título')}
              </Label>
              <Input value={customTitle} onChange={e => setCustomTitle(e.target.value)} autoFocus className="mt-1" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('reading_mode.author_field', 'Autor')}
              </Label>
              <Input value={customAuthor} onChange={e => setCustomAuthor(e.target.value)} className="mt-1" />
            </div>
            <Button onClick={submitCustom} disabled={!customTitle.trim()} className="w-full">
              {t('reading_mode.continue', 'Continuar')}
            </Button>
          </div>
        )}

        {/* STEP 3 — timing */}
        {step === 'timing' && selected && (
          <div className="mt-5 space-y-5">
            {/* book summary */}
            <div className="flex items-center gap-3">
              {selected.cover_url ? (
                <img src={selected.cover_url} alt="" className="w-[80px] h-[112px] object-cover rounded-sm" />
              ) : (
                <div className="w-[80px] h-[112px] bg-muted rounded-sm flex items-center justify-center">
                  <BookOpen size={24} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-serif italic text-lg text-foreground leading-tight">{selected.title}</p>
                {selected.author && <p className="text-xs text-muted-foreground mt-1">{selected.author}</p>}
              </div>
            </div>

            {/* mode cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('chronometer')}
                className={`border rounded-md p-4 text-left transition-colors flex flex-col gap-2 ${
                  mode === 'chronometer' ? 'border-foreground bg-muted/40' : 'border-border hover:border-foreground'
                }`}
              >
                <TimerIcon size={20} className="text-accent" />
                <span className="font-serif text-sm text-foreground">{t('reading_mode.chronometer', 'Cronómetro')}</span>
                <span className="text-[11px] text-muted-foreground">{t('reading_mode.chronometer_desc', 'Conta a partir de 0')}</span>
              </button>
              <button
                onClick={() => setMode('timer')}
                className={`border rounded-md p-4 text-left transition-colors flex flex-col gap-2 ${
                  mode === 'timer' ? 'border-foreground bg-muted/40' : 'border-border hover:border-foreground'
                }`}
              >
                <Hourglass size={20} className="text-accent" />
                <span className="font-serif text-sm text-foreground">{t('reading_mode.timer', 'Temporizador')}</span>
                <span className="text-[11px] text-muted-foreground">{t('reading_mode.timer_desc', 'Conta decrescente')}</span>
              </button>
            </div>

            {mode === 'timer' && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t('reading_mode.duration', 'Duração')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.minutes}
                      onClick={() => { setTimerMinutes(p.minutes); setCustomMinutes(''); }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        !customMinutes && timerMinutes === p.minutes
                          ? 'border-foreground text-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <Input
                    type="number"
                    min={1}
                    max={480}
                    value={customMinutes}
                    onChange={e => setCustomMinutes(e.target.value)}
                    placeholder={t('reading_mode.custom_min', 'min')}
                    className="w-20 h-8 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-foreground">{t('reading_mode.keep_screen', 'Manter ecrã activo')}</span>
              <Switch checked={keepScreenOn} onCheckedChange={setKeepScreenOn} />
            </div>

            <Button onClick={handleStart} className="w-full">
              {t('reading_mode.start', 'Começar a ler →')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
