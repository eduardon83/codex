import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Circle, CircleDashed, HelpCircle, Leaf, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, THEMES } from '@/hooks/useTheme';
import { useContent } from '@/hooks/useContent';
import { fetchBookByISBN, BookData } from '@/lib/isbn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SchoolSelector from '@/components/SchoolSelector';
import birchTree from '@/assets/tree-birch.svg';
import elmTree from '@/assets/tree-elm.svg';
import oakTree from '@/assets/tree-oak.svg';
import oliveTree from '@/assets/tree-oliveira.svg';
import { cn } from '@/lib/utils';

type ChapterStatus = 'pending' | 'completed' | 'skipped';
type ProgressStyle = 'dots' | 'tree' | 'chapters';
type TabId = 'library' | 'lists' | 'find' | 'events' | 'profile';

type DemoBook = {
  id?: string;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
};

type TutorialContextValue = {
  isActive: boolean;
  currentStep: number;
  chapterStatus: ChapterStatus[];
  startTutorial: (step?: number, revisit?: boolean) => void;
  openChapterMap: () => void;
  closeTutorial: () => void;
};

const TutorialContext = createContext<TutorialContextValue | undefined>(undefined);
const STATUS_DEFAULT: ChapterStatus[] = Array.from({ length: 10 }, () => 'pending');
const PROGRESS_KEY = 'folium_tutorial_progress_style';
const chapterNames = ['Biblioteca', 'Livro', 'Detalhes', 'Perfil', 'Escola', 'Temas', 'Procurar', 'Listas', 'Eventos', 'Pronto'];

function parseStatuses(value: unknown): ChapterStatus[] {
  if (Array.isArray(value)) {
    const next = value.slice(0, 10).map((v) => (v === 'completed' || v === 'skipped' ? v : 'pending')) as ChapterStatus[];
    while (next.length < 10) next.push('pending');
    return next;
  }
  return STATUS_DEFAULT;
}

function dispatchTab(tab: TabId) {
  window.dispatchEvent(new CustomEvent('folium-tutorial-navigate', { detail: { tab } }));
}

function treeAssetFor(themeId: string) {
  const found = THEMES.find((t) => t.id === themeId);
  if (found?.tree === 'carvalho') return oakTree;
  if (found?.tree === 'olmo') return elmTree;
  if (found?.tree === 'oliveira') return oliveTree;
  return birchTree;
}

function targetForStep(step: number, activeTab: string, bookDetailOpen: boolean) {
  if (step === 0) return '[data-tutorial="library-tabs"]';
  if (step === 1) return '[data-tutorial="library-add"]';
  if (step === 2) return bookDetailOpen ? null : '[data-tutorial="library-book-row"]';
  if (step === 3) return '[data-tutorial-nav="profile"]';
  if (step === 4) return '[data-tutorial="school-selector"]';
  if (step === 5) return '[data-tutorial="profile-stats"], [data-tutorial="profile-theme"]';
  if (step === 6) return activeTab === 'find' ? '[data-tutorial="procurar-tabs"]' : '[data-tutorial-nav="find"]';
  if (step === 7) return activeTab === 'lists' ? '[data-tutorial="listas-tabs"]' : '[data-tutorial-nav="lists"]';
  if (step === 8) return activeTab === 'events' ? '[data-tutorial="events-filters"]' : '[data-tutorial-nav="events"]';
  return null;
}

export function FoliumTutorialProvider({ children }: { children: ReactNode }) {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, currentTheme, setTheme } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [revisitMode, setRevisitMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [chapterStatus, setChapterStatus] = useState<ChapterStatus[]>(STATUS_DEFAULT);
  const [progressStyle, setProgressStyle] = useState<ProgressStyle>(() => (localStorage.getItem(PROGRESS_KEY) as ProgressStyle) || 'dots');
  const [activeTab, setActiveTab] = useState('library');
  const [bookDetailOpen, setBookDetailOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [libraryName, setLibraryName] = useState('');
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const [demoBook, setDemoBook] = useState<DemoBook | null>(null);
  const [isbn, setIsbn] = useState('');
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'found' | 'failed' | 'added'>('idle');
  const [foundBook, setFoundBook] = useState<BookData | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [themeChanged, setThemeChanged] = useState(false);
  const [selectedSchoolName, setSelectedSchoolName] = useState<string | null>(null);

  useEffect(() => {
    void supabase.from('app_content').select('key, value_pt, value_en, value_fr, value_es').eq('category', 'tutorial');
  }, []);

  useEffect(() => {
    const savedStatuses = parseStatuses((profile as any)?.tutorial_chapter_statuses);
    setChapterStatus(savedStatuses);
    setCurrentStep(Math.min(Math.max((profile as any)?.tutorial_step ?? 0, 0), 9));
  }, [profile]);

  useEffect(() => {
    if (!user || !profile || isActive) return;
    const completed = Boolean((profile as any).tutorial_completed);
    const started = Boolean((profile as any).tutorial_started_at);
    if (!completed && !started && profile.profile_completed && profile.account_status === 'active') {
      const timer = window.setTimeout(() => {
        setIsFirstRun(true);
        setRevisitMode(false);
        setCurrentStep(0);
        setIsActive(true);
        void persist(0, chapterStatus, { tutorial_started_at: new Date().toISOString() });
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [user, profile, isActive, chapterStatus]);

  useEffect(() => {
    const onTab = (event: Event) => {
      const tab = (event as CustomEvent).detail?.tab;
      if (tab) setActiveTab(tab);
    };
    const onBookDetail = (event: Event) => setBookDetailOpen(Boolean((event as CustomEvent).detail?.open));
    window.addEventListener('folium-active-tab', onTab);
    window.addEventListener('folium-book-detail', onBookDetail);
    return () => {
      window.removeEventListener('folium-active-tab', onTab);
      window.removeEventListener('folium-book-detail', onBookDetail);
    };
  }, []);

  const persist = useCallback(async (step: number, statuses: ChapterStatus[], extra: Record<string, unknown> = {}) => {
    if (!user) return;
    await supabase.from('profiles').update({ tutorial_step: step, tutorial_chapter_statuses: statuses, ...extra } as any).eq('user_id', user.id);
    void refreshProfile();
  }, [user, refreshProfile]);

  const markAndMove = useCallback(async (status: ChapterStatus, nextStep = currentStep + 1) => {
    const nextStatuses = [...chapterStatus];
    nextStatuses[currentStep] = status;
    setChapterStatus(nextStatuses);
    if (nextStep >= 10) {
      setCurrentStep(9);
      await persist(9, nextStatuses);
      return;
    }
    setCurrentStep(nextStep);
    await persist(nextStep, nextStatuses);
  }, [chapterStatus, currentStep, persist]);

  const completeTutorial = async () => {
    const done = chapterStatus.map((s, i) => (i === 9 || s === 'pending' ? 'completed' : s)) as ChapterStatus[];
    setChapterStatus(done);
    await persist(9, done, { tutorial_completed: true });
    setIsActive(false);
    setShowMap(false);
    setRevisitMode(false);
    dispatchTab('library');
  };

  const startTutorial = useCallback((step = 0, revisit = false) => {
    setCurrentStep(Math.min(Math.max(step, 0), 9));
    setRevisitMode(revisit);
    setIsFirstRun(!revisit);
    setShowMap(false);
    setIsActive(true);
  }, []);

  const openChapterMap = useCallback(() => {
    setRevisitMode(true);
    setShowMap(true);
    setIsActive(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setIsActive(false);
    setShowMap(false);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const expected: Record<number, TabId> = { 3: 'profile', 6: 'find', 7: 'lists', 8: 'events' };
    if (expected[currentStep] && activeTab === expected[currentStep]) {
      if (currentStep === 3) void markAndMove('completed');
    }
  }, [activeTab, currentStep, isActive, markAndMove]);

  useEffect(() => {
    if (!isActive || currentStep !== 4 || activeTab !== 'profile') return;
    if ((profile as any)?.school_id) {
      const timer = window.setTimeout(() => void markAndMove('completed'), 2000);
      return () => window.clearTimeout(timer);
    }
  }, [activeTab, currentStep, isActive, markAndMove, profile]);

  useEffect(() => {
    if (!isActive || currentStep !== 2 || !bookDetailOpen) return;
    setCelebration('Os teus pensamentos sobre um livro são tão importantes quanto o livro em si. Escreve, risca, reescreve.');
  }, [bookDetailOpen, currentStep, isActive]);

  useEffect(() => {
    if (!isActive) return;
    const measure = () => {
      const selector = targetForStep(currentStep, activeTab, bookDetailOpen);
      const el = selector ? document.querySelector(selector) as HTMLElement | null : null;
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect(r.width && r.height ? r : null);
    };
    measure();
    const timer = window.setInterval(measure, 500);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [activeTab, bookDetailOpen, currentStep, isActive]);

  useEffect(() => {
    if (!isActive) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') void markAndMove('skipped');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, markAndMove]);

  const saveProgressStyle = (style: ProgressStyle) => {
    setProgressStyle(style);
    localStorage.setItem(PROGRESS_KEY, style);
  };

  const ensureLibrary = async (name?: string) => {
    if (!user) return null;
    if (libraryId) return libraryId;
    const finalName = (name || libraryName || 'A minha biblioteca').trim();
    const { data, error } = await supabase.from('libraries').insert({ user_id: user.id, name: finalName } as any).select('id, name').single();
    if (error || !data) return null;
    setLibraryId((data as any).id);
    setLibraryName((data as any).name);
    setCelebration('Estante criada. A tua árvore está a crescer.');
    window.dispatchEvent(new Event('folium-library-refresh'));
    return (data as any).id as string;
  };

  const createShelf = async () => {
    const id = await ensureLibrary(libraryName);
    if (id) window.setTimeout(() => void markAndMove('completed'), 900);
  };

  const searchIsbn = async () => {
    const clean = (isbn || '9786556372419').replace(/[^0-9Xx]/g, '');
    setLookupState('loading');
    const result = await fetchBookByISBN(clean);
    if (!result) {
      setFoundBook(null);
      setLookupState('failed');
      return;
    }
    setFoundBook(result);
    setLookupState('found');
  };

  const addFoundBook = async () => {
    if (!user || !foundBook) return;
    const libId = await ensureLibrary();
    if (!libId) return;
    const { data, error } = await supabase.from('books').insert({
      user_id: user.id,
      library_id: libId,
      title: foundBook.title,
      author: foundBook.author || null,
      isbn: foundBook.isbn,
      publisher: foundBook.publisher || null,
      publish_date: foundBook.publish_date || null,
      cover_url: foundBook.cover_url || null,
      page_count: foundBook.page_count,
      language: foundBook.language || null,
      genre: foundBook.genre || null,
      is_wishlist: false,
    } as any).select('id, title, author, isbn, cover_url').single();
    if (error || !data) return;
    setDemoBook(data as DemoBook);
    setLookupState('added');
    window.dispatchEvent(new Event('folium-library-refresh'));
    window.setTimeout(() => void markAndMove('completed'), 900);
  };

  const continueWithDummy = async () => {
    const dummy = { title: 'Livro de exemplo', author: 'Folium', isbn: isbn || '9786556372419', cover_url: null };
    setDemoBook(dummy);
    await markAndMove('completed');
  };

  const addDemoToWishlist = async () => {
    if (!user) return;
    const libId = await ensureLibrary();
    const book = demoBook || { title: 'Livro de exemplo', author: 'Folium', isbn: '9786556372419', cover_url: null };
    if (!libId) return;
    await supabase.from('books').insert({ user_id: user.id, library_id: libId, title: book.title, author: book.author, isbn: book.isbn, cover_url: book.cover_url, is_wishlist: true } as any);
    setCelebration('Wishlist criada. Guardaste uma leitura para mais tarde.');
  };

  const value = useMemo(() => ({ isActive, currentStep, chapterStatus, startTutorial, openChapterMap, closeTutorial }), [isActive, currentStep, chapterStatus, startTutorial, openChapterMap, closeTutorial]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {isActive && (
        <TutorialOverlay
          step={currentStep}
          rect={rect}
          statuses={chapterStatus}
          progressStyle={progressStyle}
          setProgressStyle={saveProgressStyle}
          revisitMode={revisitMode}
          showMap={showMap}
          setShowMap={setShowMap}
          activeTab={activeTab}
          bookDetailOpen={bookDetailOpen}
          libraryName={libraryName}
          setLibraryName={setLibraryName}
          createShelf={createShelf}
          skip={async () => {
            if (currentStep === 0) await ensureLibrary('A minha biblioteca');
            await markAndMove('skipped');
          }}
          next={() => markAndMove('completed')}
          prev={() => setCurrentStep((s) => Math.max(0, s - 1))}
          goToStep={(step) => { setCurrentStep(step); setShowMap(false); }}
          close={closeTutorial}
          completeTutorial={completeTutorial}
          dispatchTab={dispatchTab}
          isbn={isbn}
          setIsbn={setIsbn}
          searchIsbn={searchIsbn}
          lookupState={lookupState}
          foundBook={foundBook}
          addFoundBook={addFoundBook}
          continueWithDummy={continueWithDummy}
          demoBook={demoBook}
          celebration={celebration}
          setCelebration={setCelebration}
          profile={profile}
          refreshProfile={refreshProfile}
          theme={theme}
          currentTheme={currentTheme}
          setTheme={async (id) => { setThemeChanged(true); await setTheme(id); }}
          themeChanged={themeChanged}
          selectedSchoolName={selectedSchoolName}
          setSelectedSchoolName={setSelectedSchoolName}
          addDemoToWishlist={addDemoToWishlist}
          isFirstRun={isFirstRun}
        />
      )}
    </TutorialContext.Provider>
  );
}

function ProgressIndicator({ step, statuses, style, setStyle }: { step: number; statuses: ChapterStatus[]; style: ProgressStyle; setStyle: (s: ProgressStyle) => void }) {
  const completed = statuses.filter((s) => s === 'completed').length;
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        {style === 'dots' && <div className="flex gap-1.5">{statuses.map((_, i) => <span key={i} className={cn('grid h-6 w-6 place-items-center rounded-full border text-[10px]', i === step ? 'border-accent bg-accent text-accent-foreground' : 'border-border text-muted-foreground')}>{i + 1}</span>)}</div>}
        {style === 'tree' && <div className="flex items-center gap-3"><div className="relative h-10 w-10 overflow-hidden"><img src={birchTree} alt="" className="h-10 w-10 opacity-25" /><div className="absolute inset-x-0 bottom-0 overflow-hidden transition-all duration-500" style={{ height: `${Math.max(8, completed * 10)}%` }}><img src={birchTree} alt="" className="h-10 w-10 absolute bottom-0" /></div></div><p className="text-xs text-muted-foreground">{completed}/10 capítulos</p></div>}
        {style === 'chapters' && <div className="flex gap-1 overflow-x-auto pb-1">{chapterNames.slice(0, 6).map((name, i) => <span key={name} className={cn('shrink-0 rounded-full border px-2 py-1 text-[10px]', i === step ? 'border-accent text-foreground' : 'border-border text-muted-foreground')}>{name}</span>)}</div>}
      </div>
      <button aria-label="Mudar estilo de progresso" onClick={() => setStyle(style === 'dots' ? 'tree' : style === 'tree' ? 'chapters' : 'dots')} className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">◦ ◦ ◦</button>
    </div>
  );
}

function TutorialOverlay(props: any) {
  const heading = useContent(`tutorial.chapter_${props.step + 1}.heading`);
  const body = useContent(`tutorial.chapter_${props.step + 1}.body`);
  const chapterLabel = `Tutorial do Folium — capítulo ${props.step + 1} de 10`;
  const spotlight = props.rect ? {
    top: Math.max(8, props.rect.top - 8),
    left: Math.max(8, props.rect.left - 8),
    width: props.rect.width + 16,
    height: props.rect.height + 16,
  } : null;

  if (props.showMap) return <ChapterMap {...props} />;

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none" role="dialog" aria-modal="true" aria-label={chapterLabel}>
      <style>{`@keyframes folium-branch{from{transform:scaleX(0);opacity:.3}to{transform:scaleX(1);opacity:1}} @keyframes folium-pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.04);opacity:1}}`}</style>
      <svg className="absolute inset-0 h-full w-full pointer-events-none">
        <defs><mask id="folium-tutorial-mask"><rect width="100%" height="100%" fill="white" />{spotlight && <rect x={spotlight.left} y={spotlight.top} width={spotlight.width} height={spotlight.height} rx="10" fill="black" />}</mask></defs>
        <rect width="100%" height="100%" fill="hsl(var(--background) / 0.85)" mask="url(#folium-tutorial-mask)" />
        {spotlight && <rect x={spotlight.left} y={spotlight.top} width={spotlight.width} height={spotlight.height} rx="10" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" filter="drop-shadow(0 0 8px hsl(var(--accent)))" />}
      </svg>

      {props.step === 2 && props.bookDetailOpen && (
        <div className="pointer-events-auto fixed left-4 right-4 top-4 mx-auto max-w-lg rounded-md border border-border bg-background p-3 text-sm text-foreground shadow-lg">
          Capítulo 3 do tutorial — explora à vontade e volta atrás quando quiseres.
        </div>
      )}

      <div className={cn('pointer-events-auto fixed left-4 right-4 mx-auto max-w-lg rounded-lg border border-border bg-background p-5 shadow-xl', props.step === 9 ? 'top-8 bottom-8 overflow-y-auto' : 'bottom-[9rem] max-h-[58vh] overflow-y-auto')}>
        <ProgressIndicator step={props.step} statuses={props.statuses} style={props.progressStyle} setStyle={props.setProgressStyle} />
        {props.revisitMode && <button onClick={props.prev} className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={13} /> Capítulo anterior</button>}
        {props.step === 9 ? <FinalChapter {...props} heading={heading} body={body} /> : <ChapterBody {...props} heading={heading} body={body} />}
      </div>
    </div>
  );
}

function ChapterBody(props: any) {
  const step = props.step;
  const needsNavigate = (step === 3 && props.activeTab !== 'profile') || (step === 6 && props.activeTab !== 'find') || (step === 7 && props.activeTab !== 'lists') || (step === 8 && props.activeTab !== 'events');
  return (
    <>
      <h2 className="font-['Cormorant_Garamond'] text-3xl leading-none text-foreground">{props.heading}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-['Josefin_Sans']">{props.body}</p>
      <div className="mt-5 space-y-4">
        {step === 0 && <ShelfCreator {...props} />}
        {step === 1 && <IsbnLookup {...props} />}
        {step === 2 && <BookExplore {...props} />}
        {step === 3 && <NavigatePrompt tab="profile" label="Toca no separador Perfil" {...props} />}
        {step === 4 && <SchoolChapter {...props} />}
        {step === 5 && <ThemeChapter {...props} />}
        {step === 6 && <ObservationChapter labels={['Livros', 'Bibliotecas', 'Listas de Leitura']} tab="find" {...props} />}
        {step === 7 && <ListsChapter {...props} />}
        {step === 8 && <EventsChapter {...props} />}
      </div>
      {!['0', '1', '2', '4', '5'].includes(String(step)) && !needsNavigate && step !== 7 && step !== 8 && (
        <Button className="mt-5 w-full" onClick={props.next}>Continuar <ChevronRight size={16} className="ml-1" /></Button>
      )}
      <button className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground" onClick={props.skip}>{props.revisitMode ? 'Saltar capítulo' : 'Fazer mais tarde'}</button>
    </>
  );
}

function ShelfCreator({ libraryName, setLibraryName, createShelf }: any) {
  return <div className="space-y-3"><label className="text-xs text-muted-foreground">Dá um nome à tua estante:</label><Input value={libraryName} onChange={(e) => setLibraryName(e.target.value)} placeholder="ex: Quarto, Sala, Escola..." autoFocus /><Button className="w-full" disabled={!libraryName.trim()} onClick={createShelf}>Criar estante</Button><BranchCelebration /></div>;
}

function BranchCelebration() { return <p className="origin-left text-xs text-accent" style={{ animation: 'folium-branch .7s ease-out both' }}>Estante criada. A tua árvore está a crescer.</p>; }

function IsbnLookup({ isbn, setIsbn, searchIsbn, lookupState, foundBook, addFoundBook, continueWithDummy }: any) {
  return <div className="space-y-3"><label className="text-xs text-muted-foreground">Experimenta com este ISBN de exemplo, ou introduz o de um livro teu:</label><div className="flex gap-2"><Input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="9786556372419" /><Button onClick={searchIsbn} disabled={lookupState === 'loading'}>{lookupState === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pesquisar'}</Button></div>{lookupState === 'loading' && <p className="text-xs text-muted-foreground">A procurar...</p>}{lookupState === 'found' && foundBook && <div className="flex gap-3 rounded-md border border-border p-3"><div className="h-20 w-14 overflow-hidden rounded bg-secondary">{foundBook.cover_url && <img src={foundBook.cover_url} alt={foundBook.title} className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="text-sm text-foreground">{foundBook.title}</p><p className="text-xs text-muted-foreground">{foundBook.author}</p><Button size="sm" className="mt-3" onClick={addFoundBook}>Adicionar à minha estante</Button></div></div>}{lookupState === 'failed' && <div className="space-y-2"><p className="text-xs text-muted-foreground">Não encontrámos este livro nas bases de dados. Podes adicioná-lo manualmente — não te preocupes, continua!</p><Button variant="outline" className="w-full" onClick={continueWithDummy}>Continuar sem livro</Button></div>}{lookupState === 'added' && <p className="text-xs text-accent">Livro adicionado à tua estante.</p>}</div>;
}

function BookExplore({ bookDetailOpen, next, demoBook }: any) {
  if (bookDetailOpen) return <div className="space-y-3"><p className="text-xs text-accent">Os teus pensamentos sobre um livro são tão importantes quanto o livro em si. Escreve, risca, reescreve.</p><Button className="w-full" onClick={next}>Próximo capítulo →</Button></div>;
  return <p className="rounded-md border border-accent/40 p-3 text-xs text-muted-foreground" style={{ animation: 'folium-pulse 1.6s ease-in-out infinite' }}>Toca no livro {demoBook?.title ? `“${demoBook.title}”` : 'destacado'} para abrir os detalhes.</p>;
}

function NavigatePrompt({ tab, label, dispatchTab }: any) {
  return <div className="space-y-2"><p className="text-xs text-muted-foreground">{label}. Se precisares, usa este atalho:</p><Button variant="outline" className="w-full" onClick={() => dispatchTab(tab)}>{label}</Button></div>;
}

function SchoolChapter({ profile, refreshProfile, next, setSelectedSchoolName }: any) {
  if ((profile as any)?.school_id) return <p className="text-xs text-accent">Já definiste a tua escola. Vamos continuar.</p>;
  return <div className="rounded-md border border-border p-3"><SchoolSelector current={{ country_code: (profile as any)?.country_code ?? null, district_id: (profile as any)?.district_id ?? null, school_id: (profile as any)?.school_id ?? null }} onSaved={async () => { await refreshProfile(); setSelectedSchoolName('Escola definida'); next(); }} /></div>;
}

function ThemeChapter({ theme, currentTheme, setTheme, themeChanged, next }: any) {
  return <div className="space-y-3"><div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">{THEMES.slice(0, 8).map((th) => <button key={th.id} onClick={() => setTheme(th.id)} className={cn('rounded-md border p-2 text-left', theme === th.id ? 'border-accent' : 'border-border')}><div className="mb-1 flex h-4 overflow-hidden rounded">{th.colors.map((c) => <span key={c} className="flex-1" style={{ backgroundColor: c }} />)}</div><p className="text-[11px] text-foreground">{th.name}</p></button>)}</div>{themeChanged && <p className="text-xs text-accent">Escolheste {currentTheme.name}. {currentTheme.description}</p>}<Button className="w-full" onClick={next}>Continuar</Button></div>;
}

function ObservationChapter({ labels, tab, activeTab, dispatchTab, next }: any) {
  if (activeTab !== tab) return <NavigatePrompt tab={tab} label={`Toca no separador ${tab === 'find' ? 'Procurar' : 'Listas'}`} dispatchTab={dispatchTab} />;
  return <div className="space-y-3"><div className="flex gap-2 overflow-x-auto">{labels.map((label: string) => <span key={label} className="shrink-0 rounded-full border border-accent px-3 py-1 text-xs text-foreground">{label}</span>)}</div><Button className="w-full" onClick={next}>Continuar</Button></div>;
}

function ListsChapter(props: any) {
  if (props.activeTab !== 'lists') return <NavigatePrompt tab="lists" label="Toca no separador Listas" dispatchTab={props.dispatchTab} />;
  return <div className="space-y-3"><div className="flex gap-2"><span className="rounded-full border border-accent px-3 py-1 text-xs">Desejos</span><span className="rounded-full border border-accent px-3 py-1 text-xs">Planos</span><span className="rounded-full border border-accent px-3 py-1 text-xs">Listas</span></div><Button variant="outline" className="w-full" onClick={props.addDemoToWishlist}>Criar a tua primeira wishlist</Button><Button className="w-full" onClick={props.next}>Continuar</Button></div>;
}

function EventsChapter(props: any) {
  if (props.activeTab !== 'events') return <NavigatePrompt tab="events" label="Toca no separador Eventos" dispatchTab={props.dispatchTab} />;
  return <div className="space-y-3"><p className="rounded-md border border-border p-3 text-xs text-muted-foreground">Ainda não há eventos publicados, mas em breve os teus professores e bibliotecas vão começar a usar o Folium.</p><Button className="w-full" onClick={props.next}>Continuar</Button></div>;
}

function FinalChapter(props: any) {
  const tree = treeAssetFor(props.theme);
  return <div className="text-center"><img src={tree} alt="Árvore Folium" className="mx-auto h-44 w-44 object-contain opacity-95" style={{ animation: 'folium-branch 2.5s ease-out both' }} /><h2 className="mt-4 font-['Cormorant_Garamond'] text-4xl leading-none text-foreground">{props.heading}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground font-['Josefin_Sans']">{props.body}</p><div className="mt-5 space-y-2 rounded-md border border-border p-3 text-left text-xs text-muted-foreground">{props.libraryName && <p><Check size={13} className="mr-1 inline text-accent" />Criaste a estante: {props.libraryName}</p>}{props.demoBook?.title && <p><Check size={13} className="mr-1 inline text-accent" />Adicionaste o teu primeiro livro: {props.demoBook.title}</p>}{props.themeChanged && <p><Check size={13} className="mr-1 inline text-accent" />Escolheste o tema: {props.currentTheme.name}</p>}{((props.profile as any)?.school_id || props.selectedSchoolName) && <p><Check size={13} className="mr-1 inline text-accent" />Definiste a tua escola: {props.selectedSchoolName || 'Escola definida'}</p>}</div><Button className="mt-5 w-full" onClick={props.completeTutorial}>Entrar no Folium</Button><button onClick={() => props.setShowMap(true)} className="mt-3 text-xs text-muted-foreground hover:text-foreground">Ver resumo do tutorial</button></div>;
}

function ChapterMap(props: any) {
  return <div className="fixed inset-0 z-[130] bg-background/95 p-4" role="dialog" aria-modal="true" aria-label="Resumo do tutorial"><div className="mx-auto max-w-lg rounded-lg border border-border bg-background p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-['Cormorant_Garamond'] text-3xl text-foreground">Resumo do tutorial</h2><button onClick={props.close} className="text-muted-foreground"><X size={18} /></button></div><div className="space-y-2">{chapterNames.map((name, i) => { const status = props.statuses[i]; return <div key={name} className="flex items-center gap-3 rounded-md border border-border p-3"><span className={cn('grid h-7 w-7 place-items-center rounded-full text-xs', status === 'completed' ? 'bg-accent text-accent-foreground' : status === 'skipped' ? 'bg-secondary text-foreground' : 'border border-border text-muted-foreground')}>{status === 'completed' ? <Check size={14} /> : status === 'skipped' ? <CircleDashed size={14} /> : <Circle size={12} />}</span><div className="flex-1"><p className="text-sm text-foreground">Capítulo {i + 1} · {name}</p><p className="text-[11px] text-muted-foreground">{status === 'completed' ? 'Concluído' : status === 'skipped' ? 'Saltado' : 'Ainda não visto'}</p></div><Button size="sm" variant="outline" onClick={() => props.goToStep(i)}>Recomeçar este capítulo</Button></div>; })}</div><Button className="mt-5 w-full" onClick={() => props.goToStep(0)}><HelpCircle size={16} className="mr-2" />Revisitar tutorial</Button></div></div>;
}

export function useFoliumTutorial() {
  const context = useContext(TutorialContext);
  if (!context) throw new Error('useFoliumTutorial must be used within FoliumTutorialProvider');
  return context;
}
